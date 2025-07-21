<template>
  <div class="flex flex-col items-center justify-center py-12">
    <!-- 載入動畫 -->
    <div class="relative mb-4">
      <!-- 外圈 -->
      <div class="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-orange-500"></div>
      
      <!-- 內圈 -->
      <div class="absolute inset-2 w-8 h-8 border-4 border-gray-100 rounded-full animate-spin border-t-orange-300 animate-reverse"></div>
      
      <!-- 中心點 -->
      <div class="absolute inset-4 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
    </div>
    
    <!-- 載入文字 -->
    <div class="text-center">
      <p class="text-lg font-medium text-gray-700 mb-1">
        {{ title }}
      </p>
      <p class="text-sm text-gray-500">
        {{ subtitle }}
      </p>
    </div>
    
    <!-- 進度點（可選） -->
    <div v-if="showDots" class="flex space-x-1 mt-4">
      <div 
        v-for="i in 3" 
        :key="i"
        class="w-2 h-2 bg-orange-400 rounded-full animate-pulse"
        :style="{ animationDelay: `${i * 0.2}s` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '載入中...'
  },
  subtitle: {
    type: String,
    default: '請稍候片刻'
  },
  showDots: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

// 根據大小調整樣式
const sizeClasses = computed(() => {
  const sizes = {
    small: 'py-6',
    medium: 'py-12', 
    large: 'py-16'
  }
  return sizes[props.size]
})
</script>

<style scoped>
/* 反向旋轉動畫 */
.animate-reverse {
  animation-direction: reverse;
}

/* 自定義脈動動畫 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

/* 載入點動畫 */
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 旋轉動畫優化 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>