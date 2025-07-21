<template>
  <div class="genre-buttons-container">
    <!-- 第一排曲風按鈕 -->
    <div class="grid grid-cols-5 gap-4 mb-4">
      <button 
        v-for="tag in jamendoTags.slice(0, 5)" 
        :key="tag" 
        @click="$emit('search-by-tag', tag)"
        class="genre-btn-new py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        :class="getGenreButtonClass(tag)"
      >
        {{ getGenreDisplayName(tag) }}
      </button>
    </div>
    
    <!-- 第二排曲風按鈕 -->
    <div class="grid grid-cols-5 gap-4 mb-8">
      <button 
        v-for="tag in jamendoTags.slice(5, 10)" 
        :key="tag" 
        @click="$emit('search-by-tag', tag)"
        class="genre-btn-new py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        :class="getGenreButtonClass(tag)"
      >
        {{ getGenreDisplayName(tag) }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  jamendoTags: {
    type: Array,
    required: true,
    default: () => ['pop', 'rock', 'electronic', 'jazz', 'classical', 'hiphop', 'metal', 'world', 'soundtrack', 'lounge']
  },
  selectedTag: {
    type: String,
    required: true
  }
})

defineEmits(['search-by-tag'])

// 曲風名稱中英對照
const genreNameMap = {
  'pop': '🔸POP',
  'rock': '🔸ROCK', 
  'electronic': '🔸ELECTRONIC',
  'jazz': '🔸JAZZ',
  'classical': '🔸CLASSICAL',
  'hiphop': '🔸HIP HOP',
  'metal': '🔸METAL',
  'world': '🔸WORLD',
  'soundtrack': '🔸SOUNDTRACK',
  'lounge': '🔸LOUNGE'
}

// 曲風按鈕樣式控制
const getGenreButtonClass = (tag) => {
  if (props.selectedTag === tag) {
    return 'bg-pink-500 text-white font-semibold shadow-lg hover:bg-pink-600'
  } else {
    return 'bg-white text-black font-medium shadow-md border border-gray-200 hover:bg-gray-50'
  }
}

// 獲取曲風顯示名稱
const getGenreDisplayName = (tag) => {
  return genreNameMap[tag] || tag.toUpperCase()
}
</script>

<style scoped>
/* 曲風按鈕樣式 */
.genre-btn-new {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.genre-btn-new:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px) scale(1.05);
}

/* 未選中狀態：白色背景，黑色文字 */
.genre-btn-new.bg-white {
  background-color: white;
  color: black;
}

.genre-btn-new.bg-white:hover {
  background-color: #dba8c1;
}

/* 選中狀態：粉紅色背景，白色文字 */
.genre-btn-new.bg-pink-500 {
  background-color: #ec4899;
  color: white;
}

.genre-btn-new.bg-pink-500:hover {
  background-color: #db2777;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .grid-cols-5 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  .genre-btn-new {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .grid-cols-5 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .genre-btn-new {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>