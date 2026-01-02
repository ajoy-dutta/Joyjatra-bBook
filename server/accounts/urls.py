from rest_framework.routers import DefaultRouter
from .views import OpeningBalanceViewSet

router = DefaultRouter()
router.register("opening-balances", OpeningBalanceViewSet)

urlpatterns = router.urls
