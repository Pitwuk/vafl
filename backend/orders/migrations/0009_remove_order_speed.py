# Generated by Django 3.1.1 on 2020-10-02 00:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0008_auto_20201001_2028'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='speed',
        ),
    ]
