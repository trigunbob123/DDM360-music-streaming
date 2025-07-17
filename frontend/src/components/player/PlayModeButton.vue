<!-- 播放模式按鈕（隨機/重複） -->
<template>
  <button
    class="play-mode-button group relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none"
    :class="buttonClasses"
    :title="tooltip"
    @click="$emit('click')"
  >
    <font-awesome-icon 
      :icon="icon" 
      class="text-sm transition-transform duration-200 group-hover:scale-110"
    />
    
    <!-- 活躍狀態指示點 -->
    <div 
      v-if="isActive"
      class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full"
    />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    required: true
  },
  tooltip: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  return props.isActive 
    ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' 
    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
})
</script>