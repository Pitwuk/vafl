from django.db import models


class Order(models.Model):
    orderNum = models.CharField(max_length=16, unique=True)
    datetime = models.DateTimeField(auto_now_add=True)
    first = models.CharField(max_length=32, default='')
    last = models.CharField(max_length=32, default='')
    email = models.EmailField(max_length=64, default='')
    address = models.CharField(max_length=128, default='')
    city = models.CharField(max_length=32, default='')
    state = models.CharField(max_length=2, default='')
    zipCode = models.CharField(max_length=5)
    boards = models.CharField(max_length=65536, default ='')
    shipping = models.CharField(max_length=32, default = "")