from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import csrf_exempt
from django.http.multipartparser import MultiPartParser
from django.http import HttpResponse, JsonResponse
import json
import zipfile
import base64
import os
import shutil
from PIL import Image
from gerber import PCB
from gerber.render import theme
from gerber.render.cairo_backend import GerberCairoContext
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
            # extract gerber files
            with zipfile.ZipFile('./orders/gerbers/'+orderNum, 'r') as zip_ref:
                zip_ref.extractall('./orders/gerbers/'+orderNum[:-4])
            # create pngs of board
            gctx = GerberCairoContext()
            pcb = PCB.from_directory('./orders/gerbers/'+orderNum[:-4])
            gctx.render_layers(pcb.top_layers,
                               './orders/gerbers/'+orderNum[:-4] + '/top.png',
                               theme.THEMES['default'], verbose=True)
            gctx.render_layers(pcb.bottom_layers,
                               './orders/gerbers/' +
                               orderNum[:-4] + '/bottom.png',
                               theme.THEMES['default'], verbose=True)

            # splice images together
            concatenate_pcb(orderNum).save(
                './orders/images/'+orderNum[:-4] + '.png')
            shutil.rmtree('./orders/gerbers/'+orderNum[:-4])

            # get board size
            width = pcb.board_bounds[0][1]
            height = pcb.board_bounds[1][1]

            return JsonResponse({'width': width, 'height': height})
        else:
            return HttpResponse(status=400)


def concatenate_pcb(orderNum):
    # splice images together
    top = Image.open('./orders/gerbers/'+orderNum[:-4] + '/top.png')
    bottom = Image.open('./orders/gerbers/'+orderNum[:-4] + '/bottom.png')
    if top.width <= top.height:
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

                with open('./orders/current/'+body['orderNum']+'.json', 'w') as outfile:
                    json.dump(body, outfile)
                print('saved order to json')
            except:
                print('error saving order data to json')
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

            order_arr[13] = str(order_arr[13])
            print(order_arr[13])
            response_object = json.dumps(order_arr)

            return JsonResponse(response_object, safe=False)

        except Exception as e:
            print(e)
            print('error making sql query')
    else:
        return HttpResponse(status=400)
