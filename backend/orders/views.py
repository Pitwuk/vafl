from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import csrf_exempt
from django.http.multipartparser import MultiPartParser
from django.http import HttpResponse, JsonResponse
import json
import zipfile
import base64
import os
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


@csrf_exempt
def files(request):
    if request.method == 'POST':
        uploaded_file = request.FILES['gerber']
        if uploaded_file.name[-4:] == '.zip':
            print('Recieved Gerber files')
            # save zip
            orderNum = request.POST['orderNum'] + '.zip'
            fs = FileSystemStorage()
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
            os.remove('./orders/gerbers/'+orderNum[:-4])

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
        try:
            body = json.loads(request.body)
            with open('./orders/current/'+body['orderNum']+'.json', 'w') as outfile:
                json.dump(body, outfile)
        except:
            print('error saving order data')
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
        except Exception as e:
            print(e)
            print('error sending email')

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=400)
