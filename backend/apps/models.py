# backend/apps/jamendo/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json

class JamendoTrack(models.Model):
    """本地緩存的 Jamendo 音軌信息"""
    
    # 基本信息
    jamendo_id = models.IntegerField(unique=True, verbose_name="Jamendo ID")
    name = models.CharField(max_length=500, verbose_name="歌曲名稱")
    artist_name = models.CharField(max_length=200, verbose_name="藝人名稱")
    artist_id = models.IntegerField(verbose_name="藝人 ID")
    album_name = models.CharField(max_length=200, blank=True, verbose_name="專輯名稱")
    album_id = models.IntegerField(null=True, blank=True, verbose_name="專輯 ID")
    duration = models.IntegerField(verbose_name="時長(秒)")
    position = models.IntegerField(default=1, verbose_name="專輯中的位置")
    releasedate = models.DateField(null=True, blank=True, verbose_name="發行日期")
    
    # 音頻 URLs
    audio = models.URLField(verbose_name="音頻串流 URL")
    audiodownload = models.URLField(verbose_name="音頻下載 URL")
    
    # 圖片 URLs
    image = models.URLField(blank=True, verbose_name="歌曲封面")
    album_image = models.URLField(blank=True, verbose_name="專輯封面")
    
    # 標籤和分類 (JSON 格式存儲)
    musicinfo_tags_genres = models.TextField(
        blank=True, 
        verbose_name="曲風標籤",
        help_text="JSON 格式存儲的曲風標籤列表"
    )
    musicinfo_tags_instruments = models.TextField(
        blank=True, 
        verbose_name="樂器標籤",
        help_text="JSON 格式存儲的樂器標籤列表"
    )
    musicinfo_tags_vartags = models.TextField(
        blank=True, 
        verbose_name="其他標籤",
        help_text="JSON 格式存儲的其他標籤列表"
    )
    
    # 統計信息
    stats_rate = models.FloatField(default=0.0, verbose_name="評分")
    stats_downloads_total = models.IntegerField(default=0, verbose_name="下載次數")
    stats_playlisted = models.IntegerField(default=0, verbose_name="收藏次數")
    
    # 本地字段
    cached_at = models.DateTimeField(auto_now=True, verbose_name="緩存時間")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="創建時間")
    
    class Meta:
        db_table = 'jamendo_tracks'
        ordering = ['-stats_rate', '-stats_downloads_total']
        verbose_name = "Jamendo 音軌"
        verbose_name_plural = "Jamendo 音軌"
        indexes = [
            models.Index(fields=['jamendo_id']),
            models.Index(fields=['artist_name']),
            models.Index(fields=['album_name']),
            models.Index(fields=['stats_rate']),
            models.Index(fields=['cached_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.artist_name}"
    
    @property
    def duration_formatted(self):
        """格式化時長顯示"""
        if self.duration:
            minutes = self.duration // 60
            seconds = self.duration % 60
            return f"{minutes:02d}:{seconds:02d}"
        return "00:00"
    
    @property
    def genres_list(self):
        """獲取曲風列表"""
        try:
            return json.loads(self.musicinfo_tags_genres) if self.musicinfo_tags_genres else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    @property
    def instruments_list(self):
        """獲取樂器列表"""
        try:
            return json.loads(self.musicinfo_tags_instruments) if self.musicinfo_tags_instruments else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    @property
    def vartags_list(self):
        """獲取其他標籤列表"""
        try:
            return json.loads(self.musicinfo_tags_vartags) if self.musicinfo_tags_vartags else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    @classmethod
    def create_from_jamendo_data(cls, jamendo_data):
        """從 Jamendo API 數據創建對象"""
        try:
            musicinfo = jamendo_data.get('musicinfo', {})
            tags = musicinfo.get('tags', {})
            
            track = cls(
                jamendo_id=jamendo_data['id'],
                name=jamendo_data['name'],
                artist_name=jamendo_data['artist_name'],
                artist_id=jamendo_data['artist_id'],
                album_name=jamendo_data.get('album_name', ''),
                album_id=jamendo_data.get('album_id'),
                duration=jamendo_data['duration'],
                position=jamendo_data.get('position', 1),
                audio=jamendo_data['audio'],
                audiodownload=jamendo_data['audiodownload'],
                image=jamendo_data.get('image', ''),
                album_image=jamendo_data.get('album_image', ''),
                stats_rate=jamendo_data.get('stats', {}).get('rate', 0.0),
                stats_downloads_total=jamendo_data.get('stats', {}).get('downloads_total', 0),
                stats_playlisted=jamendo_data.get('stats', {}).get('playlisted', 0)
            )
            
            # 設置標籤
            track.musicinfo_tags_genres = json.dumps(tags.get('genres', []))
            track.musicinfo_tags_instruments = json.dumps(tags.get('instruments', []))
            track.musicinfo_tags_vartags = json.dumps(tags.get('vartags', []))
            
            # 處理發行日期
            if jamendo_data.get('releasedate'):
                try:
                    from datetime import datetime
                    track.releasedate = datetime.strptime(jamendo_data['releasedate'], '%Y-%m-%d').date()
                except (ValueError, TypeError):
                    pass
            
            return track
        except KeyError as e:
            raise ValueError(f"缺少必要的 Jamendo 數據字段: {e}")

class UserFavoriteTrack(models.Model):
    """用戶收藏的音軌"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        verbose_name="用戶",
        related_name="favorite_tracks"
    )
    track = models.ForeignKey(
        JamendoTrack, 
        on_delete=models.CASCADE, 
        verbose_name="音軌",
        related_name="favorited_by"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="收藏時間")
    
    class Meta:
        unique_together = ['user', 'track']
        db_table = 'user_favorite_tracks'
        verbose_name = "用戶收藏"
        verbose_name_plural = "用戶收藏"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['track']),
        ]
    
    def __str__(self):
        return f"{self.user.username} 收藏了 {self.track.name}"

class UserPlayHistory(models.Model):
    """用戶播放歷史"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        verbose_name="用戶",
        related_name="play_history"
    )
    track = models.ForeignKey(
        JamendoTrack, 
        on_delete=models.CASCADE, 
        verbose_name="音軌",
        related_name="play_history"
    )
    session_id = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="會話 ID",
        help_text="用於匿名用戶追蹤"
    )
    played_at = models.DateTimeField(auto_now_add=True, verbose_name="播放時間")
    duration_played = models.IntegerField(default=0, verbose_name="播放時長(秒)")
    completed = models.BooleanField(default=False, verbose_name="是否播放完整")
    
    # 播放環境信息
    user_agent = models.TextField(blank=True, verbose_name="用戶代理")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP 地址")
    
    class Meta:
        db_table = 'user_play_history'
        ordering = ['-played_at']
        verbose_name = "播放歷史"
        verbose_name_plural = "播放歷史"
        indexes = [
            models.Index(fields=['user', 'played_at']),
            models.Index(fields=['session_id', 'played_at']),
            models.Index(fields=['track', 'played_at']),
            models.Index(fields=['played_at']),
        ]
    
    def __str__(self):
        user_display = self.user.username if self.user else f"匿名用戶({self.session_id[:8]})"
        return f"{user_display} 播放了 {self.track.name}"
    
    @property
    def completion_rate(self):
        """計算播放完成率"""
        if self.track.duration and self.duration_played:
            return (self.duration_played / self.track.duration) * 100
        return 0

class JamendoAPICache(models.Model):
    """Jamendo API 響應緩存"""
    cache_key = models.CharField(max_length=255, unique=True, verbose_name="緩存鍵")
    response_data = models.JSONField(verbose_name="響應數據")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="創建時間")
    expires_at = models.DateTimeField(verbose_name="過期時間")
    
    class Meta:
        db_table = 'jamendo_api_cache'
        ordering = ['-created_at']
        verbose_name = "API 緩存"
        verbose_name_plural = "API 緩存"
        indexes = [
            models.Index(fields=['cache_key']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"緩存: {self.cache_key}"
    
    @property
    def is_expired(self):
        """檢查緩存是否過期"""
        return timezone.now() > self.expires_at
    
    @classmethod
    def get_cached_response(cls, cache_key):
        """獲取有效的緩存響應"""
        try:
            cache_obj = cls.objects.get(cache_key=cache_key)
            if not cache_obj.is_expired:
                return cache_obj.response_data
            else:
                cache_obj.delete()
                return None
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def set_cached_response(cls, cache_key, response_data, expires_in_seconds=3600):
        """設置緩存響應"""
        expires_at = timezone.now() + timezone.timedelta(seconds=expires_in_seconds)
        cache_obj, created = cls.objects.update_or_create(
            cache_key=cache_key,
            defaults={
                'response_data': response_data,
                'expires_at': expires_at
            }
        )
        return cache_obj

class UserListeningStats(models.Model):
    """用戶聽歌統計"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        verbose_name="用戶",
        related_name="listening_stats"
    )
    total_listening_time = models.BigIntegerField(default=0, verbose_name="總聽歌時間(秒)")
    total_tracks_played = models.IntegerField(default=0, verbose_name="播放歌曲總數")
    total_tracks_completed = models.IntegerField(default=0, verbose_name="完整播放歌曲數")
    favorite_genre = models.CharField(max_length=100, blank=True, verbose_name="最喜愛曲風")
    most_played_track = models.ForeignKey(
        JamendoTrack, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="最常播放的歌曲"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新時間")
    
    class Meta:
        db_table = 'user_listening_stats'
        verbose_name = "用戶聽歌統計"
        verbose_name_plural = "用戶聽歌統計"
    
    def __str__(self):
        return f"{self.user.username} 的聽歌統計"

# 信號處理器
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver(post_save, sender=UserPlayHistory)
def update_user_stats_on_play(sender, instance, created, **kwargs):
    """播放歷史創建或更新時，更新用戶統計"""
    if instance.user:
        stats, created = UserListeningStats.objects.get_or_create(user=instance.user)

@receiver(post_save, sender=UserFavoriteTrack)
def update_track_stats_on_favorite(sender, instance, created, **kwargs):
    """收藏時更新音軌統計"""
    if created:
        track = instance.track
        track.stats_playlisted += 1
        track.save(update_fields=['stats_playlisted'])

@receiver(post_delete, sender=UserFavoriteTrack)
def update_track_stats_on_unfavorite(sender, instance, **kwargs):
    """取消收藏時更新音軌統計"""
    track = instance.track
    track.stats_playlisted = max(0, track.stats_playlisted - 1)
    track.save(update_fields=['stats_playlisted'])