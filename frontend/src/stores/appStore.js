
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

// frontend/src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const showModal = ref(false)
  const modalMode = ref('login') // 'login' | 'register'
  
  // Getters
  const isLoggedIn = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.username || '訪客')
  
  // Actions
  const setUser = (userData) => {
    user.value = userData
    // 保存到 localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    console.log('👤 User Store: 用戶登入', userData.username)
  }
  
  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
    closeModal()
    console.log('👤 User Store: 用戶登出')
  }
  
  const showLoginModal = () => {
    showModal.value = true
    modalMode.value = 'login'
  }
  
  const showRegisterModal = () => {
    showModal.value = true
    modalMode.value = 'register'
  }
  
  const closeModal = () => {
    showModal.value = false
  }
  
  const setModalMode = (mode) => {
    modalMode.value = mode
  }
  
  const initializeUser = () => {
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        user.value = JSON.parse(savedUser)
        console.log('👤 User Store: 恢復用戶狀態', user.value.username)
      }
    } catch (error) {
      console.error('👤 User Store: 恢復用戶狀態失敗', error)
      localStorage.removeItem('user')
    }
  }
  
  return {
    // State
    user,
    showModal,
    modalMode,
    
    // Getters
    isLoggedIn,
    userDisplayName,
    
    // Actions
    setUser,
    logout,
    showLoginModal,
    showRegisterModal,
    closeModal,
    setModalMode,
    initializeUser
  }
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['user'] // 只持久化 user 狀態
  }
})

// frontend/src/stores/jamendoStore.js
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