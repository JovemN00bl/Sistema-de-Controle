from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from .models import Produto, MovimentoEstoque
from .serializers import ProdutoSerializer, MovimentoEstoqueSerializer

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all().order_by('nome')
    serializer_class = ProdutoSerializer


class MovimentoEstoqueViewSet(viewsets.ModelViewSet):
    queryset = MovimentoEstoque.objects.all()
    serializer_class = MovimentoEstoqueSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        produto_id = serializer.validated_data['produto'].id
        quantidade_movimento = serializer.validated_data['quantidade']
        tipo_movimento = serializer.validated_data['tipo_movimento']

        try:

            with transaction.atomic():
                produto = Produto.objects.select_for_update().get(id=produto_id)

                if tipo_movimento == 'ENTRADA':
                    produto.quantidade_em_estoque += quantidade_movimento
                elif tipo_movimento == 'SAIDA':
                    if produto.quantidade_em_estoque < quantidade_movimento:
                        return Response(
                            {"erro": f"Estoque insuficiente para {produto.nome}. Disponível: {produto.quantidade_em_estoque}, Solicitado: {quantidade_movimento}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    produto.quantidade_em_estoque -= quantidade_movimento
                elif tipo_movimento == 'AJUSTE':

                    pass
                else:
                    return Response(
                        {"erro": "Tipo de movimento inválido."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                produto.save()
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Produto.DoesNotExist:
            return Response({"erro": "Produto não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)