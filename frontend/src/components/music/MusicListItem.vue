<template>
  <div 
    class="music-list-item group flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
    :class="{ 
      'bg-orange-50 border-orange-200': isCurrentTrack,
      'bg-red-50': isCurrentTrack && !isPlaying 
    }"
  >
    <!-- 序號/播放狀態 -->
    <div class="flex items-center justify-center w-12 h-12 mr-4 flex-shrink-0">
      <!-- 播放中的動畫 -->
      <div 
        v-if="isCurrentTrack && isPlaying"
        class="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white"
      >
        <div class="flex space-x-1">
          <div class="w-1 h-4 bg-white rounded-full animate-pulse"></div>
          <div class="w-1 h-3 bg-white rounded-full animate-pulse" style="animation-delay: 0.1s"></div>
          <div class="w-1 h-5 bg-white rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
        </div>
      </div>
      
      <!-- 載入中 -->
      <div 
        v-else-if="isCurrentTrack && isLoadingTrack"
        class="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white"
      >
        <font-awesome-icon icon="spinner" class="animate-spin text-sm" />
      </div>
      
      <!-- 暫停狀態 -->
      <div 
        v-else-if="isCurrentTrack && !isPlaying"
        class="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white cursor-pointer"
        @click="$emit('track-click')"
      >
        <font-awesome-icon icon="play" class="text-sm" />
      </div>
      
      <!-- 普通狀態 - 顯示序號，懸停時顯示播放按鈕 -->
      <div v-else class="relative w-8 h-8 flex items-center justify-center">
        <span 
          class="text-gray-500 text-sm group-hover:opacity-0 transition-opacity duration-200"
        >
          {{ index }}
        </span>
        <button
          @click="$emit('track-click')"
          class="absolute inset-0 flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100"
        >
          <font-awesome-icon icon="play" class="text-sm" />
        </button>
      </div>
    </div>

    <!-- 歌曲封面 -->
    <div class="relative flex-shrink-0 w-12 h-12 mr-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
      <img 
        v-if="track.image" 
        :src="track.image" 
        :alt="track.name"
        class="w-full h-full object-cover"
        @error="handleImageError" 
      />
      
      <div 
        v-else 
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500"
      >
        <font-awesome-icon icon="music" class="text-white text-sm" />
      </div>
    </div>

    <!-- 歌曲信息 -->
    <div class="flex-1 min-w-0 mr-4">
      <div class="flex items-center space-x-2">
        <!-- 歌曲名稱 -->
        <h4 
          class="font-medium text-gray-900 text-sm truncate cursor-pointer hover:text-orange-600 transition-colors duration-200"
          :class="{ 'text-orange-600': isCurrentTrack }"
          :title="track.name"
          @click="$emit('track-click')"
        >
          {{ track.name }}
        </h4>
        
        <!-- 品質標籤 -->
        <QualityIndicator :track="track" />
      </div>
      
      <div class="flex items-center space-x-2 mt-1">
        <!-- 藝人名稱 -->
        <span 
          class="text-gray-600 text-xs truncate cursor-pointer hover:text-gray-800 transition-colors duration-200"
          :title="track.artist_name"
          @click="handleArtistClick"
        >
          {{ track.artist_name }}
        </span>
        
        <!-- 分隔符 -->
        <span class="text-gray-400 text-xs">•</span>
        
        <!-- 專輯名稱 -->
        <span 
          v-if="track.album_name" 
          class="text-gray-500 text-xs truncate cursor-pointer hover:text-gray-700 transition-colors duration-200"
          :title="track.album_name"
          @click="handleAlbumClick"
        >
          {{ track.album_name }}
        </span>
      </div>
    </div>

    <!-- 歌曲時長 -->
    <div class="flex items-center justify-center w-16 mr-4 text-gray-500 text-sm">
      {{ formatTime(track.duration) }}
    </div>

    <!-- 操作按鈕 -->
    <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <!-- 收藏按鈕 -->
      <button
        @click.stop="$emit('toggle-favorite')"
        class="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
        :title="isFavorite ? '取消收藏' : '加入收藏'"
      >
        <font-awesome-icon 
          :icon="isFavorite ? ['fas', 'heart'] : ['far', 'heart']"
          class="text-sm"
          :class="isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'" 
        />
      </button>

      <!-- 加入播放列表 -->
      <button
        @click.stop="$emit('add-to-playlist')"
        class="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
        title="加入播放列表"
      >
        <font-awesome-icon icon="plus" class="text-sm text-gray-400 hover:text-orange-500" />
      </button>

      <!-- 更多選項 -->
      <div class="relative">
        <button
          @click.stop="toggleOptionsMenu"
          class="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          title="更多選項"
        >
          <font-awesome-icon icon="ellipsis-h" class="text-sm text-gray-400" />
        </button>

        <!-- 選項選單 -->
        <div 
          v-if="showOptionsMenu"
          class="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
          @click.stop
        >
          <div class="py-2">
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
  index: {
    type: Number,
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

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const toggleOptionsMenu = () => {
  showOptionsMenu.value = !showOptionsMenu.value
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
  if (!event.target.closest('.music-list-item')) {
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
/* 列表項動畫 */
.music-list-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.music-list-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 播放動畫 */
@keyframes pulse {
  0%, 100% {
    height: 1rem;
  }
  50% {
    height: 0.75rem;
  }
}

.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}

/* 序號到播放按鈕的平滑過渡 */
.group:hover .group-hover\:opacity-0 {
  transition: opacity 0.2s ease;
}

.group:hover .group-hover\:opacity-100 {
  transition: opacity 0.2s ease, transform 0.2s ease;
}


</style>