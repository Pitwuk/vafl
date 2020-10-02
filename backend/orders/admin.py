from django.contrib import admin
from .models import Order

class OrderAdmin(admin.ModelAdmin): 
    list_display = ('first', 'datetime') 
  
    def active(self, obj): 
        return obj.is_active == 1
  
    active.boolean = True
admin.site.register(Order, OrderAdmin)
