from rest_framework import routers
from .api import OrderViewSet, GerberViewSet

router = routers.DefaultRouter()
router.register('api/orders', OrderViewSet, 'orders')
router.register('api/files', GerberViewSet, 'files')

urlpatterns = router.urls
