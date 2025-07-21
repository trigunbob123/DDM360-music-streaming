<template>
  <div class="w-full space-y-2">
    <!-- 進度條 -->
    <div class="relative group">
      <div
        ref="progressContainer"
        class="progress-track"
        :class="{ 'cursor-not-allowed': disabled }"
        @click="handleSeek"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
        @mousemove="updateTooltipPosition"
      >
        <!-- 緩衝進度 -->
        <div
          v-if="bufferedPercentage > 0"
          class="progress-buffer"
          :style="{ width: bufferedPercentage + '%' }"
        />

        <!-- 播放進度 -->
        <div
          class="progress-fill"
          :class="trackFillClass"
          :style="{ width: progressPercentage + '%' }"
        />

        <!-- 播放點 -->
        <div
          v-if="!disabled"
          class="progress-dot group-hover:opacity-100"
          :style="{ left: progressPercentage + '%', marginLeft: '-6px' }"
        />
      </div>

      <!-- 懸停提示 -->
      <div
        v-if="showTooltip && !disabled && duration > 0"
        class="tooltip"
        :style="{ left: tooltipPosition + '%' }"
      >
        {{ formatTime(hoveredTime) }}
        <div class="tooltip-arrow"></div>
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

const props = defineProps({
  currentTime: Number,
  duration: Number,
  progressPercentage: Number,
  bufferedPercentage: Number,
  disabled: Boolean
})

const emit = defineEmits(['seek'])

const progressContainer = ref(null)
const showTooltip = ref(false)
const tooltipPosition = ref(0)
const hoveredTime = ref(0)

const trackFillClass = computed(() => {
  return props.disabled
    ? 'bg-gray-400'
    : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 shadow-lg'
})

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
</script>

<style scoped>
/* 數字等寬 */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* 進度條軌道 */
.progress-track {
  @apply w-full h-1 bg-gray-600 rounded-full relative overflow-hidden cursor-pointer;
}

/* 緩衝區 */
.progress-buffer {
  @apply absolute top-0 left-0 h-full bg-gray-500/50 rounded-full transition-all duration-150;
}

/* 播放進度條 */
.progress-fill {
  @apply absolute top-0 left-0 h-full rounded-full transition-all duration-150;
}

/* 播放小圓點 */
.progress-dot {
  width: 12px;
  height: 12px;
  @apply absolute top-1/2 bg-white rounded-full shadow-lg opacity-0 transition-opacity duration-200 transform -translate-y-1/2;
}

/* 懸停提示 */
.tooltip {
  @apply absolute bottom-full mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded pointer-events-none transform -translate-x-1/2 transition-all duration-150;
}

/* 小箭頭 */
.tooltip-arrow {
  @apply absolute top-full left-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
  transform: translateX(-50%);
}

/* 禁用狀態 */
.cursor-not-allowed {
  cursor: not-allowed !important;
}

.cursor-not-allowed * {
  cursor: not-allowed !important;
}
</style>