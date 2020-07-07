from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import csrf_exempt
from django.http.multipartparser import MultiPartParser
from django.http import HttpResponse
import json
import zipfile
import base64
from gerber import PCB
from gerber.render import theme
from gerber.render.cairo_backend import GerberCairoContext


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
                               './orders/gerbers/'+orderNum[:-4] + '/pcb.png',
                               theme.THEMES['default'], verbose=True)
            # return result image
            # with open('./orders/gerbers/'+orderNum[:-4]+'/pcb.png', "rb") as f:
            #     return HttpResponse(f.read(), content_type="image/png")
            return HttpResponse(status=204)
        else:
            return HttpResponse(status=400)
