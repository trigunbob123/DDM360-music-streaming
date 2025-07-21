<template>
  <div class="text-center py-16">
    <div class="mx-auto w-24 h-24 text-gray-300 mb-6">
      <font-awesome-icon :icon="icon" class="text-6xl" />
    </div>
    
    <h3 class="text-xl font-semibold text-gray-600 mb-2">
      {{ title }}
    </h3>
    
    <p class="text-gray-500 mb-6 max-w-md mx-auto">
      {{ description }}
    </p>
    
    <!-- 根據不同狀態顯示不同的行動按鈕 -->
    <div class="space-y-3">
      <!-- Jamendo 未連接 -->
      <button 
        v-if="!isJamendoConnected && jamendoConfigured"
        @click="$emit('connect-jamendo')" 
        class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
      >
        <font-awesome-icon icon="music" class="mr-2" />
        連接 Jamendo
      </button>
      
      <!-- 需要登入 -->
      <button 
        v-else-if="currentMode === 'favorites' && !user"
        @click="$emit('show-login')"
        class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
      >
        <font-awesome-icon icon="user" class="mr-2" />
        登入查看收藏
      </button>
      
      <!-- Jamendo 未配置 -->
      <div v-else-if="!jamendoConfigured" class="text-sm text-gray-400">
        <p>Jamendo 服務未配置</p>
        <p class="text-xs mt-1">請聯繫管理員設置 API 密鑰</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
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

defineEmits(['connect-jamendo', 'show-login'])

const icon = computed(() => {
  if (!props.jamendoConfigured) return 'exclamation-triangle'
  if (!props.isJamendoConnected) return 'music'
  if (props.currentMode === 'favorites') return 'heart'
  return 'search'
})

const title = computed(() => {
  if (!props.jamendoConfigured) return 'Jamendo 未配置'
  if (!props.isJamendoConnected) return '連接 Jamendo'
  if (props.currentMode === 'favorites' && !props.user) return '需要登入'
  if (props.currentMode === 'favorites') return '還沒有收藏'
  return '搜尋音樂'
})

const description = computed(() => {
  if (!props.jamendoConfigured) return '音樂服務需要正確的 API 配置才能使用'
  if (!props.isJamendoConnected) return '連接 Jamendo 來播放免費的 Creative Commons 音樂'
  if (props.currentMode === 'favorites' && !props.user) return '登入帳戶即可收藏喜愛的音樂'
  if (props.currentMode === 'favorites') return '點擊歌曲右上角的愛心來收藏音樂'
  return '使用上方搜尋欄或點擊曲風按鈕來尋找音樂'
})
</script>