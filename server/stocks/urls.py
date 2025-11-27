from rest_framework.routers import DefaultRouter
from .views import ( ProductViewSet,StockViewSet)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'stocks', StockViewSet)

urlpatterns = router.urls