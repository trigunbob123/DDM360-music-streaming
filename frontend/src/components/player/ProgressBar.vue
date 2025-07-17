<!-- 進度條和時間控制 -->
<template>
  <div class="w-full space-y-2">
    <!-- 進度條容器 -->
    <div class="relative group">
      <!-- 進度條軌道 -->
      <div 
        ref="progressContainer"
        class="w-full h-1 bg-gray-600 rounded-full cursor-pointer relative overflow-hidden"
        :class="{ 'cursor-not-allowed': disabled }"
        @click="handleSeek"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
        @mousemove="updateTooltipPosition"
      >
        <!-- 緩衝進度（如果有的話） -->
        <div 
          v-if="bufferedPercentage > 0"
          class="absolute top-0 left-0 h-full bg-gray-500/50 rounded-full transition-all duration-150"
          :style="{ width: bufferedPercentage + '%' }"
        />
        
        <!-- 播放進度 -->
        <div 
          class="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
          :class="progressBarClasses"
          :style="{ width: progressPercentage + '%' }"
        />
        
        <!-- 進度點（懸停時顯示） -->
        <div 
          v-if="!disabled"
          class="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          :style="{ left: progressPercentage + '%', marginLeft: '-6px' }"
        />
      </div>

      <!-- 懸停時間提示 -->
      <div 
        v-if="showTooltip && !disabled && duration > 0"
        class="absolute bottom-full mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded pointer-events-none transform -translate-x-1/2 transition-all duration-150"
        :style="{ left: tooltipPosition + '%' }"
      >
        {{ formatTime(hoveredTime) }}
        <!-- 小箭頭 -->
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/80"></div>
      </div>
    </div>

    <!-- 時間顯示 -->
    <div class="flex items-center justify-between text-xs text-gray-300">
      <span class="tabular-nums">{{ formatTime(currentTime) }}</span>
      <span class="tabular-nums">{{ formatTime(duration) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// Props
const props = defineProps({
  currentTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  bufferedPercentage: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits(['seek'])

// 狀態
const progressContainer = ref(null)
const showTooltip = ref(false)
const tooltipPosition = ref(0)
const hoveredTime = ref(0)

// 計算屬性
const progressBarClasses = computed(() => {
  if (props.disabled) {
    return 'bg-gray-400'
  }
  return 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 shadow-lg'
})

// 方法
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleSeek = (event) => {
  if (props.disabled || !props.duration) return
  
  const rect = progressContainer.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const progressPercent = Math.max(0, Math.min(1, clickX / rect.width))
  
  emit('seek', {
    ...event,
    progressPercent,
    targetTime: progressPercent * props.duration
  })
}

const updateTooltipPosition = (event) => {
  if (!progressContainer.value || props.disabled || !props.duration) return
  
  const rect = progressContainer.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const progressPercent = Math.max(0, Math.min(1, mouseX / rect.width))
  
  tooltipPosition.value = progressPercent * 100
  hoveredTime.value = progressPercent * props.duration
}

// 導出 emit 函數
const emit = defineEmits(['seek'])
</script>

<style scoped>
/* 確保數字等寬顯示 */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* 進度條發光效果 */
.bg-gradient-to-r {
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.3);
}

/* 響應式調整 */
@media (max-width: 640px) {
  .h-1 {
    @apply h-1;
  }
  
  .w-3 {
    @apply w-2;
  }
  
  .h-3 {
    @apply h-2;
  }
}

/* 禁用狀態 */
.cursor-not-allowed {
  cursor: not-allowed !important;
}

.cursor-not-allowed * {
  cursor: not-allowed !important;
}
</style>