# vendas/admin.py
from django.contrib import admin
from .models import Cliente, Pedido, ItemPedido

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cpf_cnpj', 'email', 'telefone')
    search_fields = ('nome', 'cpf_cnpj', 'email')
    list_filter = ('data_cadastro',)

class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 1

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'data_pedido', 'status', 'valor_total')
    list_filter = ('status', 'data_pedido')
    search_fields = ('cliente__nome', 'id')
    inlines = [ItemPedidoInline]
    readonly_fields = ('data_pedido', 'valor_total',)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        obj.valor_total = sum(item.subtotal for item in obj.itens.all())
        obj.save()