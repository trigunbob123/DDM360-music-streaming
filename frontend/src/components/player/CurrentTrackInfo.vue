<!-- 當前歌曲信息展示 -->
<template>
  <div class="flex items-center min-w-0 w-full">
    <!-- 歌曲封面 -->
    <div class="relative flex-shrink-0 mr-4">
      <div class="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-gray-600 to-gray-800">
        <!-- 歌曲圖片 -->
        <img 
          v-if="currentTrack.image" 
          :src="currentTrack.image" 
          :alt="currentTrack.name"
          class="w-full h-full object-cover transition-all duration-300"
          :class="{ 'animate-pulse': isLoading }"
          @error="handleImageError" 
        />
        
        <!-- 預設圖標 -->
        <div 
          v-else 
          class="w-full h-full flex items-center justify-center text-gray-400"
        >
          <font-awesome-icon 
            icon="music" 
            class="text-xl"
            :class="{ 'animate-pulse': isLoading }"
          />
        </div>

        <!-- 播放中的旋轉效果 -->
        <div 
          v-if="isPlaying && !isLoading"
          class="absolute inset-0 bg-black/20 flex items-center justify-center"
        >
          <div class="w-6 h-6 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
        </div>

        <!-- 載入中的覆蓋層 -->
        <div 
          v-if="isLoading"
          class="absolute inset-0 bg-black/40 flex items-center justify-center"
        >
          <font-awesome-icon 
            icon="spinner" 
            class="text-white text-lg animate-spin" 
          />
        </div>
      </div>
    </div>
    
    <!-- 歌曲信息 -->
    <div class="min-w-0 flex-1">
      <!-- 有歌曲時的信息 -->
      <div v-if="currentTrack.name" class="space-y-1">
        <!-- 歌曲名稱 -->
        <h3 
          class="font-semibold text-white text-sm leading-tight truncate"
          :title="currentTrack.name"
        >
          {{ currentTrack.name }}
        </h3>
        
        <!-- 藝人名稱 -->
        <p 
          class="text-gray-300 text-xs truncate"
          :title="currentTrack.artist_name"
        >
          {{ currentTrack.artist_name }}
        </p>
        
        <!-- 專輯名稱 -->
        <p 
          v-if="currentTrack.album_name" 
          class="text-gray-400 text-xs truncate"
          :title="currentTrack.album_name"
        >
          {{ currentTrack.album_name }}
        </p>

        <!-- 音樂來源標籤 -->
        <div class="flex items-center space-x-2 mt-1">
          <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-300">
            <font-awesome-icon icon="music" class="mr-1 text-xs" />
            Jamendo
          </span>
          
          <!-- 歌曲時長 -->
          <span 
            v-if="currentTrack.duration" 
            class="text-gray-500 text-xs"
          >
            {{ formatDuration(currentTrack.duration) }}
          </span>
        </div>
      </div>
      
      <!-- 沒有歌曲時的提示 -->
      <div v-else class="text-gray-400">
        <div class="flex items-center">
          <font-awesome-icon icon="music" class="mr-2" />
          <span class="text-sm">選擇一首歌曲開始播放</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">探索 Jamendo 的免費音樂</p>
      </div>
    </div>

    <!-- 歌曲品質指示器 -->
    <div 
      v-if="currentTrack.name" 
      class="flex-shrink-0 ml-3 hidden sm:block"
    >
      <QualityIndicator :track="currentTrack" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QualityIndicator from './QualityIndicator.vue'

// Props
const props = defineProps({
  currentTrack: {
    type: Object,
    required: true,
    default: () => ({})
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
})

// 方法
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* 動畫優化 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

</style>