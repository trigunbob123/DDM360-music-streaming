<!-- frontend/src/components/ui/SearchBar.vue -->
<template>
  <div class="search-container relative w-full max-w-2xl mx-auto">
    <!-- 搜尋輸入框 -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <font-awesome-icon 
          icon="search" 
          class="h-5 w-5 text-gray-400"
        />
      </div>
      
      <input
        ref="searchInput"
        v-model="localSearchQuery"
        type="text"
        placeholder="🎵 搜尋歌曲、藝人或專輯..."
        class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
        :class="{ 'border-orange-300 bg-orange-50': isSearching }"
        @input="handleInput"
        @keydown.enter="handleEnterSearch"
        @keydown.escape="handleEscape"
        @focus="isFocused = true"
        @blur="handleBlur"
      />
      
      <!-- 清除按鈕 -->
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button
          v-if="localSearchQuery"
          @click="clearSearch"
          class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          title="清除搜尋"
        >
          <font-awesome-icon icon="times" class="h-4 w-4" />
        </button>
        
        <div
          v-else-if="isSearching"
          class="text-orange-500"
        >
          <font-awesome-icon icon="spinner" class="h-4 w-4 animate-spin" />
        </div>
      </div>
    </div>
    
    <!-- 搜尋建議下拉選單 -->
    <div
      v-if="showSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0)"
      class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      <!-- 最近搜尋 -->
      <div v-if="!localSearchQuery && recentSearches.length > 0" class="p-2">
        <div class="text-xs text-gray-500 px-3 py-2 font-medium">最近搜尋</div>
        <button
          v-for="(search, index) in recentSearches.slice(0, 5)"
          :key="`recent-${index}`"
          @click="selectSuggestion(search, 'recent')"
          class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
        >
          <font-awesome-icon icon="history" class="h-3 w-3 text-gray-400 mr-2" />
          {{ search }}
          <button
            @click.stop="removeRecentSearch(index)"
            class="ml-auto text-gray-400 hover:text-gray-600 p-1"
            title="移除"
          >
            <font-awesome-icon icon="times" class="h-3 w-3" />
          </button>
        </button>
        
        <div v-if="searchSuggestions.length > 0" class="border-t border-gray-100 my-2"></div>
      </div>
      
      <!-- 搜尋建議 -->
      <div v-if="searchSuggestions.length > 0" class="p-2">
        <div v-if="localSearchQuery" class="text-xs text-gray-500 px-3 py-2 font-medium">搜尋建議</div>
        <button
          v-for="(suggestion, index) in searchSuggestions.slice(0, 8)"
          :key="`suggestion-${index}`"
          @click="selectSuggestion(suggestion.text, suggestion.type)"
          class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
          :class="{ 'bg-orange-50': index === selectedSuggestionIndex }"
        >
          <font-awesome-icon 
            :icon="getSuggestionIcon(suggestion.type)" 
            class="h-3 w-3 text-gray-400 mr-2" 
          />
          <span>{{ suggestion.text }}</span>
          <span v-if="suggestion.type !== 'query'" class="ml-auto text-xs text-gray-400">
            {{ getSuggestionTypeText(suggestion.type) }}
          </span>
        </button>
      </div>
      
      <!-- 沒有結果 -->
      <div v-if="localSearchQuery && searchSuggestions.length === 0 && !isSearching" class="p-4 text-center text-gray-500 text-sm">
        <font-awesome-icon icon="search" class="h-8 w-8 text-gray-300 mb-2" />
        <p>沒有找到相關的搜尋建議</p>
        <p class="text-xs mt-1">嘗試使用不同的關鍵字</p>
      </div>
    </div>
    
    <!-- 搜尋快捷鍵提示 -->
    <div v-if="showKeyboardHint" class="absolute top-full left-0 right-0 mt-2 text-xs text-gray-500 text-center">
      按 <kbd class="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> 搜尋 · 
      <kbd class="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Esc</kbd> 取消
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// Props
const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  isSearching: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '🎵 搜尋歌曲、藝人或專輯...'
  },
  suggestions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'update:searchQuery',
  'search',
  'clear',
  'focus',
  'blur'
])

// 響應式數據
const searchInput = ref(null)
const localSearchQuery = ref(props.searchQuery)
const isFocused = ref(false)
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)
const recentSearches = ref([])
const searchTimeout = ref(null)

// 搜尋建議（模擬數據，實際應該從後端獲取）
const searchSuggestions = computed(() => {
  if (!localSearchQuery.value || localSearchQuery.value.length < 2) {
    return []
  }
  
  // 模擬搜尋建議
  const suggestions = [
    { text: localSearchQuery.value, type: 'query' },
    { text: `${localSearchQuery.value} - 歌曲`, type: 'track' },
    { text: `${localSearchQuery.value} - 藝人`, type: 'artist' },
    { text: `${localSearchQuery.value} - 專輯`, type: 'album' }
  ]
  
  // 添加一些常見建議
  const commonSuggestions = [
    { text: '流行音樂', type: 'genre' },
    { text: '搖滾音樂', type: 'genre' },
    { text: '電子音樂', type: 'genre' },
    { text: '爵士樂', type: 'genre' }
  ].filter(s => s.text.toLowerCase().includes(localSearchQuery.value.toLowerCase()))
  
  return [...suggestions, ...commonSuggestions]
})

const showKeyboardHint = computed(() => {
  return isFocused.value && !showSuggestions.value && !localSearchQuery.value
})

// 載入最近搜尋記錄
const loadRecentSearches = () => {
  try {
    const saved = localStorage.getItem('recentSearches')
    recentSearches.value = saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('載入搜尋記錄失敗:', error)
    recentSearches.value = []
  }
}

// 儲存最近搜尋記錄
const saveRecentSearches = () => {
  try {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
  } catch (error) {
    console.error('儲存搜尋記錄失敗:', error)
  }
}

// 添加到最近搜尋
const addToRecentSearches = (query) => {
  if (!query || query.length < 2) return
  
  // 移除重複項目
  recentSearches.value = recentSearches.value.filter(search => search !== query)
  
  // 添加到開頭
  recentSearches.value.unshift(query)
  
  // 限制數量
  if (recentSearches.value.length > 10) {
    recentSearches.value = recentSearches.value.slice(0, 10)
  }
  
  saveRecentSearches()
}

// 移除最近搜尋項目
const removeRecentSearch = (index) => {
  recentSearches.value.splice(index, 1)
  saveRecentSearches()
}

// 處理輸入
const handleInput = (event) => {
  const value = event.target.value
  localSearchQuery.value = value
  emit('update:searchQuery', value)
  
  // 防抖搜尋
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  if (value.trim()) {
    showSuggestions.value = true
    searchTimeout.value = setTimeout(() => {
      emit('search', value)
    }, 300)
  } else {
    showSuggestions.value = false
  }
  
  selectedSuggestionIndex.value = -1
}

// 處理 Enter 鍵搜尋
const handleEnterSearch = () => {
  if (selectedSuggestionIndex.value >= 0) {
    const suggestion = searchSuggestions.value[selectedSuggestionIndex.value]
    selectSuggestion(suggestion.text, suggestion.type)
  } else if (localSearchQuery.value.trim()) {
    performSearch(localSearchQuery.value)
  }
}

// 處理 Esc 鍵
const handleEscape = () => {
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
  searchInput.value?.blur()
}

// 處理失焦
const handleBlur = () => {
  setTimeout(() => {
    isFocused.value = false
    showSuggestions.value = false
    emit('blur')
  }, 200) // 延遲以允許點擊建議
}

// 選擇建議
const selectSuggestion = (text, type) => {
  localSearchQuery.value = text
  emit('update:searchQuery', text)
  performSearch(text)
  showSuggestions.value = false
}

// 執行搜尋
const performSearch = (query) => {
  if (!query.trim()) return
  
  addToRecentSearches(query.trim())
  emit('search', query.trim())
  showSuggestions.value = false
  searchInput.value?.blur()
}

// 清除搜尋
const clearSearch = () => {
  localSearchQuery.value = ''
  emit('update:searchQuery', '')
  emit('clear')
  showSuggestions.value = false
  nextTick(() => {
    searchInput.value?.focus()
  })
}

// 獲取建議圖標
const getSuggestionIcon = (type) => {
  const icons = {
    query: 'search',
    track: 'music',
    artist: 'user',
    album: 'compact-disc',
    genre: 'tags',
    recent: 'history'
  }
  return icons[type] || 'search'
}

// 獲取建議類型文字
const getSuggestionTypeText = (type) => {
  const texts = {
    track: '歌曲',
    artist: '藝人',
    album: '專輯',
    genre: '曲風'
  }
  return texts[type] || ''
}

// 鍵盤導航
const handleKeyDown = (event) => {
  if (!showSuggestions.value || searchSuggestions.value.length === 0) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        searchSuggestions.value.length - 1
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.max(
        selectedSuggestionIndex.value - 1,
        -1
      )
      break
  }
}

// 監聽 props 變化
watch(() => props.searchQuery, (newValue) => {
  localSearchQuery.value = newValue
})

// 全域點擊事件
const handleGlobalClick = (event) => {
  if (!event.target.closest('.search-container')) {
    showSuggestions.value = false
  }
}

// 生命週期
onMounted(() => {
  loadRecentSearches()
  document.addEventListener('click', handleGlobalClick)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
  document.removeEventListener('keydown', handleKeyDown)
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

// 對外暴露方法
defineExpose({
  focus: () => searchInput.value?.focus(),
  blur: () => searchInput.value?.blur(),
  clear: clearSearch
})
</script>

<style scoped>
/* 自定義樣式 */
kbd {
  font-family: inherit;
  font-size: inherit;
}

/* 搜尋框動畫 */
.search-container input {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-container input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
}

/* 建議列表動畫 */
.search-container > div:last-child {
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式設計 */
@media (max-width: 640px) {
  .search-container {
    max-width: 100%;
  }
  
  .search-container input {
    font-size: 16px; /* 防止 iOS 縮放 */
  }
}
</style>