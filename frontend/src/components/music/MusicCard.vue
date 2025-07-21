<template>
  <div 
    class="music-card group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200"
    :class="{ 
      'ring-2 ring-orange-500 ring-opacity-50': isCurrentTrack,
      'transform hover:scale-105': !isCurrentTrack 
    }"
  >
    <!-- 封面圖片容器 -->
    <div 
      class="relative aspect-square bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden cursor-pointer"
      @click="$emit('track-click')"
    >
      <!-- 封面圖片 -->
      <img 
        v-if="track.image" 
        :src="track.image" 
        :alt="track.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        @error="handleImageError" 
      />
      
      <!-- 預設圖標 -->
      <div 
        v-else 
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500"
      >
        <font-awesome-icon icon="music" class="text-white text-2xl opacity-80" />
      </div>
      
      <!-- 播放狀態遮罩 -->
      <div 
        v-if="isCurrentTrack"
        class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
      >
        <div class="bg-white bg-opacity-90 rounded-full p-3 backdrop-blur-sm">
          <font-awesome-icon 
            v-if="isLoadingTrack" 
            icon="spinner" 
            class="text-orange-600 text-lg animate-spin" 
          />
          <font-awesome-icon 
            v-else
            :icon="isPlaying ? 'pause' : 'play'" 
            class="text-orange-600 text-lg" 
          />
        </div>
      </div>
      
      <!-- 懸停時的播放按鈕 -->
      <div 
        v-else
        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300"
      >
        <div class="bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full p-3 backdrop-blur-sm transform scale-0 group-hover:scale-100 transition-all duration-300">
          <font-awesome-icon icon="play" class="text-orange-600 text-lg" />
        </div>
      </div>
      
      <!-- 收藏按鈕 -->
      <button 
        @click.stop="$emit('toggle-favorite')" 
        class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center transition-all duration-200 transform hover:scale-110 z-10"
        :class="{ 'bg-red-50': isFavorite }"
      >
        <font-awesome-icon 
          :icon="isFavorite ? ['fas', 'heart'] : ['far', 'heart']"
          class="text-sm transition-colors duration-200"
          :class="isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'" 
        />
      </button>
      
      <!-- 更多選項按鈕 -->
      <button 
        @click.stop="toggleOptionsMenu" 
        class="absolute top-2 left-2 w-8 h-8 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center transition-all duration-200 transform hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
      >
        <font-awesome-icon icon="ellipsis-h" class="text-gray-600 text-xs" />
      </button>
      
      <!-- 選項選單 -->
      <div 
        v-if="showOptionsMenu"
        class="absolute top-12 left-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[150px]"
        @click.stop
      >
        <button
          @click="handleAddToPlaylist"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <font-awesome-icon icon="plus" class="w-4 h-4 mr-3 text-gray-400" />
          加入播放列表
        </button>
        <button
          @click="handleShare"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <font-awesome-icon icon="share" class="w-4 h-4 mr-3 text-gray-400" />
          分享歌曲
        </button>
        <button
          @click="handleDownload"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <font-awesome-icon icon="download" class="w-4 h-4 mr-3 text-gray-400" />
          下載歌曲
        </button>
      </div>
      
      <!-- 歌曲時長 -->
      <div 
        v-if="track.duration"
        class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded"
      >
        {{ formatTime(track.duration) }}
      </div>
    </div>
    
    <!-- 歌曲信息 -->
    <div class="p-4">
      <!-- 歌曲名稱 -->
      <h3 
        class="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-orange-600 transition-colors duration-200"
        :title="track.name"
        @click="$emit('track-click')"
      >
        {{ track.name }}
      </h3>
      
      <!-- 藝人名稱 -->
      <p 
        class="text-gray-600 text-xs mb-2 truncate cursor-pointer hover:text-gray-800 transition-colors duration-200"
        :title="track.artist_name"
        @click="handleArtistClick"
      >
        {{ track.artist_name }}
      </p>
      
      <!-- 專輯名稱 -->
      <p 
        v-if="track.album_name" 
        class="text-gray-500 text-xs truncate cursor-pointer hover:text-gray-700 transition-colors duration-200"
        :title="track.album_name"
        @click="handleAlbumClick"
      >
        {{ track.album_name }}
      </p>
      
      <!-- 標籤和統計 -->
      <div class="flex items-center justify-between mt-3">
        <!-- 來源標籤 -->
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
          <font-awesome-icon icon="music" class="w-3 h-3 mr-1" />
          Jamendo
        </span>
        
        <!-- 播放次數/熱門程度 -->
        <div v-if="track.popularity || track.listens" class="text-xs text-gray-500 flex items-center">
          <font-awesome-icon icon="play" class="w-3 h-3 mr-1" />
          {{ formatNumber(track.popularity || track.listens || 0) }}
        </div>
      </div>
      
      <!-- 音質指示器 -->
      <div class="mt-2 flex items-center justify-between">
        <QualityIndicator :track="track" />
        
        <!-- 快速操作按鈕 -->
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            @click.stop="$emit('toggle-favorite')"
            class="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
            :title="isFavorite ? '取消收藏' : '加入收藏'"
          >
            <font-awesome-icon 
              :icon="isFavorite ? ['fas', 'heart'] : ['far', 'heart']"
              class="w-3 h-3"
              :class="isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'" 
            />
          </button>
          
          <button
            @click.stop="handleAddToPlaylist"
            class="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
            title="加入播放列表"
          >
            <font-awesome-icon icon="plus" class="w-3 h-3 text-gray-400 hover:text-orange-500" />
          </button>
          
          <button
            @click.stop="handleShare"
            class="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
            title="分享"
          >
            <font-awesome-icon icon="share" class="w-3 h-3 text-gray-400 hover:text-blue-500" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import QualityIndicator from './QualityIndicator.vue'

// Props
const props = defineProps({
  track: {
    type: Object,
    required: true
  },
  currentTrack: {
    type: Object,
    required: true
  },
  isPlaying: {
    type: Boolean,
    required: true
  },
  isLoadingTrack: {
    type: Boolean,
    required: true
  },
  isFavorite: {
    type: Boolean,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'track-click',
  'toggle-favorite',
  'add-to-playlist',
  'share-track',
  'artist-click',
  'album-click'
])

// 響應式數據
const showOptionsMenu = ref(false)

// 計算屬性
const isCurrentTrack = computed(() => {
  return props.currentTrack.id === props.track.id
})

// 方法
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const toggleOptionsMenu = () => {
  showOptionsMenu.value = !showOptionsMenu.value
}

const handleAddToPlaylist = () => {
  emit('add-to-playlist')
  showOptionsMenu.value = false
}

const handleShare = () => {
  emit('share-track')
  showOptionsMenu.value = false
}

const handleDownload = () => {
  if (props.track.audiodownload) {
    window.open(props.track.audiodownload, '_blank')
  }
  showOptionsMenu.value = false
}

const handleArtistClick = () => {
  emit('artist-click', props.track.artist_name)
}

const handleAlbumClick = () => {
  emit('album-click', props.track.album_name)
}

// 點擊外部關閉選單
const handleClickOutside = (event) => {
  if (!event.target.closest('.music-card')) {
    showOptionsMenu.value = false
  }
}

// 生命週期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 文字截斷樣式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 卡片懸停效果 */
.music-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.music-card:hover {
  transform: translateY(-2px);
}

/* 按鈕動畫 */
.music-card button {
  transition: all 0.2s ease;
}

.music-card button:active {
  transform: scale(0.95);
}

/* 響應式設計 */
@media (max-width: 640px) {
  .music-card {
    transform: none !important;
  }
  
  .music-card:hover {
    transform: none !important;
  }
}
</style>