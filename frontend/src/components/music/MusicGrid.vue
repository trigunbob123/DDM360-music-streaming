<!-- frontend/src/components/music/MusicGrid.vue -->
<template>
  <div class="music-grid-container">
    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-container">
      <LoadingIndicator />
    </div>
    
    <!-- 空狀態 -->
    <div v-else-if="displayedTracks.length === 0" class="empty-state">
      <EmptyState 
        :current-mode="currentMode"
        :is-jamendo-connected="isJamendoConnected"
        :jamendo-configured="jamendoConfigured"
        :user="user"
        @connect-jamendo="$emit('connect-jamendo')"
        @show-login="$emit('show-login')"
      />
    </div>
    
    <!-- 音樂網格 -->
    <div v-else class="music-grid">
      <!-- 網格標題和控制項 -->
      <div class="grid-header">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">
              {{ getGridTitle() }}
            </h2>
            <p class="text-gray-600 text-sm mt-1">
              共 {{ displayedTracks.length }} 首歌曲
            </p>
          </div>
          
          <!-- 視圖切換和排序 -->
          <div class="flex items-center space-x-4">
            <!-- 視圖模式切換 -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'grid'"
                class="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                :class="viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'"
              >
                <font-awesome-icon icon="th-large" class="h-4 w-4" />
              </button>
              <button
                @click="viewMode = 'list'"
                class="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                :class="viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'"
              >
                <font-awesome-icon icon="list" class="h-4 w-4" />
              </button>
            </div>
            
            <!-- 排序選擇器 -->
            <select
              v-model="sortBy"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="default">預設排序</option>
              <option value="name">歌曲名稱</option>
              <option value="artist">藝人名稱</option>
              <option value="duration">歌曲長度</option>
              <option value="popularity">熱門程度</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 網格視圖 -->
      <div 
        v-if="viewMode === 'grid'"
        class="grid gap-4"
        :class="gridColumns"
      >
        <MusicCard
          v-for="track in sortedTracks"
          :key="track.id"
          :track="track"
          :current-track="currentTrack"
          :is-playing="isPlaying"
          :is-loading-track="isLoadingTrack"
          :is-favorite="favoriteTrackIds.has(track.id)"
          @track-click="handleTrackClick(track)"
          @toggle-favorite="handleToggleFavorite(track)"
          @add-to-playlist="handleAddToPlaylist(track)"
          @share-track="handleShareTrack(track)"
        />
      </div>
      
      <!-- 列表視圖 -->
      <div v-else class="music-list">
        <MusicListItem
          v-for="(track, index) in sortedTracks"
          :key="track.id"
          :track="track"
          :index="index + 1"
          :current-track="currentTrack"
          :is-playing="isPlaying"
          :is-loading-track="isLoadingTrack"
          :is-favorite="favoriteTrackIds.has(track.id)"
          @track-click="handleTrackClick(track)"
          @toggle-favorite="handleToggleFavorite(track)"
          @add-to-playlist="handleAddToPlaylist(track)"
          @share-track="handleShareTrack(track)"
        />
      </div>
    </div>
    
    <!-- 載入更多按鈕 -->
    <div v-if="showLoadMore" class="load-more-container">
      <button
        @click="$emit('load-more')"
        :disabled="loadingMore"
        class="load-more-btn"
      >
        <font-awesome-icon 
          v-if="loadingMore" 
          icon="spinner" 
          class="animate-spin mr-2" 
        />
        {{ loadingMore ? '載入中...' : '載入更多' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MusicCard from './MusicCard.vue'
import MusicListItem from './MusicListItem.vue'
import LoadingIndicator from '../ui/LoadingIndicator.vue'
import EmptyState from '../ui/EmptyState.vue'

// Props
const props = defineProps({
  displayedTracks: {
    type: Array,
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
  favoriteTrackIds: {
    type: Set,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingMore: {
    type: Boolean,
    default: false
  },
  showLoadMore: {
    type: Boolean,
    default: false
  },
  currentMode: {
    type: String,
    required: true
  },
  isJamendoConnected: {
    type: Boolean,
    required: true
  },
  jamendoConfigured: {
    type: Boolean,
    required: true
  },
  user: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'track-click',
  'toggle-favorite',
  'add-to-playlist',
  'share-track',
  'connect-jamendo',
  'show-login',
  'load-more'
])

// 響應式數據
const viewMode = ref('grid') // 'grid' | 'list'
const sortBy = ref('default')

// 計算屬性
const gridColumns = computed(() => {
  // 響應式網格列數
  return {
    'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8': true
  }
})

const sortedTracks = computed(() => {
  if (sortBy.value === 'default') {
    return [...props.displayedTracks]
  }
  
  return [...props.displayedTracks].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'artist':
        return a.artist_name.localeCompare(b.artist_name)
      case 'duration':
        return (a.duration || 0) - (b.duration || 0)
      case 'popularity':
        return (b.popularity || 0) - (a.popularity || 0)
      default:
        return 0
    }
  })
})

// 方法
const getGridTitle = () => {
  const modeNames = {
    'popular': '🔥 熱門歌曲',
    'latest': '🆕 最新音樂',
    'random': '🎲 隨機播放',
    'favorites': '❤️ 我的收藏',
    'search': '🔍 搜尋結果',
    'genre': '🎵 曲風歌曲',
    'custom': '🎶 自定義播放清單'
  }
  return modeNames[props.currentMode] || '🎵 音樂列表'
}

const handleTrackClick = (track) => {
  emit('track-click', track, props.displayedTracks, sortedTracks.value.indexOf(track))
}

const handleToggleFavorite = (track) => {
  if (!props.user) {
    emit('show-login')
    return
  }
  emit('toggle-favorite', track)
}

const handleAddToPlaylist = (track) => {
  if (!props.user) {
    emit('show-login')
    return
  }
  emit('add-to-playlist', track)
}

const handleShareTrack = (track) => {
  emit('share-track', track)
}

// 監聽視圖模式變化，保存到 localStorage
watch(viewMode, (newMode) => {
  localStorage.setItem('musicGridViewMode', newMode)
})

watch(sortBy, (newSort) => {
  localStorage.setItem('musicGridSortBy', newSort)
})

// 從 localStorage 恢復設置
const restoreSettings = () => {
  const savedViewMode = localStorage.getItem('musicGridViewMode')
  if (savedViewMode && ['grid', 'list'].includes(savedViewMode)) {
    viewMode.value = savedViewMode
  }
  
  const savedSortBy = localStorage.getItem('musicGridSortBy')
  if (savedSortBy) {
    sortBy.value = savedSortBy
  }
}

// 初始化
restoreSettings()
</script>

<style scoped>
.music-grid-container {
  @apply w-full;
}

.loading-container {
  @apply flex justify-center items-center py-12;
}

.empty-state {
  @apply flex justify-center items-center py-12;
}

.music-grid {
  @apply w-full;
}

.grid-header {
  @apply mb-6;
}

.music-list {
  @apply space-y-2;
}

.load-more-container {
  @apply flex justify-center mt-8;
}

.load-more-btn {
  @apply px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center;
}

/* 響應式調整 */
@media (max-width: 640px) {
  .grid-header .flex {
    @apply flex-col space-y-4;
  }
  
  .grid-header .flex > div:last-child {
    @apply w-full justify-between;
  }
}
</style>