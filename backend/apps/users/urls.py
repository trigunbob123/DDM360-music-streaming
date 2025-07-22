from django.urls import path
from django.http import JsonResponse

def users_health_check(request):
    return JsonResponse({'status': 'healthy', 'app': 'users'})

urlpatterns = [
    path('health/', users_health_check, name='users-health'),
]