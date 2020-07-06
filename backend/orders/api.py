from .models import Order, Gerber
from rest_framework import viewsets, permissions
from .serializers import OrderSerializer, GerberSerializer

# Order Viewset


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = OrderSerializer

# Gerber Viewset


class GerberViewSet(viewsets.ModelViewSet):
    queryset = Gerber.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = GerberSerializer
