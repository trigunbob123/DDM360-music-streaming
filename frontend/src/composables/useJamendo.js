
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'

export function useJamendo() {
  // 基本配置
  const JAMENDO_CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID
  const API_BASE = import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.PROD 
      ? window.location.origin  // 生產環境使用當前域名
      : 'http://127.0.0.1:8000'  // 本地開發環境
  )
  
  // Store
  const playerStore = usePlayerStore()
  
  // 狀態管理
  const isJamendoConnected = ref(false)
  const audioPlayer = ref(null)
  const jamendoConfigured = ref(false)
  
  // 錯誤處理
  const lastError = ref('')
  const playbackState = ref('idle') // 'idle', 'loading', 'playing', 'paused', 'error'

  // 檢查配置
  const checkConfig = async () => {
    try {
      console.log('🚂 檢查 Jamendo 配置...')
      
      const configEndpoint = import.meta.env.PROD 
        ? `${API_BASE}/api/health/`
        : `${API_BASE}/api/jamendo/config/`
      
      const response = await fetch(configEndpoint)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const config = await response.json()
      
      if (import.meta.env.PROD) {
        jamendoConfigured.value = config.status === 'healthy' && 
                                config.features?.jamendo_integration === true
      } else {
        jamendoConfigured.value = config.available && config.status === 'configured'
      }
      
      return jamendoConfigured.value
    } catch (error) {
      console.error('❌ Jamendo 配置檢查失敗:', error)
      jamendoConfigured.value = false
      return false
    }
  }

  // 初始化音頻播放器
  const initializePlayer = () => {
    try {
      if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value.src = ''
      }
      
      audioPlayer.value = new Audio()
      audioPlayer.value.volume = playerStore.volume / 100
      audioPlayer.value.crossOrigin = "anonymous"
      audioPlayer.value.preload = "metadata"
      
      // 事件監聽
      audioPlayer.value.addEventListener('loadstart', () => {
        playerStore.setLoadingTrack(true)
        playbackState.value = 'loading'
      })
      
      audioPlayer.value.addEventListener('canplay', () => {
        playerStore.setDuration(Math.floor(audioPlayer.value.duration || 0))
        playerStore.setLoadingTrack(false)
        playbackState.value = 'idle'
      })
      
      audioPlayer.value.addEventListener('play', () => {
        playerStore.setPlaying(true)
        playbackState.value = 'playing'
      })
      
      audioPlayer.value.addEventListener('pause', () => {
        playerStore.setPlaying(false)
        playbackState.value = 'paused'
      })
      
      audioPlayer.value.addEventListener('timeupdate', () => {
        playerStore.setCurrentTime(Math.floor(audioPlayer.value.currentTime || 0))
      })
      
      audioPlayer.value.addEventListener('ended', () => {
        handleTrackEnd()
      })
      
      audioPlayer.value.addEventListener('error', (e) => {
        console.error('❌ 音頻播放錯誤:', e)
        let errorMessage = '音頻載入失敗'
        
        if (e.target && e.target.error) {
          const mediaError = e.target.error
          switch (mediaError.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = '音頻載入被中止'
              break
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = '網路錯誤'
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = '音頻格式不支援或文件損壞'
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = '音頻格式不支援'
              break
          }
        }
        
        lastError.value = errorMessage
        playerStore.setError(errorMessage)
        playbackState.value = 'error'
      })
      
      console.log('✅ Jamendo 播放器初始化完成')
      
    } catch (error) {
      console.error('❌ 初始化播放器失敗:', error)
      lastError.value = '初始化播放器失敗'
      playbackState.value = 'error'
    }
  }

  // API 請求封裝
  const jamendoAPI = async (endpoint, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_BASE}/api/jamendo/${endpoint}${queryString ? '?' + queryString : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      return data
    } catch (error) {
      console.error('❌ Jamendo API 請求失敗:', error)
      lastError.value = error.message
      throw error
    }
  }

  // 播放音軌
  const playTrack = async (track, playlistTracks = null, trackIndex = 0) => {
    try {
      console.log('🎵 準備播放:', track.name)
      
      if (!audioPlayer.value) {
        initializePlayer()
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // 如果是同一首歌且已經在播放，直接恢復播放
      if (playerStore.currentTrack.id === track.id && !audioPlayer.value.ended && audioPlayer.value.src) {
        if (audioPlayer.value.paused) {
          await audioPlayer.value.play()
        }
        return
      }
      
      // 設置載入狀態
      playerStore.setLoadingTrack(true)
      playbackState.value = 'loading'
      lastError.value = ''
      
      // 設置播放列表
      if (playlistTracks) {
        playerStore.setPlaylist(playlistTracks, trackIndex)
      }
      
      // 安全地停止當前播放
      if (!audioPlayer.value.paused) {
        audioPlayer.value.pause()
      }
      
      // 設置新的音軌
      playerStore.setCurrentTrack(track)
      
      // 獲取音頻 URL
      const audioUrls = getSupportedAudioUrl(track)
      if (audioUrls.length === 0) {
        throw new Error('沒有可用的音頻 URL')
      }
      
      // 嘗試播放
      let successfulUrl = null
      for (const audioUrl of audioUrls) {
        try {
          audioPlayer.value.src = audioUrl
          audioPlayer.value.load()
          
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('音頻載入超時'))
            }, 8000)
            
            const onCanPlay = () => {
              clearTimeout(timeout)
              audioPlayer.value.removeEventListener('canplay', onCanPlay)
              audioPlayer.value.removeEventListener('error', onError)
              resolve()
            }
            
            const onError = (e) => {
              clearTimeout(timeout)
              audioPlayer.value.removeEventListener('canplay', onCanPlay)
              audioPlayer.value.removeEventListener('error', onError)
              reject(new Error('音頻載入失敗'))
            }
            
            audioPlayer.value.addEventListener('canplay', onCanPlay, { once: true })
            audioPlayer.value.addEventListener('error', onError, { once: true })
          })
          
          successfulUrl = audioUrl
          break
          
        } catch (urlError) {
          console.warn('⚠️ URL 失敗，嘗試下一個:', audioUrl, urlError.message)
          continue
        }
      }
      
      if (!successfulUrl) {
        throw new Error('所有音頻 URL 都無法播放')
      }
      
      // 設置音量並開始播放
      audioPlayer.value.volume = playerStore.volume / 100
      await audioPlayer.value.play()
      
      console.log('✅ 成功播放:', track.name)
      
    } catch (error) {
      console.error('❌ 播放失敗:', error)
      
      let userFriendlyMessage = '播放失敗'
      if (error.message.includes('超時')) {
        userFriendlyMessage = '音頻載入超時，請檢查網路連接'
      } else if (error.message.includes('格式')) {
        userFriendlyMessage = '音頻格式不支援，嘗試下一首歌曲'
      } else if (error.message.includes('網路')) {
        userFriendlyMessage = '網路連接問題'
      }
      
      lastError.value = userFriendlyMessage
      playerStore.setError(userFriendlyMessage)
      playerStore.setLoadingTrack(false)
      playbackState.value = 'error'
    }
  }

  // 獲取支援的音頻 URL
  const getSupportedAudioUrl = (track) => {
    const audioUrls = []
    
    if (track.audio) audioUrls.push(track.audio)
    if (track.audiodownload) audioUrls.push(track.audiodownload)
    if (track.audiodownload_allowed && track.shorturl) {
      audioUrls.push(track.shorturl + '/download/')
    }
    
    const validUrls = audioUrls.filter(url => url && typeof url === 'string')
    const mp3Urls = validUrls.filter(url => url.toLowerCase().includes('.mp3') || url.toLowerCase().includes('mp3'))
    const otherUrls = validUrls.filter(url => !url.toLowerCase().includes('.mp3'))
    
    return [...mp3Urls, ...otherUrls]
  }

  // 播放控制
  const togglePlay = async () => {
    try {
      if (!audioPlayer.value || !playerStore.currentTrack.name) {
        console.warn('⚠️ 沒有可播放的音軌')
        return
      }
      
      if (playerStore.isPlaying) {
        audioPlayer.value.pause()
      } else {
        await audioPlayer.value.play()
      }
    } catch (error) {
      console.error('❌ 切換播放狀態失敗:', error)
      lastError.value = '播放控制失敗: ' + error.message
    }
  }

  const previousTrack = async () => {
    try {
      const prevTrack = playerStore.playPrevious()
      if (prevTrack) {
        await playTrack(prevTrack)
      }
    } catch (error) {
      console.error('❌ 上一首失敗:', error)
      lastError.value = '上一首失敗: ' + error.message
    }
  }

  const nextTrack = async () => {
    try {
      const nextTrack = playerStore.playNext()
      if (nextTrack) {
        await playTrack(nextTrack)
      }
    } catch (error) {
      console.error('❌ 下一首失敗:', error)
      lastError.value = '下一首失敗: ' + error.message
    }
  }

  const seek = (event) => {
    if (!audioPlayer.value || !playerStore.duration) return
    
    try {
      const targetTime = event.targetTime || event.progressPercent * playerStore.duration
      audioPlayer.value.currentTime = targetTime
      playerStore.setCurrentTime(Math.floor(targetTime))
      console.log('🎯 跳轉到:', Math.floor(targetTime), '秒')
    } catch (error) {
      console.error('❌ 跳轉失敗:', error)
    }
  }

  const setVolume = (volumePercent) => {
    if (!audioPlayer.value) return
    
    try {
      const newVolume = Math.max(0, Math.min(100, parseInt(volumePercent)))
      playerStore.setVolume(newVolume)
      audioPlayer.value.volume = newVolume / 100
      console.log('🔊 音量設置為:', newVolume + '%')
    } catch (error) {
      console.error('❌ 設置音量失敗:', error)
    }
  }

  const toggleShuffle = () => {
    playerStore.toggleShuffle()
  }

  const toggleRepeat = () => {
    playerStore.toggleRepeat()
  }

  // 處理歌曲結束
  const handleTrackEnd = async () => {
    console.log('🎵 歌曲結束，嘗試播放下一首...')
    
    try {
      const nextTrack = playerStore.playNext()
      if (nextTrack) {
        await playTrack(nextTrack)
      } else {
        playerStore.setPlaying(false)
        playbackState.value = 'idle'
      }
    } catch (error) {
      console.error('❌ 自動播放下一首失敗:', error)
    }
  }

  // 搜尋功能
  const searchTracks = async (query, options = {}) => {
    try {
      const params = {
        q: query,
        limit: 50,
        ...options
      }
      
      const response = await jamendoAPI('search/', params)
      return response.results || []
    } catch (error) {
      console.error('❌ 搜尋失敗:', error)
      return []
    }
  }

  // 按標籤搜尋
  const getTracksByTag = async (tag, options = {}) => {
    try {
      const params = {
        tag: tag,
        limit: 50,
        ...options
      }
      
      const response = await jamendoAPI('tracks/tag/', params)
      return response.results || []
    } catch (error) {
      console.error('❌ 按標籤搜尋失敗:', error)
      return []
    }
  }

  // 獲取熱門音軌
  const getPopularTracks = async (options = {}) => {
    try {
      const params = {
        limit: 50,
        ...options
      }
      
      const response = await jamendoAPI('tracks/popular/', params)
      return response.results || []
    } catch (error) {
      console.error('❌ 獲取熱門音軌失敗:', error)
      return []
    }
  }

  // 獲取最新音軌
  const getLatestTracks = async (options = {}) => {
    try {
      const params = {
        limit: 50,
        ...options
      }
      
      const response = await jamendoAPI('tracks/latest/', params)
      return response.results || []
    } catch (error) {
      console.error('❌ 獲取最新音軌失敗:', error)
      return []
    }
  }

  // 獲取隨機音軌
  const getRandomTracks = async (options = {}) => {
    try {
      const params = {
        limit: 50,
        ...options
      }
      
      const response = await jamendoAPI('tracks/random/', params)
      return response.results || []
    } catch (error) {
      console.error('❌ 獲取隨機音軌失敗:', error)
      return []
    }
  }

  // 連接和斷開
  const connectJamendo = async () => {
    console.log('🎵 連接 Jamendo...')
    
    const configOk = await checkConfig()
    if (!configOk) {
      lastError.value = 'Jamendo 配置不正確'
      return false
    }
    
    try {
      initializePlayer()
      isJamendoConnected.value = true
      lastError.value = ''
      playbackState.value = 'idle'
      
      console.log('✅ Jamendo 連接成功')
      return true
    } catch (error) {
      console.error('❌ Jamendo 連接失敗:', error)
      lastError.value = '連接失敗: ' + error.message
      playbackState.value = 'error'
      return false
    }
  }

  const disconnectJamendo = () => {
    console.log('🔌 斷開 Jamendo 連接')
    
    try {
      if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value.src = ''
      }
      
      isJamendoConnected.value = false
      playerStore.reset()
      lastError.value = ''
      playbackState.value = 'idle'
    } catch (error) {
      console.error('❌ 斷開連接時出錯:', error)
    }
  }

  // 獲取可用標籤
  const getAvailableTags = async () => {
    try {
      const response = await jamendoAPI('tags/')
      return response.results || []
    } catch (error) {
      console.error('❌ 獲取標籤失敗:', error)
      return ['pop', 'rock', 'electronic', 'jazz', 'classical', 'hiphop', 'metal', 'world', 'soundtrack', 'lounge']
    }
  }

  // 生命週期
  onMounted(async () => {
    console.log('🚀 useJamendo 組件已掛載')
    
    const configOk = await checkConfig()
    if (configOk) {
      // 自動嘗試連接
      setTimeout(() => {
        connectJamendo()
      }, 1000)
    }
  })

  onUnmounted(() => {
    try {
      disconnectJamendo()
    } catch (error) {
      console.error('❌ 組件卸載時出錯:', error)
    }
  })

  return {
    // 狀態
    isJamendoConnected,
    jamendoConfigured,
    lastError,
    playbackState,

    // 方法
    connectJamendo,
    disconnectJamendo,
    playTrack,
    togglePlay,
    previousTrack,
    nextTrack,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    searchTracks,
    getTracksByTag,
    getPopularTracks,
    getLatestTracks,
    getRandomTracks,
    getAvailableTags
  }
}