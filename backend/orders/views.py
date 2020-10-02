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
            board.render(output='./gerber_files')

            #get board dimensions
            width = board.get_dimensions()[0]
            height = board.get_dimensions()[1]

            #convert to png
            drawing = svg2rlg('./gerber_files/top.svg')
            renderPM.drawToFile(drawing, './gerber_files/top.png', fmt="PNG")
            drawing = svg2rlg('./gerber_files/bottom.svg')
            renderPM.drawToFile(drawing, './gerber_files/bottom.png', fmt="PNG")

            #combine pngs
            concatenate_pcb().save(
                './orders/images/'+orderNum[:-4] + '.png')
            shutil.rmtree('./gerber_files')

            return JsonResponse({'width': width, 'height': height})
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
            print(str(body['boards']))
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
def admin(request):
    print(json.loads(request.body))
    if request.method == 'POST' and json.loads(request.body)['password'] == config('ORDER_PASS'):
        try:
            order_arr = []
            for p in Order.objects.raw('SELECT * FROM orders_order' ):
                order = p.__dict__
                del order['_state']
                order['datetime']=order['datetime'].strftime("%m/%d/%Y, %H:%M:%S")

            response_object = json.dumps(order_arr)

            return JsonResponse(response_object, safe=False)

        except Exception as e:
            print(e)
            print('error making query')
    else:
        return HttpResponse(status=400)