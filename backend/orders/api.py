from .models import Order
from rest_framework import viewsets, permissions
from .serializers import OrderSerializer

# Order Viewset


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = OrderSerializer
