import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'

export function useJamendo() {
  // 基本配置
  const JAMENDO_CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID
  const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0'
  
  // Store
  const playerStore = usePlayerStore()
  
  // 狀態管理
  const isJamendoConnected = ref(false)
  const audioPlayer = ref(null)
  const jamendoConfigured = ref(false)
  
  // 錯誤處理
  const lastError = ref('')
  const playbackState = ref('idle')
  
  // 播放列表管理
  const currentPlaylist = ref([])
  const currentTrackIndex = ref(0)
  const autoPlayNext = ref(true)

  // 音頻格式驗證和備用 URL 處理
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
    
    console.log('🔗 找到的音頻 URLs:', { mp3Urls, otherUrls, allUrls: validUrls })
    return [...mp3Urls, ...otherUrls]
  }

  // 檢查配置
  const checkConfig = async () => {
    try {
      console.log('🚂 檢查 Jamendo 配置...')
      
      if (!JAMENDO_CLIENT_ID) {
        console.error('❌ JAMENDO_CLIENT_ID 未設置')
        jamendoConfigured.value = false
        return false
      }
      
      // 測試 API 連接
      const testResponse = await fetch(`${JAMENDO_BASE_URL}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=1`)
      
      if (testResponse.ok) {
        jamendoConfigured.value = true
        console.log('✅ Jamendo API 配置正常')
        return true
      } else {
        throw new Error(`API 測試失敗: ${testResponse.status}`)
      }
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
      
      // 事件監聽器
      audioPlayer.value.addEventListener('loadstart', () => {
        console.log('🎵 開始載入音頻')
        playerStore.setLoadingTrack(true)
        playbackState.value = 'loading'
      })
      
      audioPlayer.value.addEventListener('canplay', () => {
        console.log('🎵 音頻可以播放')
        playerStore.setDuration(Math.floor(audioPlayer.value.duration || 0))
        playerStore.setLoadingTrack(false)
        if (playbackState.value === 'loading') {
          playbackState.value = 'idle'
        }
      })
      
      audioPlayer.value.addEventListener('play', () => {
        console.log('▶️ 音頻開始播放')
        playerStore.setPlaying(true)
        playbackState.value = 'playing'
      })
      
      audioPlayer.value.addEventListener('pause', () => {
        console.log('⏸️ 音頻暫停')
        playerStore.setPlaying(false)
        playbackState.value = 'paused'
      })
      
      audioPlayer.value.addEventListener('timeupdate', () => {
        playerStore.setCurrentTime(Math.floor(audioPlayer.value.currentTime || 0))
      })
      
      audioPlayer.value.addEventListener('ended', () => {
        console.log('🎵 歌曲播放結束')
        playerStore.setPlaying(false)
        playbackState.value = 'idle'
        
        if (autoPlayNext.value) {
          handleTrackEnd()
        }
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
            default:
              errorMessage = '未知的音頻錯誤'
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

  // 直接 API 請求封裝
  const jamendoAPI = async (endpoint, params = {}) => {
    try {
      const apiParams = {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        ...params
      }
      
      const queryString = new URLSearchParams(apiParams).toString()
      const url = `${JAMENDO_BASE_URL}/${endpoint}?${queryString}`
      
      console.log('🔄 Jamendo API 請求:', url)
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DDM360/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.results) {
        throw new Error('API 響應格式錯誤')
      }
      
      console.log('✅ Jamendo API 響應:', data.results.length, '筆結果')
      return data.results
      
    } catch (error) {
      console.error('❌ Jamendo API 請求失敗:', error)
      lastError.value = error.message
      throw error
    }
  }

  // 改進的播放音軌函數
  const playTrack = async (track, playlistTracks = null, trackIndex = 0) => {
    try {
      console.log('🎵 準備播放:', track.name)
      
      if (playbackState.value === 'loading') {
        console.log('⏳ 正在載入中，忽略重複請求')
        return
      }
      
      if (!audioPlayer.value) {
        initializePlayer()
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // 如果是同一首歌且已經在播放，直接恢復播放
      if (playerStore.currentTrack.id === track.id && 
          !audioPlayer.value.ended && 
          audioPlayer.value.src) {
        console.log('🎵 同一首歌，恢復播放')
        if (audioPlayer.value.paused) {
          await safePlay()
        }
        return
      }
      
      // 設置載入狀態
      playerStore.setLoadingTrack(true)
      playbackState.value = 'loading'
      lastError.value = ''
      
      // 設置播放列表
      if (playlistTracks) {
        setPlaylist(playlistTracks, trackIndex)
      }
      
      // 安全地停止當前播放
      await safePause()
      
      // 設置新的音軌
      playerStore.setCurrentTrack(track)
      
      // 改進音頻 URL 驗證和備用處理
      const audioUrls = getSupportedAudioUrl(track)
      if (audioUrls.length === 0) {
        throw new Error('沒有可用的音頻 URL')
      }
      
      console.log('🔗 可用的音頻 URLs:', audioUrls)
      
      let successfulUrl = null
      let attemptCount = 0
      
      // 嘗試每個 URL
      for (const audioUrl of audioUrls) {
        attemptCount++
        try {
          console.log(`🔗 嘗試音頻 URL ${attemptCount}/${audioUrls.length}:`, audioUrl)
          
          // 驗證 URL 格式
          new URL(audioUrl)
          
          // 重置音頻元素
          audioPlayer.value.src = ''
          audioPlayer.value.load()
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // 設置新的音頻源
          audioPlayer.value.src = audioUrl
          
          // 改進的音頻載入等待機制
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.warn('⏰ 音頻載入超時，嘗試下一個 URL:', audioUrl)
              reject(new Error('音頻載入超時'))
            }, 8000)
            
            let resolved = false
            
            const onCanPlay = () => {
              if (resolved) return
              resolved = true
              clearTimeout(timeout)
              audioPlayer.value.removeEventListener('canplay', onCanPlay)
              audioPlayer.value.removeEventListener('error', onError)
              audioPlayer.value.removeEventListener('loadeddata', onLoadedData)
              resolve()
            }
            
            const onLoadedData = () => {
              if (resolved) return
              console.log('📊 音頻數據已載入，準備播放:', audioUrl)
              onCanPlay()
            }
            
            const onError = (e) => {
              if (resolved) return
              resolved = true
              clearTimeout(timeout)
              audioPlayer.value.removeEventListener('canplay', onCanPlay)
              audioPlayer.value.removeEventListener('error', onError)
              audioPlayer.value.removeEventListener('loadeddata', onLoadedData)
              
              let errorMsg = '音頻載入失敗'
              if (e.target?.error) {
                const mediaError = e.target.error
                switch (mediaError.code) {
                  case MediaError.MEDIA_ERR_ABORTED:
                    errorMsg = '載入被中止'
                    break
                  case MediaError.MEDIA_ERR_NETWORK:
                    errorMsg = '網路錯誤'
                    break
                  case MediaError.MEDIA_ERR_DECODE:
                    errorMsg = '解碼錯誤'
                    break
                  case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMsg = '格式不支援'
                    break
                }
              }
              
              console.warn('❌ 音頻載入錯誤:', audioUrl, errorMsg)
              reject(new Error(errorMsg))
            }
            
            audioPlayer.value.addEventListener('canplay', onCanPlay, { once: true })
            audioPlayer.value.addEventListener('loadeddata', onLoadedData, { once: true })
            audioPlayer.value.addEventListener('error', onError, { once: true })
            
            console.log('📥 開始載入音頻:', audioUrl)
            audioPlayer.value.load()
          })
          
          successfulUrl = audioUrl
          console.log('✅ 成功載入音頻 URL:', successfulUrl)
          break
          
        } catch (urlError) {
          console.warn(`⚠️ URL ${attemptCount}/${audioUrls.length} 失敗，嘗試下一個:`, audioUrl, urlError.message)
          
          if (attemptCount === audioUrls.length && !successfulUrl) {
            const fallbackUrl = audioUrls[0]
            try {
              console.log('🎯 緊急備用策略，使用第一個 URL:', fallbackUrl)
              audioPlayer.value.src = ''
              audioPlayer.value.load()
              await new Promise(resolve => setTimeout(resolve, 200))
              audioPlayer.value.src = fallbackUrl
              successfulUrl = fallbackUrl
              break
            } catch (fallbackError) {
              console.error('❌ 緊急備用策略也失敗:', fallbackError)
            }
          }
          continue
        }
      }
      
      if (!successfulUrl) {
        if (audioUrls.length > 0) {
          const lastAttemptUrl = audioUrls[0]
          console.log('🎲 最後嘗試使用第一個 URL (無預檢):', lastAttemptUrl)
          audioPlayer.value.src = lastAttemptUrl
          successfulUrl = lastAttemptUrl
        } else {
          throw new Error('沒有找到任何音頻 URL')
        }
      }
      
      // 設置音量
      audioPlayer.value.volume = playerStore.volume / 100
      
      // 安全地開始播放
      await safePlay()
      
      console.log('✅ 成功播放:', track.name)
      
    } catch (error) {
      console.error('❌ 播放失敗:', error)
      
      let userFriendlyMessage = '播放失敗'
      
      if (error.message.includes('超時')) {
        userFriendlyMessage = '音頻載入超時，請檢查網路連接'
      } else if (error.message.includes('格式') || error.message.includes('decode')) {
        userFriendlyMessage = '音頻格式不支援，嘗試下一首歌曲'
      } else if (error.message.includes('網路') || error.message.includes('NETWORK')) {
        userFriendlyMessage = '網路連接問題'
      } else if (error.message.includes('URL') || error.message.includes('不可用')) {
        userFriendlyMessage = '音頻連結無效，嘗試下一首歌曲'
      }
      
      lastError.value = userFriendlyMessage
      playerStore.setError(userFriendlyMessage)
      playerStore.setLoadingTrack(false)
      playbackState.value = 'error'
      
      // 如果是播放清單模式，自動跳到下一首
      if (currentPlaylist.value.length > 1) {
        console.log('🔄 播放失敗，嘗試播放下一首...')
        setTimeout(async () => {
          try {
            await nextTrack()
          } catch (nextError) {
            console.error('❌ 跳到下一首也失敗:', nextError)
          }
        }, 1000)
      }
      
      console.warn('⚠️ 播放失敗，但不中斷用戶體驗:', error.message)
    } finally {
      playerStore.setLoadingTrack(false)
    }
  }

  // 改進的安全播放函數
  const safePlay = async () => {
    try {
      if (!audioPlayer.value || !audioPlayer.value.src) {
        throw new Error('音頻元素未準備就緒')
      }
      
      // 檢查音頻是否準備就緒
      if (audioPlayer.value.readyState < 2) {
        console.log('⏳ 等待音頻準備就緒...')
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('音頻準備超時'))
          }, 5000)
          
          const checkReady = () => {
            if (audioPlayer.value.readyState >= 2) {
              clearTimeout(timeout)
              resolve()
            } else if (audioPlayer.value.error) {
              clearTimeout(timeout)
              reject(new Error('音頻錯誤: ' + (audioPlayer.value.error.message || '未知錯誤')))
            } else {
              setTimeout(checkReady, 100)
            }
          }
          checkReady()
        })
      }
      
      if (audioPlayer.value.error) {
        throw new Error('音頻文件損壞: ' + (audioPlayer.value.error.message || '未知錯誤'))
      }
      
      console.log('▶️ 開始安全播放')
      await audioPlayer.value.play()
      console.log('✅ 播放成功')
      
    } catch (error) {
      if (error.name === 'AbortError' || 
          error.message.includes('interrupted') || 
          error.message.includes('pause()')) {
        console.log('🔄 播放被中斷，這是正常的操作')
        return
      }
      
      if (error.name === 'NotSupportedError' || error.message.includes('format')) {
        console.error('❌ 音頻格式不支援:', error)
        throw new Error('音頻格式不支援')
      }
      
      if (error.name === 'NotAllowedError') {
        console.error('❌ 播放被阻止（可能需要用戶交互）:', error)
        throw new Error('請先點擊頁面任意位置啟用音頻播放')
      }
      
      console.error('❌ 播放失敗:', error)
      throw error
    }
  }

  // 改進的安全暫停函數
  const safePause = async () => {
    try {
      if (!audioPlayer.value.paused) {
        audioPlayer.value.pause()
        console.log('⏸️ 音頻已暫停')
      }
      await new Promise(resolve => setTimeout(resolve, 50))
    } catch (error) {
      console.warn('⚠️ 暫停音頻時出錯:', error)
    }
  }

  // 播放控制
  const togglePlay = async () => {
    try {
      if (!audioPlayer.value || !playerStore.currentTrack.name) {
        console.warn('⚠️ 沒有可播放的音軌')
        return
      }
      
      if (playerStore.isLoadingTrack) {
        console.log('⏳ 歌曲正在載入中，請稍候...')
        return
      }
      
      if (playbackState.value === 'loading') {
        console.log('⏳ 播放器正在載入，請稍候...')
        return
      }
      
      if (playerStore.isPlaying) {
        await safePause()
      } else {
        await safePlay()
      }
    } catch (error) {
      console.error('❌ 切換播放狀態失敗:', error)
      lastError.value = '播放控制失敗: ' + error.message
    }
  }

  const previousTrack = async () => {
    try {
      if (currentPlaylist.value.length === 0) {
        console.warn('⚠️ 沒有播放列表')
        return
      }
      
      let prevIndex = currentTrackIndex.value - 1
      if (prevIndex < 0) {
        prevIndex = playerStore.repeatMode === 'all' ? currentPlaylist.value.length - 1 : 0
      }
      
      currentTrackIndex.value = prevIndex
      const prevTrack = currentPlaylist.value[prevIndex]
      await playTrack(prevTrack)
      
    } catch (error) {
      console.error('❌ 上一首失敗:', error)
      lastError.value = '上一首失敗: ' + error.message
    }
  }

  const nextTrack = async () => {
    try {
      await playNextInPlaylist()
    } catch (error) {
      console.error('❌ 下一首失敗:', error)
      lastError.value = '下一首失敗: ' + error.message
    }
  }

  const seek = (event) => {
    if (!audioPlayer.value || !playerStore.duration) return
    
    try {
      const newTime = event.targetTime || event.progressPercent * playerStore.duration
      audioPlayer.value.currentTime = newTime
      playerStore.setCurrentTime(Math.floor(newTime))
      console.log('🎯 跳轉到:', Math.floor(newTime), '秒')
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
    console.log('🔀 隨機播放:', playerStore.isShuffled ? '開啟' : '關閉')
  }

  const toggleRepeat = () => {
    playerStore.toggleRepeat()
    console.log('🔁 重複模式:', playerStore.repeatMode)
  }

  // 播放列表管理
  const setPlaylist = (tracks, startIndex = 0) => {
    currentPlaylist.value = tracks
    currentTrackIndex.value = startIndex
    playerStore.setPlaylist(tracks, startIndex)
    console.log('📋 設置播放列表:', tracks.length, '首歌曲')
  }

  const clearPlaylist = () => {
    currentPlaylist.value = []
    currentTrackIndex.value = 0
    playerStore.clearPlaylist()
    console.log('📋 清除播放列表')
  }

  const playNextInPlaylist = async () => {
    if (currentPlaylist.value.length === 0) return
    
    try {
      let nextIndex = currentTrackIndex.value + 1
      
      if (playerStore.repeatMode === 'one') {
        nextIndex = currentTrackIndex.value
      } else if (nextIndex >= currentPlaylist.value.length) {
        if (playerStore.repeatMode === 'all') {
          nextIndex = 0
        } else {
          console.log('🎵 播放列表已結束')
          return
        }
      }
      
      if (playerStore.isShuffled && playerStore.repeatMode !== 'one') {
        nextIndex = Math.floor(Math.random() * currentPlaylist.value.length)
      }
      
      currentTrackIndex.value = nextIndex
      const nextTrack = currentPlaylist.value[nextIndex]
      
      console.log('🎵 播放下一首:', nextTrack.name)
      await playTrack(nextTrack)
    } catch (error) {
      console.error('❌ 播放下一首失敗:', error)
    }
  }

  const handleTrackEnd = async () => {
    console.log('🎵 歌曲結束，嘗試播放下一首...')
    
    try {
      if (currentPlaylist.value.length > 0) {
        await playNextInPlaylist()
      }
    } catch (error) {
      console.error('❌ 自動播放下一首失敗:', error)
    }
  }

  // 搜尋功能 - 使用真實 Jamendo API
  const searchTracks = async (query, options = {}) => {
    try {
      const params = {
        search: query,
        limit: options.limit || 50,
        order: options.order || 'popularity_total',
        include: 'musicinfo',
        audioformat: 'mp32'
      }
      
      const results = await jamendoAPI('tracks', params)
      return results
    } catch (error) {
      console.error('❌ 搜尋失敗:', error)
      return []
    }
  }

  const getTracksByTag = async (tag, options = {}) => {
    try {
      const params = {
        tags: tag,
        limit: options.limit || 50,
        order: options.order || 'popularity_total',
        include: 'musicinfo',
        audioformat: 'mp32'
      }
      
      const results = await jamendoAPI('tracks', params)
      return results
    } catch (error) {
      console.error('❌ 按標籤搜尋失敗:', error)
      return []
    }
  }

  const getPopularTracks = async (options = {}) => {
    try {
      const params = {
        limit: options.limit || 50,
        order: 'popularity_total',
        include: 'musicinfo',
        audioformat: 'mp32'
      }
      
      const results = await jamendoAPI('tracks', params)
      return results
    } catch (error) {
      console.error('❌ 獲取熱門音軌失敗:', error)
      return []
    }
  }

  const getLatestTracks = async (options = {}) => {
    try {
      const params = {
        limit: options.limit || 50,
        order: 'releasedate_desc',
        include: 'musicinfo',
        audioformat: 'mp32'
      }
      
      const results = await jamendoAPI('tracks', params)
      return results
    } catch (error) {
      console.error('❌ 獲取最新音軌失敗:', error)
      return []
    }
  }

  const getRandomTracks = async (options = {}) => {
    try {
      // Jamendo 沒有直接的隨機 API，我們使用隨機 offset
      const randomOffset = Math.floor(Math.random() * 10000)
      const params = {
        limit: options.limit || 50,
        offset: randomOffset,
        order: 'popularity_total',
        include: 'musicinfo',
        audioformat: 'mp32'
      }
      
      const results = await jamendoAPI('tracks', params)
      return results
    } catch (error) {
      console.error('❌ 獲取隨機音軌失敗:', error)
      return []
    }
  }

  const getAvailableTags = async () => {
    try {
      const results = await jamendoAPI('tracks/tags')
      return results.map(tag => tag.name) || []
    } catch (error) {
      console.error('❌ 獲取標籤失敗:', error)
      return ['pop', 'rock', 'electronic', 'jazz', 'classical', 'hiphop', 'metal', 'world', 'soundtrack', 'lounge']
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
      clearPlaylist()
      lastError.value = ''
      playbackState.value = 'idle'
    } catch (error) {
      console.error('❌ 斷開連接時出錯:', error)
    }
  }

  // 生命週期
  onMounted(async () => {
    console.log('🚀 useJamendo 組件已掛載')
    
    const configOk = await checkConfig()
    if (configOk) {
      await connectJamendo()
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
    currentPlaylist,
    currentTrackIndex,
    autoPlayNext,

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
    setPlaylist,
    clearPlaylist,
    playNextInPlaylist,
    getAvailableTags
  }
}