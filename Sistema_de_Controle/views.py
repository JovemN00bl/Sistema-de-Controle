from django.http import HttpResponse

def home(request):
    return HttpResponse("<h1>Bem-vindo ao Sistema Integrado!</h1><p>Acesse /admin/ para o painel ou /api/estoque/ para a API.</p>")