from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, OpeningBalanceViewSet

router = DefaultRouter()
router.register("accounts", AccountViewSet)
router.register("opening-balance", OpeningBalanceViewSet)

urlpatterns = router.urls
