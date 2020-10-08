from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.http.multipartparser import MultiPartParser
from django.http import HttpResponse, JsonResponse
from django.utils.encoding import smart_str
import json
import zipfile
import base64
import os
import shutil
import mimetypes
from PIL import Image
from gerber_renderer import Gerber
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM
import stripe
from decouple import config
from .models import Order
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import mysql.connector
from datetime import datetime
import copy


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
            board = Gerber.Board('./orders/gerbers/'+orderNum, verbose=True)
            

            return JsonResponse(board.get_files())
        else:
            return HttpResponse(status=400)

def concatenate_pcb():
    # splice images together
    top = Image.open('./gerber_files/top.png')
    bottom = Image.open('./gerber_files/bottom.png')
    if top.width <= top.height*2:
        combined = Image.new('RGB', (top.width + bottom.width, top.height))
        combined.paste(top, (0, 0))
        combined.paste(bottom, (top.width, 0))
    else:
        combined = Image.new('RGB', (top.width, top.height+bottom.height))
        combined.paste(top, (0, 0))
        combined.paste(bottom, (0, top.height))
    return combined

@csrf_exempt
def create_charge(request):
    post_data = json.loads(request.body)
    amount = round(float(post_data['price']) * 100)
    stripe.api_key = config('STRIPE_DEV_SEC')
    charge = stripe.Charge.create(
        amount=amount,
        currency='usd',
        card=post_data['token'],
        description=post_data['orderNum']
    )
    response_object = {
        'status': 'success',
        'charge': charge
    }
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
                template = template.replace('X--XX--XX--XX--X', body['orderNum'])
                plain = MIMEText(template, "plain")
            
            with open('./orders/emailTemplateHTML.txt') as template:
                template = template.read()
                template = template.replace('X--XX--XX--XX--X', body['orderNum'])
                fancy = MIMEText(template, "html")
                
            msg.attach(plain)
            msg.attach(fancy)

            port = 465
            password = config('EMAIL_PASSWORD')

            context = ssl.create_default_context()

            with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
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
            with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
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
            for p in Order.objects.raw('SELECT * FROM orders_order WHERE orderNum ="'+body['orderNum']+'"' ):
                order = copy.deepcopy(p).__dict__
            del order['_state']
            order['datetime']=order['datetime'].strftime("%m/%d/%Y, %H:%M:%S")
            print(order['boards'])
            response_object = json.dumps(order)
            return JsonResponse(response_object, safe=False)

        except Exception as e:
            print(e)
            print('error making sql query')
    
    else:
        return HttpResponse(status=400)

@csrf_exempt
def store_image(request):
    request_body = json.loads(request.body)
    if request.method == 'POST':
        try:
            uploaded_file = request_body['img']
            orderNum = request_body['orderNum'] + '.svg'
            img_file = open('./orders/images/'+orderNum, 'w')
            img_file.write(uploaded_file)
            img_file.close()
            # drawing = svg2rlg('./orders/images/'+orderNum)
            # renderPM.drawToFile(drawing, './orders/images/'+orderNum[:-4]+'.png', fmt="PNG")
            # os.remove('./orders/images/'+orderNum)
            return HttpResponse(status=200)
        except:
            return HttpResponse(status=400)



@csrf_exempt
def admin(request):
    request_body = json.loads(request.body)
    if request.method == 'POST' and request_body['password'] == config('ORDER_PASS'):
        try:
            order_arr = []
            for p in Order.objects.raw('SELECT * FROM orders_order' ):
                order = copy.deepcopy(p).__dict__
                del order['_state']
                order['datetime']=order['datetime'].strftime("%m/%d/%Y, %H:%M:%S")
                order_arr.append(order)

            response_object = json.dumps(order_arr)

            return JsonResponse(response_object, safe=False)

        except Exception as e:
            print(e)
            print('error making query')
            return HttpResponse(status=400)
    elif request.method == 'PUT' and request_body['password'] == config('ORDER_PASS'):
        if request_body['operation'] == 'adv':
            try:
                for p in Order.objects.raw('SELECT * FROM orders_order WHERE orderNum ="'+request_body['parentNum']+'"' ):
                    order = p.__dict__
                    order_arr = order['boards'][1:-1].replace('},', '},***').split(',***')
                    for i, h in enumerate(order_arr):
                        h = json.loads(h.replace('\'', '"'))
                        if h['orderNum'] == request_body['orderNum']:
                            h['stage'] = request_body['stage']
                            order_arr[i] = json.dumps(h).replace('"', '\'')
                            break
                board_str = '['    
                for m in order_arr:
                    board_str+= m + ', '
                board_str = board_str[:-2]+']'
                Order.objects.filter(orderNum=request_body['parentNum']).update(boards=board_str)

                return HttpResponse(status=200)

            except Exception as e:
                print(e)
                print('error making query')
                return HttpResponse(status=400)
        elif request_body['operation'] == 'del':
            for p in Order.objects.raw('SELECT * FROM orders_order WHERE orderNum ="'+request_body['parentNum']+'"' ):
                    order = p.__dict__
                    order_arr = order['boards'][1:-1].replace('},', '},***').split(',***')
                    for i, h in enumerate(order_arr):
                        h = json.loads(h.replace('\'', '"'))
                        try:
                            os.remove(os.path.join('./orders/gerbers', h['orderNum']+'.zip'))
                        except:
                            print('gerber not found')
                        try:
                            os.remove(os.path.join('./orders/images', h['orderNum']+'.png'))
                        except:
                            print('image not found')
            
            Order.objects.filter(orderNum=request_body['parentNum']).delete()
            return HttpResponse(status=200)
        elif request_body['operation'] == 'clr':
            Order.objects.all().delete()
            filelist = [ f for f in os.listdir('./orders/gerbers')]
            for f in filelist:
                os.remove(os.path.join('./orders/gerbers', f))
            filelist = [ f for f in os.listdir('./orders/images')]
            for f in filelist:
                os.remove(os.path.join('./orders/images', f))
            # os.mkdir('./orders/gerbers')
            # os.mkdir('./orders/images')
            # shutil.rmtree('./gerber_files')
            return HttpResponse(status=200)
    else:
        return HttpResponse(status=400)