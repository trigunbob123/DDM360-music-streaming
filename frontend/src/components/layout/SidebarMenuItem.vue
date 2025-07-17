<template>
  <button 
    @click="handleClick"
    class="menu-item group relative flex items-center w-full p-3 rounded-lg transition-all duration-200 text-left overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/20"
    :class="[
      isActive 
        ? 'bg-white/15 shadow-lg transform translate-x-2' 
        : 'hover:bg-white/10 hover:translate-x-1',
      isLocked 
        ? 'opacity-60 cursor-not-allowed' 
        : 'cursor-pointer'
    ]"
    :disabled="isLocked"
  >
    <!-- 活躍指示條 -->
    <div 
      v-if="isActive"
      class="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"
    />
    
    <!-- 圖標 -->
    <div 
      class="w-10 h-10 flex items-center justify-center rounded-lg mr-3 transition-all duration-200"
      :class="isActive 
        ? 'bg-orange-500/20 text-orange-300' 
        : 'bg-white/10 text-white group-hover:bg-white/15'"
    >
      <font-awesome-icon :icon="item.icon" />
    </div>
    
    <!-- 文字內容 -->
    <div class="flex-1 min-w-0">
      <span 
        class="block font-medium text-sm transition-colors duration-200"
        :class="isActive ? 'text-orange-200' : 'text-white'"
      >
        {{ item.label }}
      </span>
      <span 
        v-if="item.description" 
        class="block text-xs mt-1 transition-colors duration-200"
        :class="isActive ? 'text-orange-300/70' : 'text-gray-300'"
      >
        {{ item.description }}
      </span>
    </div>
    
    <!-- 右側指示器 -->
    <div class="flex items-center">
      <!-- 鎖定圖標 -->
      <font-awesome-icon 
        v-if="isLocked" 
        icon="lock" 
        class="text-gray-400 text-sm" 
        title="需要登入"
      />
      
      <!-- 徽章 -->
      <span 
        v-else-if="item.badge" 
        class="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-300"
      >
        {{ item.badge }}
      </span>
      
      <!-- 活躍指示器 -->
      <div 
        v-if="isActive" 
        class="w-2 h-2 bg-orange-400 rounded-full animate-pulse ml-2"
      />
    </div>

    <!-- 懸停效果漸層 -->
    <div 
      class="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      :class="{ 'hidden': isLocked }"
    />
  </button>
</template>

<script setup>
// Props
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['click'])

// 事件處理
const handleClick = () => {
  if (!props.isLocked) {
    emit('click', props.item)
  }
}
</script>

<style scoped>
/* 只保留動畫效果，其餘用 Tailwind 處理 */
.menu-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>