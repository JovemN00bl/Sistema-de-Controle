from django.db import models

class Produto(models.Model):
    nome = models.CharField(max_length=200, unique=True)
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    descricao = models.TextField(blank=True, null=True)
    preco_custo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    unidade_medida = models.CharField(max_length=20, default='UN')
    quantidade_em_estoque = models.IntegerField(default=0)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"

class MovimentoEstoque(models.Model):
    TIPO_MOVIMENTO_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SAIDA', 'Saída'),
        ('AJUSTE', 'Ajuste'),
    ]
    produto = models.ForeignKey(Produto, on_delete=models.PROTECT, related_name='movimentos')
    tipo_movimento = models.CharField(max_length=10, choices=TIPO_MOVIMENTO_CHOICES)
    quantidade = models.IntegerField()
    data_movimento = models.DateTimeField(auto_now_add=True)
    observacao = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.tipo_movimento} de {self.quantidade} {self.produto.nome} em {self.data_movimento.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        verbose_name = "Movimento de Estoque"
        verbose_name_plural = "Movimentos de Estoque"
        ordering = ['-data_movimento']