from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly,IsAuthenticated
from rest_framework.response import Response
from .models import *
from .serializers import *
from rest_framework.decorators import action
from django.db import IntegrityError, transaction
from decimal import Decimal
from django.db import transaction as db_transaction
from django.utils.dateparse import parse_date
from .accounting import create_asset_journal
from accounts.service import update_balance

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

        # Filter by business_category
        business_category = params.get("business_category")
        if business_category:
            try:
                qs = qs.filter(business_category_id=int(business_category))
            except ValueError:
                return qs.none()

        # Filter by product name
        productname = params.get("productname") or params.get("product_name")
        if productname:
            qs = qs.filter(name__icontains=productname)

        # Filter by date range
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

    @db_transaction.atomic
    def perform_create(self, serializer):
        asset = serializer.save()
        create_asset_journal(asset)

        # Update balance
        if asset.total_price:
            update_balance(
                business_category=asset.business_category,
                payment_mode=asset.payment_mode.name.upper() if asset.payment_mode else "CASH",
                amount=asset.total_price,
                is_credit=False,  # asset purchase → money out
                bank=asset.bank,
            )

    @db_transaction.atomic
    def perform_update(self, serializer):
        old_asset = self.get_object()
        old_total = old_asset.total_price or Decimal(0)

        # Reverse old balance
        update_balance(
            business_category=old_asset.business_category,
            payment_mode=old_asset.payment_mode.name.upper() if old_asset.payment_mode else "CASH",
            amount=old_total,
            is_credit=True,  # reverse previous money out
            bank=old_asset.bank,
        )

        # Delete old journal entry
        if old_asset.journal_entry:
            old_asset.journal_entry.delete()

        # Save new asset values
        asset = serializer.save()
        create_asset_journal(asset)

        # Apply new balance
        if asset.total_price:
            update_balance(
                business_category=asset.business_category,
                payment_mode=asset.payment_mode.name.upper() if asset.payment_mode else "CASH",
                amount=asset.total_price,
                is_credit=False,
                bank=asset.bank,
            )

    @db_transaction.atomic
    def perform_destroy(self, instance):
        # Reverse balance
        if instance.total_price:
            update_balance(
                business_category=instance.business_category,
                payment_mode=instance.payment_mode.name.upper() if instance.payment_mode else "CASH",
                amount=instance.total_price,
                is_credit=True,
                bank=instance.bank,
            )

        # Delete journal entry
        if instance.journal_entry:
            instance.journal_entry.delete()

        super().perform_destroy(instance)
