from rest_framework.routers import DefaultRouter
from .views import ( ProductViewSet,StockViewSet, AssetViewSet)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'stocks', StockViewSet)
router.register(r'assets', AssetViewSet)

urlpatterns = router.urls
