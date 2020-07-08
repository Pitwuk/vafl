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
                './orders/gerbers/'+orderNum[:-4] + '/pcb.png')
            os.remove('./orders/gerbers/'+orderNum[:-4] + '/top.png')
            os.remove('./orders/gerbers/'+orderNum[:-4] + '/bottom.png')

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
