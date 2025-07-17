<!-- 主容器，協調所有子組件 -->
<template>
  <div class="bg-gray-800 text-white shadow-lg border-b border-gray-700">
    <div class="flex items-center justify-between px-6 py-4">
      <!-- 左側：當前歌曲信息 -->
      <div class="flex items-center min-w-0 flex-1 max-w-sm">
        <CurrentTrackInfo 
          :current-track="currentTrack"
          :is-loading="isLoadingTrack"
        />
      </div>

      <!-- 中間：播放控制區域 -->
      <div class="flex flex-col items-center space-y-2 flex-1 max-w-2xl">
        <!-- 播放控制按鈕 -->
        <div class="flex items-center space-x-4">
          <!-- 隨機播放 -->
          <PlayModeButton
            :is-active="isShuffled"
            icon="random"
            tooltip="隨機播放"
            @click="$emit('toggle-shuffle')"
          />

          <!-- 上一首 -->
          <PlaybackButton
            icon="step-backward"
            size="medium"
            :disabled="!currentTrack.name || isLoadingTrack"
            @click="$emit('previous-track')"
          />

          <!-- 播放/暫停主按鈕 -->
          <PlaybackButton
            :icon="playButtonIcon"
            size="large"
            :is-loading="isLoadingTrack"
            :disabled="!currentTrack.name"
            variant="primary"
            @click="$emit('toggle-play')"
          />

          <!-- 下一首 -->
          <PlaybackButton
            icon="step-forward"
            size="medium"
            :disabled="!currentTrack.name || isLoadingTrack"
            @click="$emit('next-track')"
          />

          <!-- 重複模式 -->
          <PlayModeButton
            :is-active="repeatMode !== 'off'"
            :icon="repeatModeIcon"
            :tooltip="repeatModeTooltip"
            @click="$emit('toggle-repeat')"
          />
        </div>

        <!-- 進度條區域 -->
        <div class="w-full max-w-md">
          <ProgressBar 
            :current-time="currentTime"
            :duration="duration"
            :progress-percentage="progressPercentage"
            :disabled="!currentTrack.name"
            @seek="$emit('seek', $event)"
          />
        </div>
      </div>

      <!-- 右側：音量控制和額外功能 -->
      <div class="flex items-center space-x-4 min-w-0 flex-1 max-w-sm justify-end">
        <!-- 音頻可視化 -->
        <AudioVisualizer 
          v-if="currentTrack.name"
          :is-playing="isPlaying"
          :is-loading="isLoadingTrack"
          class="hidden md:block"
        />

        <!-- 音量控制 -->
        <VolumeControl 
          :volume="volume"
          @volume-change="$emit('volume-change', $event)"
        />

        <!-- 更多選項 -->
        <MoreOptionsMenu 
          :current-track="currentTrack"
          @add-to-favorites="$emit('add-to-favorites')"
          @add-to-playlist="$emit('add-to-playlist')"
        />
      </div>
    </div>

    <!-- 載入進度條（歌曲切換時顯示） -->
    <div 
      v-if="isLoadingTrack" 
      class="absolute bottom-0 left-0 right-0 h-1 bg-gray-700"
    >
      <div class="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 animate-pulse"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CurrentTrackInfo from './CurrentTrackInfo.vue'
import PlaybackButton from './PlaybackButton.vue'
import PlayModeButton from './PlayModeButton.vue'
import ProgressBar from './ProgressBar.vue'
import AudioVisualizer from './AudioVisualizer.vue'
import VolumeControl from './VolumeControl.vue'
import MoreOptionsMenu from './MoreOptionsMenu.vue'

// Props
const props = defineProps({
  currentTrack: {
    type: Object,
    required: true,
    default: () => ({})
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  isLoadingTrack: {
    type: Boolean,
    default: false
  },
  currentTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 50
  },
  isShuffled: {
    type: Boolean,
    default: false
  },
  repeatMode: {
    type: String,
    default: 'off',
    validator: (value) => ['off', 'all', 'one'].includes(value)
  }
})

// Emits
defineEmits([
  'toggle-play',
  'previous-track', 
  'next-track',
  'seek',
  'volume-change',
  'toggle-shuffle',
  'toggle-repeat',
  'add-to-favorites',
  'add-to-playlist'
])

// 計算屬性
const playButtonIcon = computed(() => {
  if (props.isLoadingTrack) return 'spinner'
  return props.isPlaying ? 'pause' : 'play'
})

const repeatModeIcon = computed(() => {
  return props.repeatMode === 'one' ? 'redo' : 'repeat'
})

const repeatModeTooltip = computed(() => {
  const tooltips = {
    'off': '重複播放：關閉',
    'all': '重複播放：列表',
    'one': '重複播放：單曲'
  }
  return tooltips[props.repeatMode]
})

const progressPercentage = computed(() => {
  if (!props.duration || props.duration === 0) return 0
  return (props.currentTime / props.duration) * 100
})
</script>

<style scoped>
/* 響應式設計 */
@media (max-width: 1024px) {
  .max-w-sm {
    @apply max-w-xs;
  }
  
  .space-x-4 {
    @apply space-x-2;
  }
}

@media (max-width: 768px) {
  .flex-1 {
    @apply flex-none;
  }
  
  .max-w-2xl {
    @apply max-w-sm;
  }
  
  .px-6 {
    @apply px-4;
  }
}
</style>