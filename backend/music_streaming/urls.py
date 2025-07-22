# backend/music_streaming/urls.py (簡化版本，只啟用 Jamendo)
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
import os

def api_health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'message': 'DDM360 Music Streaming API is running',
        'jamendo_configured': bool(os.getenv('JAMENDO_CLIENT_ID')),
        'active_apps': ['jamendo']
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', api_health_check, name='api-health'),
    path('api/jamendo/', include('apps.jamendo.urls')),
    # 暫時註解掉有問題的 apps
    # path('api/music/', include('apps.music.urls')),
    # path('api/users/', include('apps.users.urls')),
    # path('api/playlists/', include('apps.playlists.urls')),
]