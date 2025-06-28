from django.contrib import admin
from .models import Produto, MovimentoEstoque

@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'sku', 'preco_venda', 'quantidade_em_estoque')
    search_fields = ('nome', 'sku')
    list_filter = ('unidade_medida',)
    readonly_fields = ('quantidade_em_estoque',)

@admin.register(MovimentoEstoque)
class MovimentoEstoqueAdmin(admin.ModelAdmin):
    list_display = ('produto', 'tipo_movimento', 'quantidade', 'data_movimento')
    list_filter = ('tipo_movimento', 'data_movimento')
    search_fields = ('produto__nome',)
    readonly_fields = ('data_movimento',)