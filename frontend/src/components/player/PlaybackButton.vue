<!-- 可重用的播放控制按鈕 -->
<template>
  <button
    :disabled="disabled"
    class="playback-button group relative overflow-hidden"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- 背景圓圈效果 -->
    <div 
      class="absolute inset-0 rounded-full transition-all duration-200"
      :class="backgroundClasses"
    />
    
    <!-- 按鈕內容 -->
    <div class="relative z-10 flex items-center justify-center">
      <!-- 載入狀態 -->
      <font-awesome-icon 
        v-if="isLoading" 
        icon="spinner" 
        class="animate-spin"
        :class="iconSizeClass"
      />
      
      <!-- 正常圖標 -->
      <font-awesome-icon 
        v-else
        :icon="icon" 
        :class="iconSizeClass"
      />
    </div>

    <!-- 懸停波紋效果 -->
    <div 
      class="absolute inset-0 rounded-full bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-200"
    />

    <!-- 焦點環 -->
    <div 
      class="absolute inset-0 rounded-full ring-2 ring-white/30 scale-0 transition-transform duration-150"
      :class="{ 'scale-100': focused }"
    />
  </button>
</template>

<script setup>
import { computed, ref } from 'vue'

// Props
const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'secondary'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits(['click'])

// 狀態
const focused = ref(false)

// 計算屬性
const buttonClasses = computed(() => {
  const baseClasses = 'flex items-center justify-center rounded-full border-none cursor-pointer transition-all duration-200 focus:outline-none'
  
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }
  
  const variantClasses = {
    default: 'text-white hover:text-orange-300',
    primary: 'text-white hover:text-orange-200',
    secondary: 'text-gray-300 hover:text-white'
  }
  
  const stateClasses = props.disabled 
    ? 'opacity-50 cursor-not-allowed'
    : 'hover:scale-105 active:scale-95'
  
  return [
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    stateClasses
  ].join(' ')
})

const backgroundClasses = computed(() => {
  if (props.disabled) return 'bg-gray-600/20'
  
  const variantBg = {
    default: 'bg-white/10 group-hover:bg-white/20',
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 group-hover:from-orange-400 group-hover:to-orange-500 shadow-lg',
    secondary: 'bg-gray-700/50 group-hover:bg-gray-600/50'
  }
  
  return variantBg[props.variant]
})

const iconSizeClass = computed(() => {
  const sizes = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl'
  }
  return sizes[props.size]
})

// 方法
const handleClick = () => {
  if (!props.disabled && !props.isLoading) {
    focused.value = true
    setTimeout(() => {
      focused.value = false
    }, 150)
  }
}
</script>

<style scoped>
.playback-button {
  /* 確保按鈕有足夠的點擊區域 */
  min-width: 44px;
  min-height: 44px;
}

/* 主按鈕特殊效果 */
.playback-button.w-16 {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.playback-button.w-16:hover {
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.3);
}

/* 按下動畫 */
.playback-button:active {
  transform: scale(0.95);
}

/* 載入動畫優化 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 響應式調整 */
@media (max-width: 640px) {
  .w-16 {
    @apply w-14;
  }
  
  .h-16 {
    @apply h-14;
  }
  
  .w-12 {
    @apply w-10;
  }
  
  .h-12 {
    @apply h-10;
  }
}
</style>