from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
# Create your views here.


def files(request):
    if request.method == 'POST':
        uploaded_file = request.FILES['document']
        fs = FileSystemStorage()
        fs.save(request.data.['orderNum'], uploaded_file)
    return render(request)
