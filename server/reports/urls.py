from django.urls import path
from .views import *

urlpatterns = [
    path('sale-report/', SaleReportView.as_view(), name='sale-report'),
    path('purchase-report/', CombinedPurchaseView.as_view(), name="purchase-report"),
    path('income-report/', CombinedIncomeView.as_view(), name="income-report"),
    path('expense-report/', CombinedExpanseView.as_view(), name="expense-report"),
    path('profit-loss/', ProfitLossReportView.as_view(), name="profit-loss" ),
    path('balance-sheet/', BalanceSheetReportView.as_view(), name="balance-sheet" ),
]