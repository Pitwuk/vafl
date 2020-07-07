from django.db import models


class Order(models.Model):
    orderNum = models.CharField(max_length=16, unique=True)
    datetime = models.DateTimeField(auto_now_add=True)
    first = models.CharField(max_length=128, default='')
    last = models.CharField(max_length=128, default='')
    email = models.EmailField(max_length=128, default='')
    address = models.CharField(max_length=128, default='')
    city = models.CharField(max_length=128, default='')
    state = models.CharField(max_length=2, default='')
    zipCode = models.IntegerField(default=00000)
    quantity = models.IntegerField(default=1)
    speed = models.CharField(max_length=8, default='')
    color = models.CharField(max_length=5, default='')
    layers = models.IntegerField(default=2)


# class Gerber(models.Model):
#     orderNum = models.CharField(max_length=16, unique=True)
#     gerber = models.FileField(upload_to='orders/gerbers/')
