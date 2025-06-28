from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProdutoViewSet, MovimentoEstoqueViewSet

router = DefaultRouter()
router.register(r'produtos', ProdutoViewSet)
router.register(r'movimentos', MovimentoEstoqueViewSet)

urlpatterns = [
    path('', include(router.urls)),
]