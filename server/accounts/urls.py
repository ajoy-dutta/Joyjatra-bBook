from rest_framework.routers import DefaultRouter
from .views import *
from django.urls import path


router = DefaultRouter()
router.register("accounts", AccountViewSet)
router.register("manual-journals", JournalEntryViewSet)
router.register("bank-accounts", BankAccountViewSet)


urlpatterns = [
    path("cash-balance/", CashBalanceView.as_view(), name="cash-balance"),
]

urlpatterns += router.urls

