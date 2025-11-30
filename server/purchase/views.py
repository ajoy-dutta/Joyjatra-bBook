from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from .models import *
from .serializers import *
from django.db.models import Q



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
