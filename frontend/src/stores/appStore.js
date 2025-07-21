import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const currentMode = ref('popular')
  const loading = ref(false)
  const error = ref(null)
  
  // Actions
  const setCurrentMode = (mode) => {
    currentMode.value = mode
    console.log('📱 App Store: 模式切換至', mode)
  }
  
  const setLoading = (status) => {
    loading.value = status
  }
  
  const setError = (errorMessage) => {
    error.value = errorMessage
    if (errorMessage) {
      console.error('📱 App Store: 錯誤', errorMessage)
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    // State
    currentMode,
    loading,
    error,
    
    // Actions
    setCurrentMode,
    setLoading,
    setError,
    clearError
  }
}, {
  persist: true // 持久化狀態
})