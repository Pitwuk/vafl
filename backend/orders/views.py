from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
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
from gerber_renderer import renderer
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
            board = renderer.Gerber('./orders/gerbers/'+orderNum, verbose=True)

            #get board dimensions
            width = board.get_dimensions()[0]
            height = board.get_dimensions()[1]

            # # stack svgs
            # combined = sg.fromfile('./gerber_files/top.svg')
            # bottom = sg.fromfile('./gerber_files/bottom.svg').getroot()
            # #move bottom
            # if(width <= height*2):
            #     bottom.moveto(width*board.get_dimensions()[2], 0)
            # else:
            #     bottom.moveto(0, height*board.get_dimensions()[2])
            # combined.append(bottom)
            # combined.save('./orders/images/'+orderNum[:-4] + '.svg')

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
            mydb = mysql.connector.connect(
                host="localhost",
                user="root",
                password=config('MYSQL_PASS'),
                database='vafl'
            )
            mycursor = mydb.cursor()
            mycursor.execute(
                'INSERT INTO orders (orderNum, first_name, last_name, email, address, city, state, zipCode, quantity, speed, color, layers, request, status) VALUES('+str(body.values())[13:-2]+',\'Placed\')')

            mydb.commit()
            mycursor.execute(
                "SELECT * FROM orders WHERE orderNum = '"+body['orderNum']+"'")

            for x in mycursor:
                print(x)
            print('order added to database')
        except Exception as e:
            print(e)
            print('error making sql query')
        try:
            msg = MIMEMultipart("alternative")
            msg['Subject'] = 'VAFL PCB Order Success'
            msg['From'] = 'vaflpcb@gmail.com'
            msg['To'] = body['email']

            with open('./orders/emailTemplatePlain.txt') as template:
                plain = MIMEText(template.read(), "plain")
            with open('./orders/emailTemplateHTML.txt') as template:
                fancy = MIMEText(template.read(), "html")
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
        body = json.loads(request.body)
        try:
            mydb = mysql.connector.connect(
                host="localhost",
                user="root",
                password=config('MYSQL_PASS'),
                database='vafl'
            )
            mycursor = mydb.cursor()
            mycursor.execute(
                "SELECT * FROM orders WHERE orderNum = '"+body['orderNum']+"'")

            order_arr = []
            for x in mycursor:
                order_arr = list(x)
                print('order found')
            
            order_arr[15] = str(order_arr[15])
            response_object = json.dumps(order_arr)

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
            mydb = mysql.connector.connect(
                host="localhost",
                user="root",
                password=config('MYSQL_PASS'),
                database='vafl'
            )
            mycursor = mydb.cursor()
            mycursor.execute(
                "SELECT * FROM orders")

            order_arr = []
            for x in mycursor:
                temp_order_arr = list(x)
                temp_order_arr[15] = str(temp_order_arr[15])
                order_arr.append(temp_order_arr)
            
            
            response_object = json.dumps(order_arr)

            return JsonResponse(response_object, safe=False)

        except Exception as e:
            print(e)
            print('error making sql query')
    else:
        return HttpResponse(status=400)