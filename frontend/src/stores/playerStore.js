// frontend/src/stores/playerStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // State - 播放器基本狀態
  const currentTrack = ref({})
  const isPlaying = ref(false)
  const isLoadingTrack = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(50)
  const isShuffled = ref(false)
  const repeatMode = ref('off') // 'off', 'all', 'one'
  
  // State - 播放列表管理
  const currentPlaylist = ref([])
  const currentTrackIndex = ref(0)
  const playHistory = ref([])
  
  // State - 錯誤和載入狀態
  const lastError = ref('')
  const playbackState = ref('idle') // 'idle', 'loading', 'playing', 'paused', 'error'
  
  // Getters
  const hasCurrentTrack = computed(() => !!currentTrack.value.name)
  const progressPercentage = computed(() => {
    if (!duration.value || duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })
  
  const formattedCurrentTime = computed(() => {
    return formatTime(currentTime.value)
  })
  
  const formattedDuration = computed(() => {
    return formatTime(duration.value)
  })
  
  const canPlayPrevious = computed(() => {
    return currentPlaylist.value.length > 0 && currentTrackIndex.value > 0
  })
  
  const canPlayNext = computed(() => {
    return currentPlaylist.value.length > 0 && 
           currentTrackIndex.value < currentPlaylist.value.length - 1
  })
  
  const currentTrackInPlaylist = computed(() => {
    return currentPlaylist.value[currentTrackIndex.value] || null
  })
  
  // Helper Functions
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Actions - 基本播放控制
  const setCurrentTrack = (track) => {
    currentTrack.value = track
    // 重置時間狀態
    currentTime.value = 0
    duration.value = track.duration || 0
    
    // 添加到播放歷史
    if (track.id && !playHistory.value.find(t => t.id === track.id)) {
      playHistory.value.unshift(track)
      // 限制歷史記錄數量
      if (playHistory.value.length > 50) {
        playHistory.value = playHistory.value.slice(0, 50)
      }
    }
    
    console.log('🎵 Player Store: 設置當前歌曲', track.name)
  }
  
  const setPlaying = (status) => {
    isPlaying.value = status
    if (status) {
      playbackState.value = 'playing'
    } else {
      playbackState.value = 'paused'
    }
    console.log('▶️ Player Store: 播放狀態', status ? '播放中' : '已暫停')
  }
  
  const setLoadingTrack = (status) => {
    isLoadingTrack.value = status
    if (status) {
      playbackState.value = 'loading'
    }
    console.log('⏳ Player Store: 載入狀態', status)
  }
  
  const setCurrentTime = (time) => {
    currentTime.value = Math.max(0, time)
  }
  
  const setDuration = (time) => {
    duration.value = Math.max(0, time)
  }
  
  const setVolume = (newVolume) => {
    volume.value = Math.max(0, Math.min(100, newVolume))
    console.log('🔊 Player Store: 音量設為', volume.value + '%')
  }
  
  const setError = (errorMessage) => {
    lastError.value = errorMessage
    if (errorMessage) {
      playbackState.value = 'error'
      console.error('❌ Player Store: 播放錯誤', errorMessage)
    }
  }
  
  const clearError = () => {
    lastError.value = ''
    if (playbackState.value === 'error') {
      playbackState.value = 'idle'
    }
  }
  
  // Actions - 播放模式控制
  const togglePlay = () => {
    setPlaying(!isPlaying.value)
  }
  
  const toggleShuffle = () => {
    isShuffled.value = !isShuffled.value
    console.log('🔀 Player Store: 隨機播放', isShuffled.value ? '開啟' : '關閉')
  }
  
  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one']
    const currentIndex = modes.indexOf(repeatMode.value)
    repeatMode.value = modes[(currentIndex + 1) % modes.length]
    console.log('🔁 Player Store: 重複模式', repeatMode.value)
  }
  
  const setRepeatMode = (mode) => {
    if (['off', 'all', 'one'].includes(mode)) {
      repeatMode.value = mode
      console.log('🔁 Player Store: 重複模式設為', mode)
    }
  }
  
  // Actions - 播放列表管理
  const setPlaylist = (tracks, startIndex = 0) => {
    currentPlaylist.value = [...tracks]
    currentTrackIndex.value = Math.max(0, Math.min(startIndex, tracks.length - 1))
    console.log('📋 Player Store: 設置播放列表', tracks.length, '首歌曲，起始索引', startIndex)
  }
  
  const addToPlaylist = (track) => {
    if (!currentPlaylist.value.find(t => t.id === track.id)) {
      currentPlaylist.value.push(track)
      console.log('➕ Player Store: 添加到播放列表', track.name)
    }
  }
  
  const removeFromPlaylist = (trackId) => {
    const index = currentPlaylist.value.findIndex(t => t.id === trackId)
    if (index !== -1) {
      currentPlaylist.value.splice(index, 1)
      // 調整當前索引
      if (index <= currentTrackIndex.value && currentTrackIndex.value > 0) {
        currentTrackIndex.value--
      }
      console.log('➖ Player Store: 從播放列表移除歌曲')
    }
  }
  
  const clearPlaylist = () => {
    currentPlaylist.value = []
    currentTrackIndex.value = 0
    console.log('🗑️ Player Store: 清空播放列表')
  }
  
  const setTrackIndex = (index) => {
    if (index >= 0 && index < currentPlaylist.value.length) {
      currentTrackIndex.value = index
      console.log('📍 Player Store: 設置歌曲索引', index)
    }
  }
  
  const getNextTrackIndex = () => {
    if (currentPlaylist.value.length === 0) return -1
    
    if (repeatMode.value === 'one') {
      return currentTrackIndex.value
    }
    
    if (isShuffled.value) {
      // 隨機播放：生成隨機索引（排除當前歌曲）
      const availableIndices = currentPlaylist.value
        .map((_, index) => index)
        .filter(index => index !== currentTrackIndex.value)
      
      if (availableIndices.length === 0) return currentTrackIndex.value
      return availableIndices[Math.floor(Math.random() * availableIndices.length)]
    }
    
    // 順序播放
    const nextIndex = currentTrackIndex.value + 1
    
    if (nextIndex >= currentPlaylist.value.length) {
      // 到達播放列表末尾
      if (repeatMode.value === 'all') {
        return 0 // 重複播放列表
      }
      return -1 // 停止播放
    }
    
    return nextIndex
  }
  
  const getPreviousTrackIndex = () => {
    if (currentPlaylist.value.length === 0) return -1
    
    if (repeatMode.value === 'one') {
      return currentTrackIndex.value
    }
    
    // 上一首不使用隨機播放邏輯，總是回到上一首
    const prevIndex = currentTrackIndex.value - 1
    
    if (prevIndex < 0) {
      // 到達播放列表開頭
      if (repeatMode.value === 'all') {
        return currentPlaylist.value.length - 1
      }
      return -1
    }
    
    return prevIndex
  }
  
  // Actions - 播放控制邏輯
  const playNext = () => {
    const nextIndex = getNextTrackIndex()
    if (nextIndex !== -1) {
      setTrackIndex(nextIndex)
      const nextTrack = currentPlaylist.value[nextIndex]
      if (nextTrack) {
        setCurrentTrack(nextTrack)
        return nextTrack
      }
    }
    return null
  }
  
  const playPrevious = () => {
    const prevIndex = getPreviousTrackIndex()
    if (prevIndex !== -1) {
      setTrackIndex(prevIndex)
      const prevTrack = currentPlaylist.value[prevIndex]
      if (prevTrack) {
        setCurrentTrack(prevTrack)
        return prevTrack
      }
    }
    return null
  }
  
  const playTrackAtIndex = (index) => {
    if (index >= 0 && index < currentPlaylist.value.length) {
      setTrackIndex(index)
      const track = currentPlaylist.value[index]
      setCurrentTrack(track)
      return track
    }
    return null
  }
  
  // Actions - 重置和清理
  const reset = () => {
    currentTrack.value = {}
    isPlaying.value = false
    isLoadingTrack.value = false
    currentTime.value = 0
    duration.value = 0
    playbackState.value = 'idle'
    clearError()
    console.log('🔄 Player Store: 播放器已重置')
  }
  
  const resetPlaylist = () => {
    clearPlaylist()
    reset()
    console.log('🔄 Player Store: 播放器和播放列表已重置')
  }
  
  // Actions - 進階功能
  const seekTo = (timeInSeconds) => {
    const targetTime = Math.max(0, Math.min(timeInSeconds, duration.value))
    setCurrentTime(targetTime)
    console.log('🎯 Player Store: 跳轉到', Math.floor(targetTime), '秒')
    return targetTime
  }
  
  const seekByPercentage = (percentage) => {
    const targetTime = (percentage / 100) * duration.value
    return seekTo(targetTime)
  }
  
  const addToHistory = (track) => {
    if (!track.id) return
    
    // 移除重複項目
    playHistory.value = playHistory.value.filter(t => t.id !== track.id)
    // 添加到開頭
    playHistory.value.unshift(track)
    // 限制歷史記錄數量
    if (playHistory.value.length > 50) {
      playHistory.value = playHistory.value.slice(0, 50)
    }
  }
  
  const clearHistory = () => {
    playHistory.value = []
    console.log('🗑️ Player Store: 清空播放歷史')
  }
  
  return {
    // State
    currentTrack,
    isPlaying,
    isLoadingTrack,
    currentTime,
    duration,
    volume,
    isShuffled,
    repeatMode,
    currentPlaylist,
    currentTrackIndex,
    playHistory,
    lastError,
    playbackState,
    
    // Getters
    hasCurrentTrack,
    progressPercentage,
    formattedCurrentTime,
    formattedDuration,
    canPlayPrevious,
    canPlayNext,
    currentTrackInPlaylist,
    
    // Actions - 基本控制
    setCurrentTrack,
    setPlaying,
    setLoadingTrack,
    setCurrentTime,
    setDuration,
    setVolume,
    setError,
    clearError,
    
    // Actions - 播放模式
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    setRepeatMode,
    
    // Actions - 播放列表
    setPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    setTrackIndex,
    playNext,
    playPrevious,
    playTrackAtIndex,
    
    // Actions - 進階功能
    seekTo,
    seekByPercentage,
    addToHistory,
    clearHistory,
    reset,
    resetPlaylist
  }
}, {
  persist: {
    key: 'player-store',
    storage: localStorage,
    paths: ['volume', 'isShuffled', 'repeatMode', 'playHistory'] // 只持久化設定
  }
})