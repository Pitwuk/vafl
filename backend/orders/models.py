from django.db import models


class Order(models.Model):
    orderNum = models.CharField(max_length=16, unique=True)
    datetime = models.DateTimeField(auto_now_add=True)
    first = models.CharField(max_length=32, default='')
    last = models.CharField(max_length=32, default='')
    email = models.EmailField(max_length=64, default='')
    address = models.CharField(max_length=128, default='')
    city = models.CharField(max_length=64, default='')
    state = models.CharField(max_length=32, default='')
    country = models.CharField(max_length=32, default='')
    zipCode = models.CharField(max_length=16)
    boards = models.CharField(max_length=65536, default='')
    shipping = models.CharField(max_length=32, default="")


class SiteVars(models.Model):
    site_pass = models.CharField(max_length=8)  #password/id for changing vars
    first_time_user_sale = models.CharField(
        max_length=8)  #Date of end of first time user sale MM/DD/YY
    colors = models.CharField(
        max_length=64,
        default='Red,White,Blue')  #'color1,color2-,color3'  color2 disabled
    silk_colors = models.CharField(max_length=32, default='White,Black')
    fast_time = models.CharField(max_length=16, default='24 hours')
    price_per_sqcm = models.CharField(max_length=5, default='0.1')
    promo_codes = models.CharField(
        max_length=256)  #'code,0.10;code2,0.20' code1 10% off, code2 20% off


class Account(models.Model):
    username = models.CharField(max_length=32)
    password = models.CharField(max_length=32)
    first = models.CharField(max_length=32, default='')
    last = models.CharField(max_length=32, default='')
    email = models.EmailField(max_length=64, default='')
    address = models.CharField(max_length=128, default='')
    city = models.CharField(max_length=32, default='')
    state = models.CharField(max_length=2, default='')
    zipCode = models.CharField(max_length=5)
    num_orders = models.IntegerField()
