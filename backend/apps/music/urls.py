# backend/apps/music/urls.py (簡化版本)
from django.urls import path
from django.http import JsonResponse

def music_health_check(request):
    return JsonResponse({
        'status': 'healthy', 
        'app': 'music',
        'message': 'Music app is working'
    })

urlpatterns = [
    path('health/', music_health_check, name='music-health'),
]

# 如果需要添加更多功能，可以在這裡擴展
# 例如：
# path('songs/', some_view, name='songs-list'),