# server/purchase/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expenses')
router.register(r'salary-expenses', SalaryExpenseViewSet, basename='salary-expenses')
router.register(r'purchases', PurchaseViewSet, basename='purchases')
router.register(r'purchase-payments', PurchasePaymentViewSet, basename='purchase-payment')
# router.register(r'supplier-purchase-returns', SupplierPurchaseReturnViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('upload-order-excel/', UploadStockExcelView.as_view(), name='upload-stock-excel'),
]