# Generated by Django 3.1.1 on 2020-10-02 00:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_remove_order_speed'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='boards',
            field=models.CharField(default={}, max_length=65536),
        ),
    ]
