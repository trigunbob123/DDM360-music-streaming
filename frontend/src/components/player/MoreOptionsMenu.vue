<!-- 更多選項選單 -->
<template>
  <div class="relative">
    <!-- 選項按鈕 -->
    <button 
      @click="toggleMenu"
      class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
      :class="{ 'bg-white/20': showMenu }"
    >
      <font-awesome-icon icon="ellipsis-h" class="text-sm" />
    </button>
    
    <!-- 下拉選單 -->
    <div 
      v-if="showMenu"
      class="absolute right-0 bottom-full mb-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
    >
      <div class="py-2">
        <button 
          @click="handleAddToFavorites"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
        >
          <font-awesome-icon icon="heart" class="mr-3" />
          加入收藏
        </button>
        
        <button 
          @click="handleAddToPlaylist"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
        >
          <font-awesome-icon icon="plus" class="mr-3" />
          加入播放列表
        </button>
        
        <hr class="border-gray-700 my-2">
        
        <button 
          @click="handleShare"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
        >
          <font-awesome-icon icon="share" class="mr-3" />
          分享歌曲
        </button>
        
        <button 
          @click="handleDownload"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
        >
          <font-awesome-icon icon="download" class="mr-3" />
          下載歌曲
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  currentTrack: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-favorites', 'add-to-playlist'])

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleAddToFavorites = () => {
  emit('add-to-favorites')
  showMenu.value = false
}

const handleAddToPlaylist = () => {
  emit('add-to-playlist')
  showMenu.value = false
}

const handleShare = () => {
  if (navigator.share && props.currentTrack.name) {
    navigator.share({
      title: props.currentTrack.name,
      text: `正在聽 ${props.currentTrack.artist_name} 的 ${props.currentTrack.name}`,
      url: window.location.href
    })
  }
  showMenu.value = false
}

const handleDownload = () => {
  if (props.currentTrack.audiodownload) {
    window.open(props.currentTrack.audiodownload, '_blank')
  }
  showMenu.value = false
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>