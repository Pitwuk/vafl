from django.contrib import admin
from django.urls import path, include
from orders import views

urlpatterns = [
    path('', include('orders.urls')),
    path('api/files/', views.files, name='files')
]
