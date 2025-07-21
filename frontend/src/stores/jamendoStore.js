import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useJamendoStore = defineStore('jamendo', () => {
  // State
  const isConnected = ref(false)
  const configured = ref(false)
  const loading = ref(false)
  const error = ref(null)
  
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
  
  const connect = async () => {
    if (!configured.value) {
      throw new Error('Jamendo 尚未配置')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // 實際連接邏輯由 useJamendo composable 處理
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
    
    // Getters
    canConnect,
    connectionStatus,
    
    // Actions
    setConfigured,
    setConnected,
    setLoading,
    setError,
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