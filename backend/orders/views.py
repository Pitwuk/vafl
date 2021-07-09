from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.http.multipartparser import MultiPartParser
from django.http import HttpResponse, JsonResponse
from django.utils.encoding import smart_str
import json
import zipfile
import base64
import os
import shutil
import mimetypes
from collections import OrderedDict
from PIL import Image
from gerber_renderer import Gerber
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM
import stripe
from decouple import config
from .models import Order, SiteVars, Account
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import mysql.connector
from datetime import datetime
import copy


def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'token': token})


@csrf_exempt
def files(request):
    if request.method == 'POST':
        uploaded_file = request.FILES['gerber']
        if uploaded_file.name[-4:] == '.zip':
            print('Recieved Gerber files')
            # save zip
            orderNum = request.POST['orderNum'] + '.zip'
            fs = FileSystemStorage(location='./orders/gerbers/')
            fs.save(orderNum, uploaded_file)

            #render board svgs
            board = Gerber.Board('./orders/gerbers/' + orderNum, verbose=True)

            return JsonResponse(board.get_files())
        else:
            return HttpResponse(status=400)


def concatenate_pcb():
    # splice images together
    top = Image.open('./gerber_files/top.png')
    bottom = Image.open('./gerber_files/bottom.png')
    if top.width <= top.height * 2:
        combined = Image.new('RGB', (top.width + bottom.width, top.height))
        combined.paste(top, (0, 0))
        combined.paste(bottom, (top.width, 0))
    else:
        combined = Image.new('RGB', (top.width, top.height + bottom.height))
        combined.paste(top, (0, 0))
        combined.paste(bottom, (0, top.height))
    return combined


@csrf_exempt
def create_charge(request):
    post_data = json.loads(request.body)
    amount = round(float(post_data['price']) * 100)
    stripe.api_key = config('STRIPE_DEV_SEC')
    charge = stripe.Charge.create(amount=amount,
                                  currency='usd',
                                  card=post_data['token'],
                                  description=post_data['orderNum'])
    response_object = {'status': 'success', 'charge': charge}
    return JsonResponse(response_object)


@csrf_exempt
def order_data(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        try:
            order = Order()
            order.orderNum = body['orderNum']
            order.first = body['first_name']
            order.last = body['last_name']
            order.email = body['email']
            order.address = body['address']
            order.city = body['city']
            order.state = body['state']
            order.country = body['country']
            order.zipCode = body['zipCode']
            order.boards = str(body['boards'])
            order.shipping = body['shipping']

            order.save()
            print('order added to database')
        except Exception as e:
            print(e)
            print('error adding order to database')
        try:
            #email order confirmation
            msg = MIMEMultipart("alternative")
            msg['Subject'] = 'VAFL PCB Order Success'
            msg['From'] = 'vaflpcb@gmail.com'
            msg['To'] = body['email']

            with open('./orders/emailTemplatePlain.txt') as template:
                template = template.read()
                template = template.replace('X--XX--XX--XX--X',
                                            body['orderNum'])
                plain = MIMEText(template, "plain")

            with open('./orders/emailTemplateHTML.txt') as template:
                template = template.read()
                template = template.replace('X--XX--XX--XX--X',
                                            body['orderNum'])
                fancy = MIMEText(template, "html")

            msg.attach(plain)
            msg.attach(fancy)

            port = 465
            password = config('EMAIL_PASSWORD')

            context = ssl.create_default_context()

            with smtplib.SMTP_SSL("smtp.gmail.com", port,
                                  context=context) as server:
                server.login(msg['From'], password)
                server.sendmail(msg['From'], msg['To'], msg.as_string())
                server.quit()

            #email manufacturing
            msg = MIMEMultipart("alternative")
            msg['Subject'] = 'New Order '
            msg['From'] = 'vaflpcb@gmail.com'
            msg['To'] = 'vaflpcb@gmail.com'
            template = str(body['boards'])
            plain = MIMEText(template, "plain")
            msg.attach(plain)
            with smtplib.SMTP_SSL("smtp.gmail.com", port,
                                  context=context) as server:
                server.login(msg['From'], password)
                server.sendmail(msg['From'], msg['To'], msg.as_string())
                server.quit()
            print('email sent')
        except Exception as e:
            print(e)
            print('error sending email')

        return HttpResponse(status=200)
    elif request.method == 'PUT':
        #get order
        body = json.loads(request.body)
        try:
            for p in Order.objects.raw(
                    'SELECT * FROM orders_order WHERE orderNum ="' +
                    body['orderNum'] + '"'):
                order = copy.deepcopy(p).__dict__
            del order['_state']
            order['datetime'] = order['datetime'].strftime(
                "%m/%d/%Y, %H:%M:%S")
            print(order['boards'])
            response_object = json.dumps(order)
            return JsonResponse(response_object, safe=False)

        except Exception as e:
            print(e)
            print('error making sql query')
            return HttpResponse(status=400)

    else:
        return HttpResponse(status=400)


@csrf_exempt
def store_image(request):
    request_body = json.loads(request.body)
    if request.method == 'POST':
        try:
            uploaded_file = request_body['img']
            orderNum = request_body['orderNum'] + '.svg'
            img_file = open('./orders/images/' + orderNum, 'w')
            img_file.write(uploaded_file)
            img_file.close()
            return HttpResponse(status=200)
        except:
            return HttpResponse(status=400)


@csrf_exempt
def site_vars(request):
    if request.method == 'GET':
        try:
            site_arr = []
            for p in Order.objects.raw(
                    'SELECT * FROM orders_sitevars WHERE site_pass="ggegeege"'
            ):
                site = copy.deepcopy(p).__dict__
                del site['_state']


            response_object = json.dumps(OrderedDict(sorted(site.items())))

            return JsonResponse(response_object, safe=False)

        except Exception as e:
            print(e)
            print('error making query')
            return HttpResponse(status=400)
    else:
        body = json.loads(request.body)
        if request.method == 'POST' and body['password'] == config(
                'ORDER_PASS'):
            try:
                SiteVars.objects.filter(site_pass="ggegeege").update(
                    first_time_user_sale=body['first_time_user_sale'])
                SiteVars.objects.filter(site_pass="ggegeege").update(
                    colors=body['colors'])
                SiteVars.objects.filter(site_pass="ggegeege").update(
                    silk_colors=body['silk_colors'])
                SiteVars.objects.filter(site_pass="ggegeege").update(
                    fast_time=body['fast_time'])
                SiteVars.objects.filter(site_pass="ggegeege").update(
                    price_per_sqcm=body['price_per_sqcm'])
                SiteVars.objects.filter(site_pass="ggegeege").update(
                    promo_codes=body['promo_codes'])
                SiteVars.objects.filter(site_pass="ggegeege").update(
                    fast_multiplier=body['fast_multiplier'])
                SiteVars.objects.filter(site_pass="ggegeege").update(
                    turbo_multiplier=body['turbo_multiplier'])
                return HttpResponse(status=200)
            except Exception as e:
                print(e)
                print('error making query')
                return HttpResponse(status=400)
        elif request.method == 'PUT' and body['password'] == config(
                'ORDER_PASS'):
            try:
                site = SiteVars()
                site.site_pass = "ggegeege"
                site.first_time_user_sale = ''
                site.colors = ''
                site.silk_colors = ''
                site.fast_time = ''
                site.price_per_sqcm = ''
                site.promo_codes = ''
                site.fast_multiplier = ''
                site.turbo_multiplier = ''
                site.save()
                return HttpResponse(status=200)
            except Exception as e:
                print(e)
                return HttpResponse(status=400)


@csrf_exempt
def account(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        #create account
        if body['action'] == 'new':
            try:
                print(body['username'])
                exists = False
                for p in Order.objects.raw(
                        'SELECT * FROM orders_account WHERE username ="' +
                        body['username'] + '"'):
                    exists = True
                for p in Order.objects.raw(
                        'SELECT * FROM orders_account WHERE email ="' +
                        body['email'] + '"'):
                    exists = True
                if (not exists):
                    acc = Account()
                    acc.username = body['username']
                    acc.password = body['password']
                    acc.first = body['first']
                    acc.last = body['last']
                    acc.email = body['email']
                    acc.address = body['address']
                    acc.city = body['city']
                    acc.state = body['state']
                    acc.zipCode = body['zip']
                    acc.num_orders = 0
                    acc.save()
                else:
                    return HttpResponse(status=409)

                return HttpResponse(status=200)
            except Exception as e:
                print(e)
                print('error making query')
                return HttpResponse(status=400)
        elif body['action'] == 'mod':
            try:
                Account.objects.filter(username=body['username']).update(
                    first=body['first'])
                Account.objects.filter(username=body['username']).update(
                    last=body['last'])
                Account.objects.filter(username=body['username']).update(
                    email=body['email'])
                Account.objects.filter(username=body['username']).update(
                    address=body['address'])
                Account.objects.filter(username=body['username']).update(
                    city=body['city'])
                Account.objects.filter(username=body['username']).update(
                    state=body['state'])
                Account.objects.filter(username=body['username']).update(
                    zipCode=body['zip'])
                return HttpResponse(status=200)
            except Exception as e:
                print(e)
                print('error making query')
                return HttpResponse(status=400)
        elif body['action'] == 'get':
            try:
                for p in Order.objects.raw(
                        'SELECT * FROM orders_account WHERE username ="' +
                        body['username'] + '"'):
                    acc = copy.deepcopy(p).__dict__
                    del acc['_state']

                if (acc['password'] != body['password']):
                    return HttpResponse(status=400)

                response_object = json.dumps(acc)

                return JsonResponse(response_object, safe=False)

            except Exception as e:
                print(e)
                print('error making query')
                return HttpResponse(status=400)
        elif body['action'] == 'del':
            try:
                Account.objects.filter(username=body['username']).delete()
                return HttpResponse(status=200)
            except Exception as e:
                print(e)
                return HttpResponse(status=400)
        elif body['action'] == 'inc':
            try:
                Account.objects.filter(username=body['username']).update(
                    num_orders=body['num'] + 1)
                return HttpResponse(status=200)
            except Exception as e:
                print(e)
                print('error making query')
                return HttpResponse(status=200)
    return HttpResponse(status=400)


@csrf_exempt
def admin(request):
    request_body = json.loads(request.body)
    print(request_body)
    if request.method == 'POST' and request_body['password'] == config(
            'ORDER_PASS'):
        try:
            order_arr = []
            for p in Order.objects.raw('SELECT * FROM orders_order'):
                order = copy.deepcopy(p).__dict__
                del order['_state']
                order['datetime'] = order['datetime'].strftime(
                    "%m/%d/%Y, %H:%M:%S")
                order_arr.append(order)

            response_object = json.dumps(order_arr)

            return JsonResponse(response_object, safe=False)
            # return HttpResponse(status=200)

        except Exception as e:
            print(e)
            print('error making query')
            return HttpResponse(status=400)
    elif request.method == 'PUT' and request_body['password'] == config(
            'ORDER_PASS'):
        if request_body['operation'] == 'adv':
            try:
                for p in Order.objects.raw(
                        'SELECT * FROM orders_order WHERE orderNum ="' +
                        request_body['parentNum'] + '"'):
                    order = p.__dict__
                    order_arr = order['boards'][1:-1].replace(
                        '},', '},***').split(',***')
                    for i, h in enumerate(order_arr):
                        h = json.loads(h.replace('\'', '"'))
                        if h['orderNum'] == request_body['orderNum']:
                            h['stage'] = request_body['stage']
                            order_arr[i] = json.dumps(h).replace('"', '\'')
                            break
                board_str = '['
                for m in order_arr:
                    board_str += m + ', '
                board_str = board_str[:-2] + ']'
                Order.objects.filter(
                    orderNum=request_body['parentNum']).update(
                        boards=board_str)

                return HttpResponse(status=200)

            except Exception as e:
                print(e)
                print('error making query')
                return HttpResponse(status=400)
        elif request_body['operation'] == 'del':
            for p in Order.objects.raw(
                    'SELECT * FROM orders_order WHERE orderNum ="' +
                    request_body['parentNum'] + '"'):
                order = p.__dict__
                order_arr = order['boards'][1:-1].replace(
                    '},', '},***').split(',***')
                for i, h in enumerate(order_arr):
                    h = json.loads(h.replace('\'', '"'))
                    try:
                        os.remove(
                            os.path.join('./orders/gerbers',
                                         h['orderNum'] + '.zip'))
                    except:
                        print('gerber not found')
                    try:
                        os.remove(
                            os.path.join('./orders/images',
                                         h['orderNum'] + '.png'))
                    except:
                        print('image not found')

            Order.objects.filter(orderNum=request_body['parentNum']).delete()
            return HttpResponse(status=200)
        elif request_body['operation'] == 'clr':
            Order.objects.all().delete()
            filelist = [f for f in os.listdir('./orders/gerbers')]
            for f in filelist:
                os.remove(os.path.join('./orders/gerbers', f))
            filelist = [f for f in os.listdir('./orders/images')]
            for f in filelist:
                os.remove(os.path.join('./orders/images', f))
            # os.mkdir('./orders/gerbers')
            # os.mkdir('./orders/images')
            # shutil.rmtree('./gerber_files')
            return HttpResponse(status=200)
    else:
        return HttpResponse(status=400)