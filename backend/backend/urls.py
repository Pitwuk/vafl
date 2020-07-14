from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from orders import views

urlpatterns = [
    path('', include('orders.urls')),
    path('api/files/', views.files, name='files'),
    path('api/charge/', views.create_charge, name='charge')
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
