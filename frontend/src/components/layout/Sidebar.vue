<template>
  <aside class="sidebar-gradient flex flex-col w-64 min-h-screen text-white">
    <!-- Logo 區域 -->
    <div class="p-6 border-b border-white/10">
      <div class="flex items-center justify-center mb-4">
        <img 
          src="@/assets/images/12.png" 
          alt="DDM360" 
          class="h-auto w-20 object-contain" 
        />
      </div>
      
      <!-- Jamendo 連接狀態 -->
      <div class="flex items-center justify-center">
        <button 
          v-if="!isJamendoConnected && jamendoConfigured" 
          @click="handleConnectJamendo"
          class="text-orange-400 hover:text-orange-300 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
        >
          <font-awesome-icon icon="music" class="mr-1" />
          連接 Jamendo
        </button>
        
        <span 
          v-else-if="!jamendoConfigured" 
          class="text-gray-400 text-xs"
        >
          Jamendo 未配置
        </span>
        
        <div 
          v-else 
          class="flex items-center text-green-400"
        >
          <font-awesome-icon icon="music" />
          <span class="ml-1 text-xs">已連接</span>
        </div>
      </div>
    </div>

    <!-- 導航選單 -->
    <nav class="flex-1 px-4 py-6 space-y-2">
      <SidebarMenuItem
        v-for="item in navigationItems"
        :key="item.id"
        :item="item"
        :is-active="currentMode === item.id"
        :is-locked="item.requiresAuth && !user"
        @click="handleMenuClick(item)"
      />
    </nav>

    <!-- 用戶區域 -->
    <div class="p-4 border-t border-white/10">
      <!-- 未登入狀態 -->
      <button 
        v-if="!user"
        @click="showLoginModal"
        class="flex items-center w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 font-medium"
      >
        <font-awesome-icon icon="user" class="mr-3" />
        會員登入
      </button>
      
      <!-- 已登入狀態 -->
      <div v-else class="space-y-3">
        <!-- 用戶信息卡片 -->
        <div class="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mr-3 overflow-hidden">
            <img 
              v-if="user.picture" 
              :src="user.picture" 
              :alt="user.username"
              class="w-full h-full object-cover"
            />
            <font-awesome-icon 
              v-else 
              icon="user" 
              class="text-white text-sm" 
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-white truncate">{{ user.username }}</p>
            <p class="text-xs text-gray-300 truncate">{{ user.email }}</p>
            <span 
              v-if="user.loginType === 'google'" 
              class="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded mt-1"
            >
              Google
            </span>
          </div>
        </div>
        
        <!-- 登出按鈕 -->
        <button 
          @click="handleLogout"
          class="flex items-center w-full p-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 transition-all duration-200 font-medium"
        >
          <font-awesome-icon icon="sign-out-alt" class="mr-3" />
          登出
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import SidebarMenuItem from './SidebarMenuItem.vue'

// Props
const props = defineProps({
  isJamendoConnected: {
    type: Boolean,
    required: true
  },
  jamendoConfigured: {
    type: Boolean,
    required: true
  },
  currentMode: {
    type: String,
    required: true
  },
  user: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'connect-jamendo', 
  'set-mode', 
  'show-login', 
  'logout'
])

// 導航選單項目
const navigationItems = computed(() => [
  {
    id: 'popular',
    icon: 'fire',
    label: '熱門歌曲',
    description: '最受歡迎的音樂',
    requiresAuth: false
  },
  {
    id: 'latest',
    icon: 'music',
    label: '最新音樂',
    description: '新發布的歌曲',
    requiresAuth: false
  },
  {
    id: 'random',
    icon: 'random',
    label: '隨機播放',
    description: '發現新音樂',
    requiresAuth: false
  },
  {
    id: 'favorites',
    icon: 'heart',
    label: '我的收藏',
    description: '已收藏的歌曲',
    requiresAuth: true,
    badge: props.user ? '❤️' : '🔒'
  }
])

// 事件處理
const handleConnectJamendo = () => {
  emit('connect-jamendo')
}

const handleMenuClick = (item) => {
  if (item.requiresAuth && !props.user) {
    emit('show-login')
    return
  }
  emit('set-mode', item.id)
}

const showLoginModal = () => {
  emit('show-login')
}

const handleLogout = () => {
  emit('logout')
}
</script>

<style scoped>
/* 只保留無法用 Tailwind 實現的自定義樣式 */
.sidebar-gradient {
  background: linear-gradient(rgba(4, 5, 8, 0.7), rgba(61, 2, 116, 0.9)), 
              url('@/assets/images/58.jpg');
  background-size: cover;
  background-position: center;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .sidebar-gradient {
    @apply w-52;
  }
}
</style>