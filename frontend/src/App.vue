
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
          <!-- 測試播放器的臨時內容 -->
          <div class="max-w-4xl mx-auto space-y-8">
            <h1 class="text-3xl font-bold text-gray-800">
              🎵 DDM360 音樂串流平台
            </h1>
            
            <!-- 播放器測試區域 -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-4">播放器測試</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 測試歌曲列表 -->
                <div>
                  <h4 class="font-medium text-gray-600 mb-3">測試歌曲</h4>
                  <div class="space-y-2">
                    <button 
                      v-for="track in testTracks" 
                      :key="track.id"
                      @click="handleTestPlayTrack(track)"
                      class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      :class="{ 'bg-orange-50 border-orange-200': playerStore.currentTrack.id === track.id }"
                    >
                      <div class="font-medium text-sm">{{ track.name }}</div>
                      <div class="text-xs text-gray-500">{{ track.artist_name }}</div>
                    </button>
                  </div>
                </div>
                
                <!-- 當前狀態 -->
                <div>
                  <h4 class="font-medium text-gray-600 mb-3">播放器狀態</h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span>狀態:</span>
                      <span :class="playerStore.isPlaying ? 'text-green-600' : 'text-gray-500'">
                        {{ playerStore.isPlaying ? '播放中' : '已暫停' }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span>載入中:</span>
                      <span :class="playerStore.isLoadingTrack ? 'text-orange-600' : 'text-gray-500'">
                        {{ playerStore.isLoadingTrack ? '是' : '否' }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span>音量:</span>
                      <span>{{ playerStore.volume }}%</span>
                    </div>
                    <div class="flex justify-between">
                      <span>隨機播放:</span>
                      <span>{{ playerStore.isShuffled ? '開啟' : '關閉' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>重複模式:</span>
                      <span>{{ repeatModeText }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 其他狀態卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- 當前模式 -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">當前模式</h3>
                <p class="text-2xl font-bold text-blue-600">{{ modeDisplayName }}</p>
              </div>
              
              <!-- 用戶狀態 -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">用戶狀態</h3>
                <p class="font-medium" :class="userStore.user ? 'text-green-600' : 'text-gray-500'">
                  {{ userStore.user ? `✅ ${userStore.user.username}` : '👤 未登入' }}
                </p>
              </div>
              
              <!-- Jamendo 狀態 -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Jamendo 狀態</h3>
                <p class="font-medium" :class="jamendoStatusColor">
                  {{ jamendoStatusIcon }} {{ jamendoStatusText }}
                </p>
              </div>
            </div>
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
import { computed, ref } from 'vue'
import TopPlayer from './components/player/TopPlayer.vue'
import Sidebar from './components/layout/Sidebar.vue'
import AuthModal from './components/auth/AuthModal.vue'

// Pinia Stores
import { useJamendoStore } from './stores/jamendoStore'
import { useUserStore } from './stores/userStore'
import { useAppStore } from './stores/appStore'
import { usePlayerStore } from './stores/playerStore'

// 使用 Pinia stores
const jamendoStore = useJamendoStore()
const userStore = useUserStore()
const appStore = useAppStore()
const playerStore = usePlayerStore()

// 測試數據
const testTracks = ref([
  {
    id: 1,
    name: "Happy Time",
    artist_name: "Omotesound Tokyo",
    album_name: "Happy Album",
    duration: 186,
    image: "https://usercontent.jamendo.com/a/a1/0/1/track/a10010.jpg",
    audio: "https://prod-1.storage.jamendo.com/download/track/1/mp32/",
    audiodownload: "https://prod-1.storage.jamendo.com/download/track/1/mp32/"
  },
  {
    id: 2,
    name: "Night Party",
    artist_name: "Omotesound Tokyo",
    album_name: "Night Album",
    duration: 203,
    image: "https://usercontent.jamendo.com/a/a2/0/2/track/a20020.jpg",
    audio: "https://prod-1.storage.jamendo.com/download/track/2/mp32/",
    audiodownload: "https://prod-1.storage.jamendo.com/download/track/2/mp32/"
  },
  {
    id: 3,
    name: "Jazz Cocktail Lounge",
    artist_name: "Pinegroove",
    album_name: "Lounge Collection",
    duration: 225,
    image: "https://usercontent.jamendo.com/a/a3/0/3/track/a30030.jpg",
    audio: "https://prod-1.storage.jamendo.com/download/track/3/mp32/",
    audiodownload: "https://prod-1.storage.jamendo.com/download/track/3/mp32/"
  }
])

// 計算屬性
const modeDisplayName = computed(() => {
  const modeMap = {
    'popular': '🔥 熱門歌曲',
    'latest': '🆕 最新音樂',
    'random': '🎲 隨機播放',
    'favorites': '❤️ 我的收藏'
  }
  return modeMap[appStore.currentMode] || '未知模式'
})

const repeatModeText = computed(() => {
  const modeMap = {
    'off': '關閉',
    'all': '列表重複',
    'one': '單曲重複'
  }
  return modeMap[playerStore.repeatMode]
})

const jamendoStatusColor = computed(() => {
  if (!jamendoStore.configured) return 'text-red-500'
  if (!jamendoStore.isConnected) return 'text-yellow-500'
  return 'text-green-500'
})

const jamendoStatusIcon = computed(() => {
  if (!jamendoStore.configured) return '❌'
  if (!jamendoStore.isConnected) return '⚠️'
  return '✅'
})

const jamendoStatusText = computed(() => {
  if (!jamendoStore.configured) return '未配置'
  if (!jamendoStore.isConnected) return '未連接'
  return '已連接'
})

// 播放器事件處理
const handleTestPlayTrack = (track) => {
  playerStore.setCurrentTrack(track)
  playerStore.setPlaying(true)
  console.log('🎵 測試播放:', track.name)
}

const handleTogglePlay = () => {
  playerStore.togglePlay()
}

const handlePreviousTrack = () => {
  console.log('⏮️ 上一首')
  // 實際實現會調用 useJamendo 的 previousTrack
}

const handleNextTrack = () => {
  console.log('⏭️ 下一首')
  // 實際實現會調用 useJamendo 的 nextTrack
}

const handleSeek = (event) => {
  const newTime = event.targetTime
  playerStore.setCurrentTime(newTime)
  console.log('🎯 跳轉到:', Math.floor(newTime), '秒')
}

const handleVolumeChange = (event) => {
  const newVolume = parseInt(event.target.value)
  playerStore.setVolume(newVolume)
  console.log('🔊 音量設為:', newVolume + '%')
}

const handleToggleShuffle = () => {
  playerStore.toggleShuffle()
}

const handleToggleRepeat = () => {
  playerStore.toggleRepeat()
}

const handleAddToFavorites = () => {
  console.log('❤️ 加入收藏:', playerStore.currentTrack.name)
}

const handleAddToPlaylist = () => {
  console.log('📋 加入播放列表:', playerStore.currentTrack.name)
}

// 其他事件處理（與之前相同）
const handleConnectJamendo = async () => {
  try {
    await jamendoStore.connect()
    console.log('✅ Jamendo 連接成功')
  } catch (error) {
    console.error('❌ Jamendo 連接失敗:', error)
  }
}

const handleSetMode = (mode) => {
  appStore.setCurrentMode(mode)
}

const handleShowLogin = () => {
  userStore.showLoginModal()
}

const handleLogout = () => {
  userStore.logout()
  if (appStore.currentMode === 'favorites') {
    appStore.setCurrentMode('popular')
  }
}

const handleCloseAuthModal = () => {
  userStore.closeModal()
}

const handleLoginSuccess = (userData) => {
  userStore.setUser(userData)
  userStore.closeModal()
}

const handleRegisterSuccess = (userData) => {
  console.log('✅ 註冊成功:', userData.username)
  userStore.setModalMode('login')
}

const handleSwitchAuthMode = (mode) => {
  userStore.setModalMode(mode)
}
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