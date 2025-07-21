<!-- frontend/src/components/auth/AuthModal.vue -->
<template>
  <!-- 模態背景遮罩 -->
  <div 
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="handleBackdropClick"
  >
    <!-- 模態容器 -->
    <div 
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300"
      :class="modalClasses"
    >
      <!-- 關閉按鈕 -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        aria-label="關閉"
      >
        <font-awesome-icon icon="times" class="h-4 w-4" />
      </button>

      <!-- 模態內容 -->
      <div class="p-8">
        <!-- 標題區域 -->
        <div class="text-center mb-8">
          <div class="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
            <font-awesome-icon 
              :icon="mode === 'login' ? 'sign-in-alt' : 'user-plus'" 
              class="h-6 w-6 text-white" 
            />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            {{ mode === 'login' ? '歡迎回來' : '加入我們' }}
          </h2>
          <p class="text-gray-600">
            {{ mode === 'login' ? '登入您的帳戶' : '創建新帳戶' }}
          </p>
        </div>

        <!-- 登入表單 -->
        <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="space-y-6">
          <!-- 帳號輸入 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              帳號
            </label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              placeholder="請輸入帳號"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white transition-colors duration-200"
              :class="{ 'border-red-300': errors.username }"
              required
              autocomplete="username"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>

          <!-- 密碼輸入 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密碼
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="請輸入密碼"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white transition-colors duration-200"
                :class="{ 'border-red-300': errors.password }"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <font-awesome-icon 
                  :icon="showPassword ? 'eye-slash' : 'eye'" 
                  class="h-4 w-4" 
                />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- 記住我 -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="loginForm.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-600">記住我</span>
            </label>
            <button
              type="button"
              class="text-sm text-orange-600 hover:text-orange-500 transition-colors duration-200"
              @click="handleForgotPassword"
            >
              忘記密碼？
            </button>
          </div>

          <!-- 錯誤訊息 -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <font-awesome-icon icon="exclamation-triangle" class="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div class="text-sm text-red-800">{{ error }}</div>
            </div>
          </div>

          <!-- 登入按鈕 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <font-awesome-icon v-if="isLoading" icon="spinner" class="animate-spin mr-2" />
            {{ isLoading ? '登入中...' : '登入' }}
          </button>
        </form>

        <!-- 註冊表單 -->
        <form v-else @submit.prevent="handleRegister" class="space-y-6">
          <!-- 用戶名輸入 -->
          <div>
            <label for="register-username" class="block text-sm font-medium text-gray-700 mb-2">
              用戶名
            </label>
            <input
              id="register-username"
              v-model="registerForm.username"
              type="text"
              placeholder="請輸入用戶名"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white transition-colors duration-200"
              :class="{ 'border-red-300': errors.username }"
              required
              autocomplete="username"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>

          <!-- 電子郵件輸入 -->
          <div>
            <label for="register-email" class="block text-sm font-medium text-gray-700 mb-2">
              電子郵件
            </label>
            <input
              id="register-email"
              v-model="registerForm.email"
              type="email"
              placeholder="請輸入電子郵件"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white transition-colors duration-200"
              :class="{ 'border-red-300': errors.email }"
              required
              autocomplete="email"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- 密碼輸入 -->
          <div>
            <label for="register-password" class="block text-sm font-medium text-gray-700 mb-2">
              密碼
            </label>
            <div class="relative">
              <input
                id="register-password"
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="請輸入密碼"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white transition-colors duration-200"
                :class="{ 'border-red-300': errors.password }"
                required
                autocomplete="new-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <font-awesome-icon 
                  :icon="showPassword ? 'eye-slash' : 'eye'" 
                  class="h-4 w-4" 
                />
              </button>
            </div>
            <!-- 密碼強度指示器 -->
            <div class="mt-2">
              <div class="flex space-x-1">
                <div 
                  v-for="i in 4" 
                  :key="i"
                  class="h-1 flex-1 rounded-full transition-colors duration-200"
                  :class="getPasswordStrengthColor(i)"
                />
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ passwordStrengthText }}</p>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- 確認密碼 -->
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
              確認密碼
            </label>
            <input
              id="confirm-password"
              v-model="registerForm.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="請再次輸入密碼"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white transition-colors duration-200"
              :class="{ 'border-red-300': errors.confirmPassword }"
              required
              autocomplete="new-password"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <!-- 同意條款 -->
          <div class="flex items-start">
            <input
              id="agree-terms"
              v-model="registerForm.agreeTerms"
              type="checkbox"
              class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
              required
            />
            <label for="agree-terms" class="ml-3 text-sm text-gray-600">
              我同意
              <button type="button" class="text-orange-600 hover:text-orange-500 underline">服務條款</button>
              和
              <button type="button" class="text-orange-600 hover:text-orange-500 underline">隱私政策</button>
            </label>
          </div>

          <!-- 錯誤訊息 -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <font-awesome-icon icon="exclamation-triangle" class="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div class="text-sm text-red-800">{{ error }}</div>
            </div>
          </div>

          <!-- 成功訊息 -->
          <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex">
              <font-awesome-icon icon="check-circle" class="h-5 w-5 text-green-400 mr-3 mt-0.5" />
              <div class="text-sm text-green-800">{{ success }}</div>
            </div>
          </div>

          <!-- 註冊按鈕 -->
          <button
            type="submit"
            :disabled="isLoading || !registerForm.agreeTerms"
            class="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <font-awesome-icon v-if="isLoading" icon="spinner" class="animate-spin mr-2" />
            {{ isLoading ? '註冊中...' : '創建帳戶' }}
          </button>
        </form>

        <!-- 分隔線 -->
        <div class="my-8">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500">或</span>
            </div>
          </div>
        </div>

        <!-- Google 登入按鈕 -->
        <button
          @click="handleGoogleLogin"
          :disabled="isLoading"
          class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium mb-6 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          使用 Google {{ mode === 'login' ? '登入' : '註冊' }}
        </button>

        <!-- 切換模式 -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            {{ mode === 'login' ? '還沒有帳戶？' : '已經有帳戶了？' }}
            <button
              type="button"
              @click="switchMode"
              class="text-orange-600 hover:text-orange-500 font-medium transition-colors duration-200 ml-1"
            >
              {{ mode === 'login' ? '立即註冊' : '立即登入' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
})

// Emits
const emit = defineEmits([
  'close',
  'login-success',
  'register-success',
  'switch-mode'
])

// 響應式數據
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const errors = ref({})

// 登入表單
const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false
})

// 註冊表單
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 計算屬性
const modalClasses = computed(() => {
  return props.show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
})

const passwordStrength = computed(() => {
  const password = registerForm.value.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return Math.min(strength, 4)
})

const passwordStrengthText = computed(() => {
  const texts = ['很弱', '弱', '一般', '強', '很強']
  return texts[passwordStrength.value] || ''
})

// Google 客戶端 ID
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// 方法
const getPasswordStrengthColor = (index) => {
  if (index <= passwordStrength.value) {
    if (passwordStrength.value <= 1) return 'bg-red-500'
    if (passwordStrength.value <= 2) return 'bg-yellow-500'
    if (passwordStrength.value <= 3) return 'bg-blue-500'
    return 'bg-green-500'
  }
  return 'bg-gray-200'
}

const validateForm = (form, isRegister = false) => {
  const newErrors = {}
  
  // 用戶名驗證
  if (!form.username.trim()) {
    newErrors.username = '請輸入用戶名'
  } else if (form.username.length < 3) {
    newErrors.username = '用戶名至少需要 3 個字符'
  }
  
  // 電子郵件驗證（僅註冊時）
  if (isRegister) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim()) {
      newErrors.email = '請輸入電子郵件'
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = '請輸入有效的電子郵件地址'
    }
  }
  
  // 密碼驗證
  if (!form.password) {
    newErrors.password = '請輸入密碼'
  } else if (form.password.length < 6) {
    newErrors.password = '密碼至少需要 6 個字符'
  }
  
  // 確認密碼驗證（僅註冊時）
  if (isRegister) {
    if (!form.confirmPassword) {
      newErrors.confirmPassword = '請確認密碼'
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = '密碼不一致'
    }
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleLogin = async () => {
  error.value = ''
  
  if (!validateForm(loginForm.value)) {
    return
  }
  
  isLoading.value = true
  
  try {
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 檢查預設測試帳戶或從 localStorage 獲取已註冊用戶
    const { username, password } = loginForm.value
    
    if (username === 'demo' && password === 'password') {
      // 測試帳戶
      const userData = {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        loginType: 'normal'
      }
      handleLoginSuccess(userData)
    } else {
      // 檢查已註冊用戶
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const user = registeredUsers.find(u => u.username === username && u.password === password)
      
      if (user) {
        const userData = {
          id: user.id || Date.now(),
          username: user.username,
          email: user.email,
          loginType: 'normal'
        }
        handleLoginSuccess(userData)
      } else {
        error.value = '用戶名或密碼錯誤'
      }
    }
  } catch (err) {
    error.value = '登入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  error.value = ''
  success.value = ''
  
  if (!validateForm(registerForm.value, true)) {
    return
  }
  
  isLoading.value = true
  
  try {
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const { username, email, password } = registerForm.value
    
    // 檢查用戶是否已存在
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    
    if (registeredUsers.find(u => u.username === username)) {
      error.value = '用戶名已存在'
      return
    }
    
    if (registeredUsers.find(u => u.email === email)) {
      error.value = '電子郵件已被註冊'
      return
    }
    
    // 保存新用戶
    const newUser = {
      id: Date.now(),
      username,
      email,
      password,
      registerDate: new Date().toISOString()
    }
    
    registeredUsers.push(newUser)
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
    
    success.value = '註冊成功！3 秒後自動跳轉到登入頁面'
    
    emit('register-success', {
      username,
      email
    })
    
    // 3 秒後切換到登入模式
    setTimeout(() => {
      switchMode()
      resetForms()
    }, 3000)
    
  } catch (err) {
    error.value = '註冊失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  if (!googleClientId) {
    error.value = 'Google 登入未配置'
    return
  }
  
  try {
    // 初始化 Google Identity Services
    if (!window.google) {
      await loadGoogleScript()
    }
    
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    })
    
    // 顯示一次性登入彈窗
    window.google.accounts.id.prompt()
    
  } catch (err) {
    console.error('Google 登入錯誤:', err)
    error.value = 'Google 登入失敗'
  }
}

const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const handleGoogleResponse = (response) => {
  try {
    const responsePayload = parseJwt(response.credential)
    
    const userData = {
      id: responsePayload.sub,
      username: responsePayload.name,
      email: responsePayload.email,
      picture: responsePayload.picture,
      loginType: 'google',
      googleId: responsePayload.sub
    }
    
    handleLoginSuccess(userData)
    
  } catch (err) {
    console.error('Google 登入處理失敗:', err)
    error.value = 'Google 登入處理失敗'
  }
}

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    throw new Error('JWT 解析失敗')
  }
}

const handleLoginSuccess = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData))
  emit('login-success', userData)
  resetForms()
}

const handleForgotPassword = () => {
  // TODO: 實現忘記密碼功能
  alert('忘記密碼功能尚未實現')
}

const handleBackdropClick = () => {
  if (!isLoading.value) {
    emit('close')
  }
}

const switchMode = () => {
  emit('switch-mode', props.mode === 'login' ? 'register' : 'login')
  resetForms()
}

const resetForms = () => {
  loginForm.value = {
    username: '',
    password: '',
    rememberMe: false
  }
  
  registerForm.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  }
  
  error.value = ''
  success.value = ''
  errors.value = {}
  showPassword.value = false
}

// 鍵盤事件處理
const handleKeyDown = (event) => {
  if (event.key === 'Escape' && !isLoading.value) {
    emit('close')
  }
}

// 監聽屬性變化
watch(() => props.show, (newValue) => {
  if (newValue) {
    resetForms()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

watch(() => props.mode, () => {
  resetForms()
})

// 生命週期
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* 自定義樣式 */
input:focus {
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

/* 模態動畫 */
.fixed {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 響應式設計 */
@media (max-width: 640px) {
  .max-w-md {
    max-width: 100%;
    margin: 1rem;
  }
  
  .p-8 {
    padding: 1.5rem;
  }
}
</style>