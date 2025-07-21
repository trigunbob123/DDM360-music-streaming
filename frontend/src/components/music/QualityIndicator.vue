<template>
  <div class="flex flex-col items-center space-y-1">
    <!-- 音質標籤 -->
    <div 
      class="px-2 py-1 rounded text-xs font-medium"
      :class="qualityClasses"
    >
      {{ qualityLabel }}
    </div>
    
    <!-- 比特率 -->
    <span 
      v-if="bitrate" 
      class="text-xs text-gray-400"
    >
      {{ bitrate }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  track: {
    type: Object,
    required: true
  }
})

const qualityLabel = computed(() => {
  // 基於 Jamendo 的音質標準
  if (props.track.audiodownload?.includes('mp32')) return 'HQ'
  if (props.track.audio?.includes('mp31')) return 'HD'
  return 'SD'
})

const bitrate = computed(() => {
  if (props.track.audiodownload?.includes('mp32')) return '320k'
  if (props.track.audio?.includes('mp31')) return '128k'
  return '96k'
})

const qualityClasses = computed(() => {
  const quality = qualityLabel.value
  if (quality === 'HD') return 'bg-green-500/20 text-green-300'
  if (quality === 'HQ') return 'bg-blue-500/20 text-blue-300'
  return 'bg-gray-500/20 text-gray-300'
})
</script>