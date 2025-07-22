from django.urls import path
from django.http import JsonResponse

def playlists_health_check(request):
    return JsonResponse({'status': 'healthy', 'app': 'playlists'})

urlpatterns = [
    path('health/', playlists_health_check, name='playlists-health'),
]