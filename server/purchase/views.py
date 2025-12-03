from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from .models import *
from .serializers import *
from django.db.models import Q
from stocks.models import StockProduct
from decimal import Decimal
from rest_framework.views import APIView
import pandas as pd
from django.db import transaction
from rest_framework.response import Response




class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("cost_category").order_by("-id")
    serializer_class = ExpenseSerializer
    permission_classes = [AllowAny]



class SalaryExpenseViewSet(viewsets.ModelViewSet):
    queryset = SalaryExpense.objects.select_related("staff").order_by("-id")
    serializer_class = SalaryExpenseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(staff__name__icontains=search)
                | Q(salary_month__icontains=search)
                | Q(note__icontains=search)
            )
        return qs



class SupplierPurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all().order_by('-purchase_date')
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]



# ✅ NEW
class PurchasePaymentViewSet(viewsets.ModelViewSet):
    queryset = PurchasePayment.objects.all().order_by('-payment_date')
    serializer_class = PurchasePaymentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]



# ----------------------------
# Supplier Purchase Return
# ----------------------------
# class SupplierPurchaseReturnViewSet(viewsets.ModelViewSet):
#     queryset = PurchaseReturn.objects.all().order_by('-return_date')
#     serializer_class = PurchaseReturnSerializer
#     permission_classes = [IsAuthenticatedOrReadOnly]

#     def get_queryset(self):
#         queryset = super().get_queryset()
#         invoice_no = self.request.query_params.get('invoice_no')
#         if invoice_no:
#             queryset = queryset.filter(purchase_product__purchase__invoice_no=invoice_no)
#         return queryset

#     def perform_create(self, serializer):
#         instance = serializer.save()
#         purchase_product = instance.purchase_product
#         # Update returned_quantity
#         purchase_product.returned_quantity += instance.quantity
#         purchase_product.save()
#         # Update stock
#         stock = StockProduct.objects.filter(
#             company_name=purchase_product.purchase.company_name,
#             part_no=purchase_product.part_no,
#             product=purchase_product.product
#         ).first()
#         if stock:
#             stock.current_stock_quantity = max(stock.current_stock_quantity - instance.quantity, 0)
#             stock.save()






def create_purchase_entry(data):
    try:
        product = Product.objects.get(product_name=data["product"].product_name)
    except Product.DoesNotExist:
        raise ValueError(f"Product not found: {data['product'].product_name}")
    except Exception as e:
        raise ValueError(f"Unexpected error finding product: {str(e)}")

    try:
        purchase, created = Purchase.objects.get_or_create(
            invoice_no=data["invoice_no"],
            purchase_date=data["purchase_date"],
        )
    except Exception as e:
        raise ValueError(f"Error creating Purchase: {str(e)}")

    try:
        purchase_item = PurchaseProduct.objects.create(
            purchase=purchase,
            product=product,
            quantity=data["quantity"],
            purchase_price=data["purchase_price"],
            total_price=data["total_price"],
        )
    except Exception as e:
        raise ValueError(f"Error creating PurchaseProduct: {str(e)}")

    return purchase_item




def update_stock(product, weight, quantity, price, total_price, sale_quantity, current_stock, remarks):
    try:
        stock, created = StockProduct.objects.get_or_create(
            product=product,
            defaults={
                "net_weight": weight,
                "purchase_quantity": quantity,
                "sale_quantity": sale_quantity,
                "damage_quantity": 0,
                "current_stock_quantity": current_stock,
                "purchase_price": price,
                "sale_price": price,
                "current_stock_value": total_price,
                "remarks": remarks,
            }
        )
    except Exception as e:
        raise ValueError(f"Error fetching/creating stock: {str(e)}")

    try:
        if not created:
            stock.purchase_quantity += quantity
            stock.current_stock_quantity += quantity
            stock.purchase_price = price
            stock.current_stock_value += total_price
            stock.save()
    except Exception as e:
        raise ValueError(f"Error updating stock: {str(e)}")

    return stock




def to_int(value):
    try:
        if pd.isna(value):
            return 0
        return int(float(value))
    except:
        return 0




def to_float(value):
    try:
        if pd.isna(value):
            return 0.0
        return float(value)
    except:
        return 0.0




class UploadStockExcelView(APIView):
    def post(self, request):
        file = request.FILES.get("xl_file")
        invoice_no = request.data.get("invoice_no", "AUTO_GENERATE")
        purchase_date = request.data.get("purchase_date")

        if not file:
            return Response({"error": "No file uploaded"}, status=400)
        if not file.name.endswith(".xlsx"):
            return Response({"error": "Please upload an .xlsx file"}, status=400)

        # Read Excel
        try:
            df = pd.read_excel(file, engine="openpyxl")
        except Exception as e:
            return Response({"error": f"Invalid Excel file: {str(e)}"}, status=400)

        with transaction.atomic():
            for index, row in df.iterrows():
                try:
                    # Parse fields safely
                    product_code = str(row.get("CODE", "")).strip()
                    product_name = str(row.get("Product Name", "")).strip()
                    remarks = str(row.get("Remarks", "")).strip()

                    purchase_quantity = to_int(row.get("Prev QTY"))
                    purchase_price = to_float(row.get("Prev Rate"))
                    total_price = to_float(row.get("Total Cost"))
                    sale_quantity = to_int(row.get("Sales"))
                    current_stock = to_int(row.get("Present Stock"))
                    weight = to_float(row.get("Weight"))

                    print(f"✔ Row {index} parsed successfully")

                except Exception as e:
                    print("❌ ERROR parsing row:", index)
                    print("Row data:", row)
                    print("Exception:", e)
                    return Response(
                        {"error": f"Error parsing row {index}: {str(e)}"},
                        status=400
                    )

                # Create or update product
                try:
                    product, created = Product.objects.get_or_create(
                        product_name=product_name,
                        defaults={
                            "product_code": product_code,
                            "price": purchase_price,
                        }
                    )

                    if not created:
                        product.price = purchase_price
                        product.save()

                except Exception as e:
                    return Response(
                        {"error": f"Error creating/updating product at row {index}: {str(e)}"},
                        status=400
                    )

                # Update stock safely
                try:
                    update_stock(
                        product=product,
                        weight=weight,
                        quantity=purchase_quantity,
                        price=purchase_price,
                        sale_quantity=sale_quantity,
                        current_stock=current_stock,
                        total_price=total_price,
                        remarks=remarks
                    )
                except Exception as e:
                    return Response(
                        {"error": f"Error updating stock at row {index}: {str(e)}"},
                        status=400
                    )

                # Create purchase entry safely
                try:
                    create_purchase_entry({
                        "invoice_no": invoice_no,
                        "purchase_date": purchase_date,
                        "product": product,
                        "quantity": purchase_quantity,
                        "purchase_price": purchase_price,
                        "total_price": total_price,
                    })
                except Exception as e:
                    return Response(
                        {"error": f"Error creating purchase entry at row {index}: {str(e)}"},
                        status=400
                    )

        return Response({"message": "Stock uploaded successfully"}, status=200)
