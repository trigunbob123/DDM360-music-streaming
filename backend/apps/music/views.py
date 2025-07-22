from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """Music app 健康檢查"""
    return JsonResponse({
        'status': 'healthy',
        'app': 'music',
        'message': 'Music app is working'
    })

# 未來可以在這裡添加更多視圖函數
# 例如：SongViewSet, ArtistViewSet 等