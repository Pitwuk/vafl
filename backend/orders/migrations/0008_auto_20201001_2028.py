# Generated by Django 3.1.1 on 2020-10-02 00:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0007_auto_20201001_2027'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='color',
        ),
        migrations.RemoveField(
            model_name='order',
            name='quantity',
        ),
    ]
