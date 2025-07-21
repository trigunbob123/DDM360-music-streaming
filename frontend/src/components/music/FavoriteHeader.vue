<template>
  <div class="favorite-header mb-6">
    <!-- 主標題 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mr-4">
          <font-awesome-icon icon="heart" class="text-white text-xl" />
        </div>
        <div>
          <h2 class="text-3xl font-bold text-gray-800 flex items-center">
            我的收藏
            <span class="ml-3 text-lg text-gray-500 font-normal">
              ({{ favoriteCount }} 首)
            </span>
          </h2>
          <p class="text-gray-600 text-sm mt-1">你收藏的音樂清單</p>
        </div>
      </div>
      
      <!-- 操作按鈕區域 -->
      <div class="flex items-center space-x-3">
        <!-- 播放全部按鈕 -->
        <button 
          v-if="favoriteCount > 0"
          @click="$emit('play-all')"
          class="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
        >
          <font-awesome-icon icon="play" class="mr-2" />
          播放全部
        </button>
        
        <!-- 隨機播放按鈕 -->
        <button 
          v-if="favoriteCount > 0"
          @click="$emit('shuffle-play')"
          class="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
        >
          <font-awesome-icon icon="random" class="mr-2" />
          隨機播放
        </button>
        
        <!-- 清空收藏按鈕 -->
        <button 
          v-if="favoriteCount > 0"
          @click="$emit('clear-favorites')"
          class="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium"
        >
          <font-awesome-icon icon="trash" class="mr-2" />
          清空收藏
        </button>
      </div>
    </div>
    
    <!-- 統計信息 -->
    <div v-if="favoriteCount > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <!-- 歌曲總數 -->
      <div class="bg-gradient-to-r from-pink-50 to-red-50 rounded-lg p-4 border border-pink-200">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
            <font-awesome-icon icon="music" class="text-white" />
          </div>
          <div>
            <p class="text-sm text-gray-600">歌曲總數</p>
            <p class="text-xl font-bold text-pink-600">{{ favoriteCount }}</p>
          </div>
        </div>
      </div>
      
      <!-- 預估播放時間 -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <font-awesome-icon icon="clock" class="text-white" />
          </div>
          <div>
            <p class="text-sm text-gray-600">預估時長</p>
            <p class="text-xl font-bold text-blue-600">{{ formattedTotalDuration }}</p>
          </div>
        </div>
      </div>
      
      <!-- 收藏日期範圍 -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
            <font-awesome-icon icon="calendar" class="text-white" />
          </div>
          <div>
            <p class="text-sm text-gray-600">最近收藏</p>
            <p class="text-lg font-bold text-green-600">{{ recentFavoriteDate }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空狀態提示 -->
    <div v-else class="text-center py-8">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <font-awesome-icon icon="heart" class="text-3xl text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-600 mb-2">還沒有收藏任何歌曲</h3>
      <p class="text-gray-500 mb-4">點擊歌曲旁邊的愛心圖標來收藏你喜歡的音樂</p>
      <button 
        @click="$emit('explore-music')"
        class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
      >
        <font-awesome-icon icon="search" class="mr-2" />
        探索音樂
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  favoriteCount: {
    type: Number,
    required: true,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  lastFavoriteDate: {
    type: Date,
    default: null
  }
})

defineEmits([
  'play-all', 
  'shuffle-play', 
  'clear-favorites', 
  'explore-music'
])

// 格式化總播放時長
const formattedTotalDuration = computed(() => {
  if (!props.totalDuration) return '0分鐘'
  
  const totalMinutes = Math.floor(props.totalDuration / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours > 0) {
    return `${hours}小時${minutes}分`
  } else {
    return `${minutes}分鐘`
  }
})

// 格式化最近收藏日期
const recentFavoriteDate = computed(() => {
  if (!props.lastFavoriteDate) return '暫無'
  
  const now = new Date()
  const favoriteDate = new Date(props.lastFavoriteDate)
  const diffTime = Math.abs(now - favoriteDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  
  if (diffDays > 0) {
    return `${diffDays}天前`
  } else if (diffHours > 0) {
    return `${diffHours}小時前`
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分鐘前`
  } else {
    return '剛剛'
  }
})
</script>

<style scoped>
/* 收藏頁面標題樣式 */
.favorite-header {
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(236, 72, 153, 0.1);
}

/* 標題動畫 */
.favorite-header h2 {
  background: linear-gradient(135deg, #ec4899, #ef4444, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 按鈕動畫效果 */
.favorite-header button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.favorite-header button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.favorite-header button:active {
  transform: translateY(0);
}

/* 統計卡片動畫 */
.favorite-header .grid > div {
  transition: all 0.3s ease;
}

.favorite-header .grid > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 愛心圖標跳動動畫 */
@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.1);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(1);
  }
}

.favorite-header .fa-heart {
  animation: heartBeat 2s ease-in-out infinite;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .favorite-header {
    padding: 1.5rem;
  }
  
  .favorite-header h2 {
    font-size: 1.5rem;
  }
  
  .favorite-header .flex-col {
    gap: 0.75rem;
  }
  
  .favorite-header .grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .favorite-header button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .favorite-header .space-x-3 {
    gap: 0.5rem;
  }
}

@media (max-width: 640px) {
  .favorite-header {
    padding: 1rem;
  }
  
  .favorite-header .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .favorite-header .justify-between {
    width: 100%;
    justify-content: flex-start;
  }
  
  .favorite-header .space-x-3 {
    flex-wrap: wrap;
  }
}

/* 空狀態動畫 */
.favorite-header .text-center {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 統計數字跳動效果 */
.favorite-header .text-xl,
.favorite-header .text-lg {
  transition: all 0.3s ease;
}

.favorite-header .grid > div:hover .text-xl,
.favorite-header .grid > div:hover .text-lg {
  transform: scale(1.1);
}
</style>