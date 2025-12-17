from rest_framework.routers import DefaultRouter
from .views import ( ProductViewSet,StockViewSet, AssetViewSet, RequisitionViewSet)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'stocks', StockViewSet)
router.register(r'assets', AssetViewSet)
router.register(r"requisitions", RequisitionViewSet)
urlpatterns = router.urls
