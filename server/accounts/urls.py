from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()
router.register("accounts", AccountViewSet)
router.register("manual-journals", JournalEntryViewSet)
router.register("cash-accounts", CashAccountViewSet)
router.register("bank-accounts", BankAccountViewSet)


urlpatterns = router.urls
