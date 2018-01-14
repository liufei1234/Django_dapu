from django.shortcuts import render
from dapu_shop.models import DapuShopShop, DapuShopTopImg
from django.template.loader import get_template
from django.db.models import Count


# Create your views here.
def gallery(request):
    if request.method=='GET':
        cate = request.GET.get('id')
        order = request.GET.get('order')
        if order == 1:
            shop_list = DapuShopShop.objects.filter(category_id=cate).order_by(Count('sale_volume'))
        elif order ==2:
            shop_list = DapuShopShop.objects.filter(category_id=cate).order_by('price')
        elif order ==3:
            shop_list = DapuShopShop.objects.filter(category_id=cate).order_by('-price')
        else:
            shop_list = DapuShopShop.objects.filter(category_id=cate)

        imgs=[]
        for shop in shop_list:
            imgs.append(DapuShopTopImg.objects.filter(shop_id=shop.id))
    # data = DapuShopShop.objects.all()
    return render(request, 'gallery.html', {'data': shop_list,'imgs':imgs})


def base(request):
    return render(request, 'base.html')


def login(request):
    return render(request, 'login.html')


def index(request):
    t = get_template('basic/sample.html')
    return render(request, 'index.html', {'t': t})


def register(request):
    return render(request, 'register.html')


def cart(request):
    return render(request, 'cart.html')


def about(request):
    return render(request, 'about.html')


def channel(request):
    return render(request, 'channel.html')


def detail_page(request):
    return render(request, 'detail_page.html')


