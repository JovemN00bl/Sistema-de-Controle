from rest_framework import serializers
from .models import Produto, MovimentoEstoque

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'
        read_only_fields = ('quantidade_em_estoque',)

class MovimentoEstoqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimentoEstoque
        fields = '__all__'
        read_only_fields = ('data_movimento',)