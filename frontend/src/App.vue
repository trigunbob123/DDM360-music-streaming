<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <!-- 頂部播放器 - 固定在頂部 -->
    <TopPlayer 
      :current-track="playerStore.currentTrack"
      :is-playing="playerStore.isPlaying"
      :is-loading-track="playerStore.isLoadingTrack"
      :current-time="playerStore.currentTime"
      :duration="playerStore.duration"
      :volume="playerStore.volume"
      :is-shuffled="playerStore.isShuffled"
      :repeat-mode="playerStore.repeatMode"
      @toggle-play="handleTogglePlay"
      @previous-track="handlePreviousTrack"
      @next-track="handleNextTrack"
      @seek="handleSeek"
      @volume-change="handleVolumeChange"
      @toggle-shuffle="handleToggleShuffle"
      @toggle-repeat="handleToggleRepeat"
      @add-to-favorites="handleAddToFavorites"
      @add-to-playlist="handleAddToPlaylist"
    />

    <!-- 主要內容區域 -->
    <div class="flex flex-1">
      <!-- 左側邊欄 -->
      <Sidebar 
        :is-jamendo-connected="jamendoStore.isConnected"
        :jamendo-configured="jamendoStore.configured"
        :current-mode="appStore.currentMode"
        :user="userStore.user"
        @connect-jamendo="handleConnectJamendo"
        @set-mode="handleSetMode"
        @show-login="handleShowLogin"
        @logout="handleLogout"
      />

      <!-- 主要內容 -->
      <main class="flex-1 overflow-hidden">
        <div class="h-full p-8">
          <div class="max-w-7xl mx-auto space-y-8">
            <!-- 搜尋區域 -->
            <SearchBar 
              v-model:search-query="searchQuery"
              :is-searching="isSearching"
              @search="handleSearch"
              @clear="handleClearSearch"
            />
            
            <!-- 曲風按鈕 -->
            <GenreButtons 
              :jamendo-tags="availableTags"
              :selected-tag="selectedTag"
              @search-by-tag="handleSearchByTag"
            />
            
            <!-- 播放列表控制 -->
            <PlaylistControl 
              :playlist-config="playlistConfig"
              :is-generating-playlist="isGeneratingPlaylist"
              :custom-playlist-status="customPlaylistStatus"
              :current-mode="appStore.currentMode"
              @start-custom-playlist="handleStartCustomPlaylist"
            />
            
            <!-- 收藏頁面標題 -->
            <FavoriteHeader 
              v-if="appStore.currentMode === 'favorites'"
              :favorite-count="favoriteTrackIds.size"
              :total-duration="totalFavoriteDuration"
              :last-favorite-date="lastFavoriteDate"
              @play-all="handlePlayAllFavorites"
              @shuffle-play="handleShuffleFavorites"
              @clear-favorites="handleClearFavorites"
              @explore-music="() => appStore.setCurrentMode('popular')"
            />
            
            <!-- 音樂網格 -->
            <MusicGrid 
              :displayed-tracks="displayedTracks"
              :current-track="playerStore.currentTrack"
              :is-playing="playerStore.isPlaying"
              :is-loading-track="playerStore.isLoadingTrack"
              :favorite-track-ids="favoriteTrackIds"
              :loading="isLoading"
              :loading-more="isLoadingMore"
              :show-load-more="showLoadMore"
              :current-mode="appStore.currentMode"
              :is-jamendo-connected="jamendoStore.isConnected"
              :jamendo-configured="jamendoStore.configured"
              :user="userStore.user"
              @track-click="handleTrackClick"
              @toggle-favorite="handleToggleFavorite"
              @add-to-playlist="handleAddToPlaylist"
              @share-track="handleShareTrack"
              @connect-jamendo="handleConnectJamendo"
              @show-login="handleShowLogin"
              @load-more="handleLoadMore"
            />
          </div>
        </div>
      </main>
    </div>

    <!-- 認證彈窗 -->
    <AuthModal 
      v-if="userStore.showModal"
      :mode="userStore.modalMode"
      @close="handleCloseAuthModal"
      @login-success="handleLoginSuccess"
      @register-success="handleRegisterSuccess"
      @switch-mode="handleSwitchAuthMode"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import TopPlayer from './components/player/TopPlayer.vue'
import Sidebar from './components/layout/Sidebar.vue'
import SearchBar from './components/ui/SearchBar.vue'
import GenreButtons from './components/music/GenreButtons.vue'
import PlaylistControl from './components/music/PlaylistControl.vue'
import FavoriteHeader from './components/music/FavoriteHeader.vue'
import MusicGrid from './components/music/MusicGrid.vue'
import AuthModal from './components/auth/AuthModal.vue'

// Pinia Stores
import { useJamendoStore } from './stores/jamendoStore'
import { useUserStore } from './stores/userStore'
import { useAppStore } from './stores/appStore'
import { usePlayerStore } from './stores/playerStore'

// Composables
import { useJamendo } from './composables/useJamendo'

// 使用 stores
const jamendoStore = useJamendoStore()
const userStore = useUserStore()
const appStore = useAppStore()
const playerStore = usePlayerStore()

// 使用 Jamendo composable
const jamendo = useJamendo()

// 響應式數據
const searchQuery = ref('')
const selectedTag = ref('')
const isSearching = ref(false)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const showLoadMore = ref(false)
const displayedTracks = ref([])
const favoriteTrackIds = ref(new Set())
const availableTags = ref(['pop', 'rock', 'electronic', 'jazz', 'classical', 'hiphop', 'metal', 'world', 'soundtrack', 'lounge'])

// 播放列表配置
const playlistConfig = ref([
  { genre: 'Pop', count: 3 },
  { genre: 'Rock', count: 5 },
  { genre: 'Jazz', count: 1 }
])
const isGeneratingPlaylist = ref(false)
const customPlaylistStatus = ref({
  isActive: false,
  currentGroup: 1,
  currentGenre: 'Pop',
  currentInGroup: 1,
  totalInGroup: 3,
  overallProgress: 1,
  totalTracks: 9
})

// 計算屬性
const totalFavoriteDuration = computed(() => {
  // 計算收藏歌曲的總時長
  return 0 // TODO: 實現邏輯
})

const lastFavoriteDate = computed(() => {
  // 最後收藏的日期
  return null // TODO: 實現邏輯
})

// 載入歌曲數據
const loadTracks = async () => {
  if (!jamendoStore.isConnected) {
    console.log('⚠️ Jamendo 未連接，無法載入音樂')
    return
  }

  try {
    isLoading.value = true
    let tracks = []

    switch (appStore.currentMode) {
      case 'popular':
        tracks = await jamendo.getPopularTracks()
        break
      case 'latest':
        tracks = await jamendo.getLatestTracks()
        break
      case 'random':
        tracks = await jamendo.getRandomTracks()
        break
      case 'favorites':
        tracks = getFavoriteTracks()
        break
      case 'search':
        if (searchQuery.value) {
          tracks = await jamendo.searchTracks(searchQuery.value)
        }
        break
      case 'genre':
        if (selectedTag.value) {
          tracks = await jamendo.getTracksByTag(selectedTag.value)
        }
        break
    }

    displayedTracks.value = tracks
    showLoadMore.value = tracks.length >= 50

  } catch (error) {
    console.error('❌ 載入音樂失敗:', error)
    displayedTracks.value = []
  } finally {
    isLoading.value = false
  }
}

// 獲取收藏歌曲
const getFavoriteTracks = () => {
  if (!userStore.user) return []
  
  const favorites = JSON.parse(localStorage.getItem(`favorites_${userStore.user.id}`) || '[]')
  return favorites
}

// 載入收藏狀態
const loadFavoriteStatus = () => {
  if (!userStore.user) {
    favoriteTrackIds.value = new Set()
    return
  }
  
  const favorites = getFavoriteTracks()
  favoriteTrackIds.value = new Set(favorites.map(track => track.id))
}

// 事件處理 - 播放控制
const handleTogglePlay = () => {
  jamendo.togglePlay()
}

const handlePreviousTrack = () => {
  jamendo.previousTrack()
}

const handleNextTrack = () => {
  jamendo.nextTrack()
}

const handleSeek = (event) => {
  jamendo.seek(event)
}

const handleVolumeChange = (event) => {
  jamendo.setVolume(event.target.value)
}

const handleToggleShuffle = () => {
  jamendo.toggleShuffle()
}

const handleToggleRepeat = () => {
  jamendo.toggleRepeat()
}

// 事件處理 - 歌曲操作
const handleTrackClick = async (track, playlist, index) => {
  try {
    await jamendo.playTrack(track, playlist, index)
  } catch (error) {
    console.error('❌ 播放歌曲失敗:', error)
  }
}

const handleToggleFavorite = (track) => {
  if (!userStore.user) {
    userStore.showLoginModal()
    return
  }

  const favorites = getFavoriteTracks()
  const isFavorited = favoriteTrackIds.value.has(track.id)

  if (isFavorited) {
    // 移除收藏
    const updatedFavorites = favorites.filter(fav => fav.id !== track.id)
    localStorage.setItem(`favorites_${userStore.user.id}`, JSON.stringify(updatedFavorites))
    favoriteTrackIds.value.delete(track.id)
    console.log('💔 取消收藏:', track.name)
  } else {
    // 添加收藏
    const updatedFavorites = [...favorites, { ...track, favoriteDate: new Date().toISOString() }]
    localStorage.setItem(`favorites_${userStore.user.id}`, JSON.stringify(updatedFavorites))
    favoriteTrackIds.value.add(track.id)
    console.log('❤️ 添加收藏:', track.name)
  }

  // 如果在收藏頁面，重新載入
  if (appStore.currentMode === 'favorites') {
    loadTracks()
  }
}

const handleAddToFavorites = () => {
  if (!playerStore.currentTrack.name) return
  handleToggleFavorite(playerStore.currentTrack)
}

const handleAddToPlaylist = (track) => {
  console.log('📋 加入播放列表:', track?.name || playerStore.currentTrack.name)
  // TODO: 實現播放列表功能
}

const handleShareTrack = (track) => {
  if (navigator.share && track) {
    navigator.share({
      title: track.name,
      text: `正在聽 ${track.artist_name} 的 ${track.name}`,
      url: window.location.href
    })
  }
}

// 事件處理 - 搜尋和篩選
const handleSearch = async (query) => {
  searchQuery.value = query
  appStore.setCurrentMode('search')
  await loadTracks()
}

const handleClearSearch = () => {
  searchQuery.value = ''
  appStore.setCurrentMode('popular')
  loadTracks()
}

const handleSearchByTag = async (tag) => {
  selectedTag.value = tag
  appStore.setCurrentMode('genre')
  await loadTracks()
}

// 事件處理 - 收藏操作
const handlePlayAllFavorites = async () => {
  const favorites = getFavoriteTracks()
  if (favorites.length > 0) {
    await jamendo.playTrack(favorites[0], favorites, 0)
  }
}

const handleShuffleFavorites = async () => {
  const favorites = getFavoriteTracks()
  if (favorites.length > 0) {
    playerStore.setShuffled(true)
    const randomIndex = Math.floor(Math.random() * favorites.length)
    await jamendo.playTrack(favorites[randomIndex], favorites, randomIndex)
  }
}

const handleClearFavorites = () => {
  if (confirm('確定要清空所有收藏嗎？此操作無法復原。')) {
    localStorage.removeItem(`favorites_${userStore.user.id}`)
    favoriteTrackIds.value.clear()
    loadTracks()
  }
}

// 事件處理 - 其他
const handleConnectJamendo = async () => {
  try {
    const success = await jamendo.connectJamendo()
    if (success) {
      jamendoStore.setConnected(true)
      loadTracks()
    }
  } catch (error) {
    console.error('❌ Jamendo 連接失敗:', error)
  }
}

const handleSetMode = (mode) => {
  appStore.setCurrentMode(mode)
  loadTracks()
}

const handleShowLogin = () => {
  userStore.showLoginModal()
}

const handleLogout = () => {
  userStore.logout()
  favoriteTrackIds.value.clear()
  if (appStore.currentMode === 'favorites') {
    appStore.setCurrentMode('popular')
    loadTracks()
  }
}

const handleLoadMore = async () => {
  // TODO: 實現載入更多功能
  console.log('📄 載入更多歌曲')
}

const handleStartCustomPlaylist = () => {
  isGeneratingPlaylist.value = true
  // TODO: 實現自定義播放列表生成
  setTimeout(() => {
    isGeneratingPlaylist.value = false
  }, 2000)
}

// 認證相關事件處理
const handleCloseAuthModal = () => {
  userStore.closeModal()
}

const handleLoginSuccess = (userData) => {
  userStore.setUser(userData)
  userStore.closeModal()
  loadFavoriteStatus()
}

const handleRegisterSuccess = (userData) => {
  console.log('✅ 註冊成功:', userData.username)
  userStore.setModalMode('login')
}

const handleSwitchAuthMode = (mode) => {
  userStore.setModalMode(mode)
}

// 監聽模式變化
watch(() => appStore.currentMode, (newMode) => {
  console.log('🔄 模式切換至:', newMode)
  loadTracks()
})

// 監聽用戶登入狀態
watch(() => userStore.user, (newUser) => {
  if (newUser) {
    loadFavoriteStatus()
  } else {
    favoriteTrackIds.value.clear()
  }
})

// 初始化
onMounted(async () => {
  console.log('🚀 DDM360 應用已初始化')
  
  // 初始化用戶狀態
  userStore.initializeUser()
  
  // 載入收藏狀態
  loadFavoriteStatus()
  
  // 載入可用標籤
  try {
    const tags = await jamendo.getAvailableTags()
    availableTags.value = tags
  } catch (error) {
    console.warn('⚠️ 載入標籤失敗，使用預設標籤')
  }
  
  // 如果 Jamendo 已連接，載入初始數據
  if (jamendoStore.isConnected) {
    loadTracks()
  }
})
</script>

<style scoped>
/* 確保頁面佈局正確 */
.min-h-screen {
  min-height: 100vh;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .flex {
    @apply flex-col;
  }
  
  .p-8 {
    @apply p-4;
  }
}
</style>