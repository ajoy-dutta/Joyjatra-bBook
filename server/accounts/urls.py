from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register("opening-balances", OpeningBalanceViewSet)
router.register("cash-accounts", CashAccountViewSet)
router.register("bank-accounts", BankAccountViewSet)

urlpatterns = router.urls
