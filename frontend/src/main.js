import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import './index.css'

// FontAwesome 圖標配置
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Solid 圖標
import { 
  faPlay, 
  faPause, 
  faVolumeUp, 
  faVolumeMute,
  faVolumeDown,
  faRandom, 
  faMusic, 
  faStar, 
  faVideo, 
  faHeartBroken,
  faHeart as faHeartSolid,
  faList, 
  faSearch, 
  faUser, 
  faHome, 
  faChevronDown, 
  faLink,
  faExclamationTriangle,
  faStepBackward,
  faStepForward,
  faRepeat,
  faRedo,
  faFire,
  faSpinner,
  faSignInAlt,
  faSignOutAlt,
  faUserPlus,
  faTimes,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faHistory,
  faTags,
  faCompactDisc,
  faShare,
  faDownload,
  faPlus,
  faEllipsisH,
  faThLarge,
  faLock
} from '@fortawesome/free-solid-svg-icons'

// Regular 圖標
import { 
  faHeart as faHeartRegular
} from '@fortawesome/free-regular-svg-icons'

// Brand 圖標
import { 
  faFacebook, 
  faTwitter,
  faSpotify,
  faGoogle
} from '@fortawesome/free-brands-svg-icons'

// 註冊所有圖標
library.add(
  // Solid 圖標
  faPlay, 
  faPause, 
  faVolumeUp, 
  faVolumeMute,
  faVolumeDown,
  faRandom, 
  faMusic, 
  faHeartBroken,
  faStar, 
  faVideo, 
  faHeartSolid,
  faList, 
  faSearch, 
  faUser, 
  faHome, 
  faChevronDown, 
  faLink,
  faExclamationTriangle,
  faStepBackward,
  faStepForward,
  faRepeat,
  faRedo,
  faFire,
  faSpinner,
  faSignInAlt,
  faSignOutAlt,
  faUserPlus,
  faTimes,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faHistory,
  faTags,
  faCompactDisc,
  faShare,
  faDownload,
  faPlus,
  faEllipsisH,
  faThLarge,
  faLock,
  
  // Regular 圖標
  faHeartRegular,
  
  // Brand 圖標
  faFacebook, 
  faTwitter,
  faSpotify,
  faGoogle
)

// 創建 Pinia 實例
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 創建應用
const app = createApp(App)

// 使用 Pinia
app.use(pinia)

// 註冊 FontAwesome 組件
app.component('font-awesome-icon', FontAwesomeIcon)

// 掛載應用
app.mount('#app')

console.log('🚀 DDM360 Vue 應用已啟動')

// 添加 Google 登入安全策略
const meta = document.createElement('meta')
meta.httpEquiv = 'Content-Security-Policy'
meta.content = "script-src 'self' 'unsafe-inline' https://accounts.google.com"
document.head.appendChild(meta)