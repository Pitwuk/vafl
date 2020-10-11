from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from orders import views

urlpatterns = [
    path('api/admin/', views.admin),
    path('api/orders/', views.order_data),
    path('api/api/files/', views.files),
    path('api/charge/', views.create_charge),
    path('api/upload_image/', views.store_image),
    path('api/sitevars/', views.site_vars),
    path('api/get-token/', views.get_csrf_token)
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
