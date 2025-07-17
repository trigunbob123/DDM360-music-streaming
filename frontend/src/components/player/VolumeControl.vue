<!-- 音量控制 -->
<template>
  <div class="flex items-center space-x-3">
    <!-- 音量圖標按鈕 -->
    <button 
      @click="toggleMute"
      class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
      :title="volumeTooltip"
    >
      <font-awesome-icon :icon="volumeIcon" class="text-sm" />
    </button>
    
    <!-- 音量滑桿 -->
    <div class="relative group">
      <input 
        type="range" 
        min="0" 
        max="100" 
        :value="volume"
        @input="handleVolumeChange"
        class="volume-slider w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
      />
      
      <!-- 音量百分比顯示 -->
      <div 
        class="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        {{ volume }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  volume: {
    type: Number,
    default: 50
  }
})

const emit = defineEmits(['volume-change'])

const lastVolume = ref(50)

const volumeIcon = computed(() => {
  if (props.volume === 0) return 'volume-mute'
  if (props.volume < 30) return 'volume-down'
  if (props.volume < 70) return 'volume-down'
  return 'volume-up'
})

const volumeTooltip = computed(() => {
  return props.volume === 0 ? '取消靜音' : '靜音'
})

const handleVolumeChange = (event) => {
  const newVolume = parseInt(event.target.value)
  emit('volume-change', { target: { value: newVolume } })
}

const toggleMute = () => {
  if (props.volume === 0) {
    emit('volume-change', { target: { value: lastVolume.value } })
  } else {
    lastVolume.value = props.volume
    emit('volume-change', { target: { value: 0 } })
  }
}
</script>

<style scoped>
.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-slider {
  background: linear-gradient(to right, #f97316 0%, #f97316 var(--volume, 50%), #4b5563 var(--volume, 50%), #4b5563 100%);
}
</style>