# Generated by Django 3.0.8 on 2020-07-04 16:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Gerber',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('orderNum', models.CharField(max_length=16, unique=True)),
                ('gerber', models.FileField(upload_to='orders/gerbers/')),
            ],
        ),
        migrations.RemoveField(
            model_name='order',
            name='gerber',
        ),
    ]