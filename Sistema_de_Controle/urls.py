
from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/estoque/', include('estoque.urls')),
    path('', views.home, name='home'),
    path('api/vendas/', include('vendas.urls')),
]
