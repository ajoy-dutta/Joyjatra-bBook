from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly,IsAuthenticated
from rest_framework.response import Response
from .models import *
from .serializers import *
from rest_framework.decorators import action
from django.db import IntegrityError, transaction
from decimal import Decimal
from django.utils.dateparse import parse_date


# ----------------------------
# Product ViewSet
# ----------------------------
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('business_category').all()  # Fixed: removed non-existent fields
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filterset_fields = ['business_category']  # Fixed: only existing fields

    def get_queryset(self):
        qs = super().get_queryset()

        # Filter by business_category (FK)
        business_category = self.request.query_params.get('business_category')
        if business_category:
            qs = qs.filter(business_category_id=business_category)

        # Filter by product code
        product_code = self.request.query_params.get('product_code')
        if product_code:
            qs = qs.filter(product_code__iexact=product_code)

        # Filter by product name
        product_name = self.request.query_params.get('product_name')
        if product_name:
            qs = qs.filter(product_name__icontains=product_name)

        return qs

    def create(self, request, *args, **kwargs):
        """Handle product creation with proper validation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Handle product update with proper validation"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)



# ----------------------------
# Stock ViewSet
# ----------------------------
class StockViewSet(viewsets.ModelViewSet):
    queryset = StockProduct.objects.select_related('product').all()
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


    def get_queryset(self):
        qs = super().get_queryset()

        # Filter by business_category
        business_category = self.request.query_params.get('business_category')
        if business_category:
            qs = qs.filter(business_category_id=business_category)

        # Filter by product
        product = self.request.query_params.get('product')
        if product:
            qs = qs.filter(product_id=product)

        # Filter by low stock (custom filter)
        low_stock = self.request.query_params.get('low_stock')
        if low_stock and low_stock.lower() == 'true':
            qs = qs.filter(current_stock_quantity__lt=10)  # Adjust threshold as needed

        # Filter by out of stock
        out_of_stock = self.request.query_params.get('out_of_stock')
        if out_of_stock and out_of_stock.lower() == 'true':
            qs = qs.filter(current_stock_quantity=0)

        return qs


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response(
                {"error": "Stock already exists for this product"},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(
                instance,
                data=request.data,
                partial=partial
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)

        except Exception as e:
            import traceback
            print("🔥 ERROR OCCURRED 🔥")
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=500
            )



    @action(detail=True, methods=['patch'], url_path="set-damage-quantity")
    def set_damage_quantity(self, request, pk=None):
        """Custom action to set damage quantity"""
        stock = self.get_object()
        damage_qty = request.data.get("damage_quantity")

        # Validate
        try:
            damage_qty = int(damage_qty)
        except (TypeError, ValueError):
            return Response(
                {"error": "damage_quantity must be a valid number"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if damage_qty < 0:
            return Response(
                {"error": "damage_quantity cannot be negative"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if damage_qty > stock.current_stock_quantity:
            return Response(
                {"error": "Damage quantity cannot exceed current stock quantity"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update the stock - let serializer handle calculations
        stock.damage_quantity += damage_qty
        stock.current_stock_quantity = max(
            stock.purchase_quantity - stock.sale_quantity - stock.damage_quantity, 
            0
        )
        stock.current_stock_value = stock.current_stock_quantity * stock.purchase_price
        stock.save()

        return Response(
            {
                "message": "Damage quantity updated successfully", 
                "data": StockSerializer(stock).data
            },
            status=status.HTTP_200_OK
        )
     
     
    def get_queryset(self):
      qs = super().get_queryset()
      business_category = self.request.query_params.get("business_category")
      if business_category:
          qs = qs.filter(business_category_id=business_category)
      return qs






class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by("-id")
    serializer_class = AssetSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        # business_category (existing behavior)
        business_category = params.get("business_category")
        if business_category:
            try:
                qs = qs.filter(business_category_id=int(business_category))
            except ValueError:
                return qs.none()

        # product name search (frontend uses `productname` param)
        productname = params.get("productname") or params.get("product_name")
        if productname:
            qs = qs.filter(name__icontains=productname)

        # date range filters (assume purchase_date)
        from_date = params.get("from_date")
        to_date = params.get("to_date")

        if from_date:
            parsed = parse_date(from_date)
            if parsed:
                qs = qs.filter(purchase_date__gte=parsed)

        if to_date:
            parsed = parse_date(to_date)
            if parsed:
                qs = qs.filter(purchase_date__lte=parsed)

        return qs

    # @transaction.atomic
    # def create(self, request, *args, **kwargs):
       
    #     name = request.data.get("name")
    #     business_category = request.data.get("business_category")
    #     qty = int(request.data.get("total_qty", 0))
    #     unit_price = request.data.get("unit_price")
    #     unit_price = Decimal(unit_price) if unit_price not in ("", None) else None

    #     if not name or not business_category:
    #         return Response(
    #             {"detail": "name and business_category are required"},
    #             status=status.HTTP_400_BAD_REQUEST,
    #         )

    #     try:
    #         asset = Asset.objects.select_for_update().get(
    #             name=name,
    #             business_category_id=business_category,
    #         )


    #         # ✅ Update existing asset
    #         if qty:
    #            asset.total_qty += qty
              
    #         if unit_price is not None:
    #             asset.unit_price = unit_price
             
    #         asset.save()

    #         serializer = self.get_serializer(asset)
    #         return Response(serializer.data, status=status.HTTP_200_OK)

    #     except Asset.DoesNotExist:
    #         # ✅ Create new asset
    #         serializer = self.get_serializer(data=request.data)
    #         serializer.is_valid(raise_exception=True)

    #         asset = serializer.save()

    #         return Response(
    #             AssetSerializer(asset).data,
    #             status=status.HTTP_201_CREATED,
    #         )


    



class RequisitionViewSet(viewsets.ModelViewSet):
    queryset = Requisition.objects.all().order_by("-id")
    serializer_class = RequisitionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["requisition_no", "requisite_name"]
    ordering_fields = ["id", "created_at", "requisition_date"]

    def get_queryset(self):
        qs = super().get_queryset()
        bc = self.request.query_params.get("business_category")
        status_q = self.request.query_params.get("status")
        if bc:
            qs = qs.filter(business_category_id=bc)
        if status_q in ("true", "false"):
            qs = qs.filter(status=(status_q == "true"))
        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """
        POST /requisitions/{id}/approve/
        Deduct stock and mark requisition approved.
        """
        try:
            with transaction.atomic():
                req = Requisition.objects.select_for_update().get(pk=pk)

                if req.status:
                    return Response(
                        {"detail": "Already approved."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # ✅ IMPORTANT: requisition must have a product FK
                if not getattr(req, "product_id", None):
                    return Response(
                        {"detail": "This requisition has no product selected. Please edit and select a product first."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                stock_row = Stock.objects.select_for_update().filter(
                    business_category=req.business_category,
                    product_id=req.product_id,
                ).first()

                if not stock_row:
                    return Response(
                        {"detail": "Stock entry not found for this product in this business category."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # ✅ If your stock field is not `quantity`, change it here
                if stock_row.quantity < req.item_number:
                    return Response(
                        {"detail": f"Insufficient stock. Available: {stock_row.quantity}, Required: {req.item_number}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                Stock.objects.filter(id=stock_row.id).update(
                    quantity=F("quantity") - req.item_number
                )

                req.status = True
                req.save(update_fields=["status"])

                return Response(RequisitionSerializer(req).data, status=status.HTTP_200_OK)

        except Exception as e:
            # return real error message instead of silent 500
            return Response(
                {"detail": f"Approve failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
