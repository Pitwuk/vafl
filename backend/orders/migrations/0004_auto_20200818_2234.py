# Generated by Django 3.0.8 on 2020-08-19 02:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_auto_20200801_1738'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='request',
            field=models.CharField(default='', max_length=512),
        ),
        migrations.AddField(
            model_name='order',
            name='status',
            field=models.CharField(default='Processing', max_length=16),
        ),
    ]
