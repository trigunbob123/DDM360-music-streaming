import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useJamendoStore = defineStore('jamendo', () => {
  // State
  const isConnected = ref(false)
  const configured = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const tracks = ref([])
  const currentTrack = ref(null)
  const isPlaying = ref(false)
  
  // Getters
  const canConnect = computed(() => configured.value && !isConnected.value)
  const connectionStatus = computed(() => {
    if (!configured.value) return 'not-configured'
    if (!isConnected.value) return 'disconnected'
    return 'connected'
  })
  
  // Actions
  const setConfigured = (status) => {
    configured.value = status
    console.log('🎵 Jamendo Store: 配置狀態', status)
  }
  
  const setConnected = (status) => {
    isConnected.value = status
    console.log('🎵 Jamendo Store: 連接狀態', status)
  }
  
  const setLoading = (status) => {
    loading.value = status
  }
  
  const setError = (errorMessage) => {
    error.value = errorMessage
    if (errorMessage) {
      console.error('🎵 Jamendo Store: 錯誤', errorMessage)
    }
  }
  
  const setTracks = (trackList) => {
    tracks.value = trackList
    console.log('🎵 Jamendo Store: 載入', trackList.length, '首歌曲')
  }
  
  const setCurrentTrack = (track) => {
    currentTrack.value = track
    console.log('🎵 Jamendo Store: 當前歌曲', track?.name)
  }
  
  const setPlaying = (status) => {
    isPlaying.value = status
    console.log('🎵 Jamendo Store: 播放狀態', status ? '播放中' : '已暫停')
  }
  
  const connect = async () => {
    if (!configured.value) {
      throw new Error('Jamendo 尚未配置')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // 模擬連接邏輯（實際會調用 useJamendo composable）
      await new Promise(resolve => setTimeout(resolve, 1000))
      setConnected(true)
      console.log('🎵 Jamendo Store: 連接成功')
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }
  
  const disconnect = () => {
    setConnected(false)
    setCurrentTrack(null)
    setPlaying(false)
    setTracks([])
    console.log('🎵 Jamendo Store: 已斷開連接')
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    // State
    isConnected,
    configured,
    loading,
    error,
    tracks,
    currentTrack,
    isPlaying,
    
    // Getters
    canConnect,
    connectionStatus,
    
    // Actions
    setConfigured,
    setConnected,
    setLoading,
    setError,
    setTracks,
    setCurrentTrack,
    setPlaying,
    connect,
    disconnect,
    clearError
  }
}, {
  persist: {
    key: 'jamendo-store',
    storage: localStorage,
    paths: ['configured', 'isConnected'] // 只持久化配置和連接狀態
  }
})