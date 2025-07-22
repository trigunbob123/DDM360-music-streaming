from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
import os

def api_health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'message': 'DDM360 Music Streaming API is running',
        'jamendo_configured': bool(os.getenv('JAMENDO_CLIENT_ID')),
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', api_health_check, name='api-health'),
    path('api/music/', include('apps.music.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/playlists/', include('apps.playlists.urls')),
    path('api/jamendo/', include('apps.jamendo.urls')),
]