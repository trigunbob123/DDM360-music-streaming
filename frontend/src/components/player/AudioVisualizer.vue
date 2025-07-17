<!-- 音頻可視化效果 -->
<template>
  <div 
    v-show="!isLoading" 
    class="audio-visualizer flex items-center justify-center w-16 h-8 bg-white/10 rounded-lg backdrop-blur-sm"
  >
    <div class="flex items-end justify-center space-x-1 h-6">
      <div 
        v-for="i in 8" 
        :key="i" 
        class="equalizer-bar bg-orange-400 rounded-sm transition-all duration-75"
        :class="{ 'animate-pulse': !isPlaying }"
        :style="getBarStyle(i-1)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  isPlaying: {
    type: Boolean,
    required: true
  },
  isLoading: {
    type: Boolean,
    required: true
  }
})

const barHeights = ref(Array(8).fill(0.2))
let animationInterval = null

const getBarStyle = (index) => {
  const height = barHeights.value[index] * 100
  return {
    width: '3px',
    height: `${Math.max(8, height)}%`,
    backgroundColor: props.isPlaying ? '#f97316' : '#6b7280'
  }
}

const updateBars = () => {
  if (props.isPlaying) {
    barHeights.value = barHeights.value.map(() => 
      0.2 + Math.random() * 0.8
    )
  } else {
    barHeights.value = barHeights.value.map(current => 
      current * 0.9 + 0.1
    )
  }
}

watch(() => props.isPlaying, (playing) => {
  if (playing) {
    animationInterval = setInterval(updateBars, 150)
  } else {
    if (animationInterval) {
      clearInterval(animationInterval)
      animationInterval = null
    }
  }
})

onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval)
  }
})
</script>