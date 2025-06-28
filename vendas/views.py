from django.shortcuts import render
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from .models import Cliente, Pedido, ItemPedido
from .serializers import ClienteSerializer, PedidoSerializer, ItemPedidoSerializer
from estoque.models import Produto
from estoque.models import MovimentoEstoque

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all().order_by('nome')
    serializer_class = ClienteSerializer

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-data_pedido')
    serializer_class = PedidoSerializer

    def create(self, request, *args, **kwargs):
        itens_data = request.data.pop('itens', [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():

                pedido = serializer.save()
                valor_total_pedido = 0


                for item_data in itens_data:
                    produto_id = item_data.get('produto')
                    quantidade = item_data.get('quantidade')

                    if not produto_id or not quantidade:
                        raise serializers.ValidationError("Cada item do pedido deve ter 'produto' e 'quantidade'.")

                    try:

                        produto = Produto.objects.select_for_update().get(id=produto_id)
                    except Produto.DoesNotExist:
                        raise serializers.ValidationError(f"Produto com ID {produto_id} não encontrado.")

                    if produto.quantidade_em_estoque < quantidade:
                        raise serializers.ValidationError(f"Estoque insuficiente para {produto.nome}. Disponível: {produto.quantidade_em_estoque}, Solicitado: {quantidade}")


                    item_pedido = ItemPedido.objects.create(
                        pedido=pedido,
                        produto=produto,
                        quantidade=quantidade,
                        preco_unitario=produto.preco_venda
                    )


                    valor_total_pedido += item_pedido.subtotal


                    produto.quantidade_em_estoque -= quantidade
                    produto.save()

                    MovimentoEstoque.objects.create(
                        produto=produto,
                        tipo_movimento='SAIDA',
                        quantidade=quantidade,
                        observacao=f"Saída por Venda - Pedido #{pedido.id}"
                    )


                pedido.valor_total = valor_total_pedido
                pedido.save()


                response_serializer = self.get_serializer(pedido)
                headers = self.get_success_headers(response_serializer.data)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:

            return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)