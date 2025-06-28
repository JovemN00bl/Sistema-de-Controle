# vendas/serializers.py
from rest_framework import serializers
from .models import Cliente, Pedido, ItemPedido
from estoque.models import Produto # Precisamos do Produto para validar no ItemPedido

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)

    class Meta:
        model = ItemPedido
        fields = ['id', 'produto', 'produto_nome', 'quantidade', 'preco_unitario', 'subtotal']
        read_only_fields = ['preco_unitario', 'subtotal']

    def validate(self, data):
        produto = data.get('produto')
        if not produto:
            raise serializers.ValidationError("O produto é obrigatório.")
        return data

class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(many=True)

    class Meta:
        model = Pedido
        fields = ['id', 'cliente', 'data_pedido', 'status', 'valor_total', 'itens']
        read_only_fields = ['data_pedido', 'valor_total']

    def create(self, validated_data):

        pass

    def update(self, instance, validated_data):
        pass