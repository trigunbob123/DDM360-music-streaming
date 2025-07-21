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