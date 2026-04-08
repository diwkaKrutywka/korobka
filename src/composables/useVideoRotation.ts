import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { videoAssets } from '../assets/videoImports'

// Глобальное хранилище для изолированных экземпляров
const videoInstances = new Map<string, {
  currentVideoSrc: any,
  isIdleVideo: any,
  rotationInterval: number | null,
  switchToIdle?: () => void
}>()

export function useVideoRotation(instanceId?: string, pageType?: string) {
  const { locale } = useI18n()
  
  // Создаем уникальный ID для экземпляра
  const id = instanceId || `video_${Math.random().toString(36).substr(2, 9)}`
  
  // Получаем или создаем экземпляр
  let instance = videoInstances.get(id)
  if (!instance) {
    instance = {
      currentVideoSrc: ref(videoAssets.idle),
      isIdleVideo: ref(true),
      rotationInterval: null
    }
    videoInstances.set(id, instance)
  }
  
  const { currentVideoSrc, isIdleVideo } = instance
  
  // Функция для получения видео в зависимости от языка
  const getVoiceVideos = (currentLang: string) => {
    if (pageType && videoAssets.pageSpecific[pageType as keyof typeof videoAssets.pageSpecific]) {
      const pageVideos = videoAssets.pageSpecific[pageType as keyof typeof videoAssets.pageSpecific]
      // Для страницы выбора языка используем оба языка независимо от текущего языка
      if (pageType === 'language') {
        // Для страницы выбора языка показываем оба языка
        return [...(pageVideos.ru || []), ...(pageVideos.kk || [])]
      } else {
        return pageVideos[currentLang as keyof typeof pageVideos] || pageVideos.ru
      }
    } else {
      // Используем общие видео
      const generalVideos = videoAssets[currentLang as keyof typeof videoAssets]
      return Array.isArray(generalVideos) ? generalVideos : videoAssets.ru
    }
  }
  
  // Реактивная переменная для текущего языка
  const currentLocale = ref(locale.value || localStorage.getItem('currentLang') || 'kk')
  
  // Определяем видео для ротации в зависимости от типа страницы
  let voiceVideos = getVoiceVideos(currentLocale.value)
  
  
  // Функция для обновления видео при смене языка
  const updateVideosForLanguage = (newLang: string) => {
    console.log('Updating videos for language:', newLang)
    // Обновляем текущий язык
    currentLocale.value = newLang
    
    // Для страницы main всегда оставляем idle видео
    if (pageType === 'main') {
      console.log('Main page - keeping idle video')
      currentVideoSrc.value = videoAssets.idle
      isIdleVideo.value = true
      return
    }
    
    const newVoiceVideos = getVoiceVideos(newLang)
    console.log('New voice videos:', newVoiceVideos)
    
    // Если текущее видео не из нового списка, переключаемся на первое видео нового языка
    const currentVideo = currentVideoSrc.value
    const isCurrentVideoInNewList = newVoiceVideos.includes(currentVideo)
    console.log('Current video:', currentVideo, 'Is in new list:', isCurrentVideoInNewList)
    
    if (!isCurrentVideoInNewList && newVoiceVideos.length > 0) {
      // Переключаемся на первое видео нового языка
      console.log('Switching to first video of new language:', newVoiceVideos[0])
      currentVideoSrc.value = newVoiceVideos[0]
      isIdleVideo.value = false
      // Обновляем список видео
      voiceVideos = newVoiceVideos
      // Перезапускаем ротацию
      startRotation()
    } else if (isCurrentVideoInNewList) {
      // Если текущее видео уже на правильном языке, просто обновляем список и перезапускаем ротацию
      console.log('Current video is already in correct language, updating rotation')
      voiceVideos = newVoiceVideos
      startRotation()
    }
  }

  const startRotation = () => {
    // Очищаем предыдущий интервал
    if (instance.rotationInterval) {
      clearTimeout(instance.rotationInterval)
    }
    
    // Обновляем список видео для текущего языка
    voiceVideos = getVoiceVideos(currentLocale.value)
    
    // Специальная логика для страницы main - циклическое воспроизведение idle видео
    if (pageType === 'main') {
      // Для страницы main показываем idle видео в цикле
      currentVideoSrc.value = videoAssets.idle
      isIdleVideo.value = true
      
      // Запускаем циклическое воспроизведение idle видео
      const startIdleLoop = () => {
        // Перезапускаем idle видео каждые 30 секунд для непрерывного воспроизведения
        instance.rotationInterval = setTimeout(() => {
          // Принудительно перезагружаем и перезапускаем idle видео
          currentVideoSrc.value = videoAssets.idle
          isIdleVideo.value = true
          
          // Планируем следующий цикл
          startIdleLoop()
        }, 30000) // 30 секунд для каждого цикла
      }
      
      // Запускаем первый цикл через 30 секунд
      instance.rotationInterval = setTimeout(() => {
        startIdleLoop()
      }, 30000)
      
      // Дополнительная логика для принудительного запуска idle видео
      const forcePlayIdle = () => {
        if (currentVideoSrc.value === videoAssets.idle) {
          // Принудительно обновляем источник видео для запуска
          currentVideoSrc.value = videoAssets.idle
          isIdleVideo.value = true
        }
      }
      
      // Множественные попытки запуска idle видео
      setTimeout(forcePlayIdle, 100)
      setTimeout(forcePlayIdle, 500)
      setTimeout(forcePlayIdle, 1000)
      setTimeout(forcePlayIdle, 2000)
      
      return
    }
    
    // Специальная логика для страницы выбора языка
    if (pageType === 'language') {
      // Для страницы выбора языка используем последовательность в зависимости от текущего языка
      const kazakhVideo = voiceVideos.find(video => video.includes('_kz'))
      const russianVideo = voiceVideos.find(video => video.includes('_ru'))
      
      if (kazakhVideo && russianVideo) {
        // Начинаем с видео на текущем языке
        const firstVideo = currentLocale.value === 'kk' ? kazakhVideo : russianVideo
        currentVideoSrc.value = firstVideo
        isIdleVideo.value = false
        
        // Функция для переключения на следующее видео в зависимости от текущего языка
        const switchToNextLanguage = () => {
          const nextVideo = currentLocale.value === 'kk' ? russianVideo : kazakhVideo
          currentVideoSrc.value = nextVideo
          isIdleVideo.value = false
          
          // После следующего языка переключаемся на idle
          instance.rotationInterval = setTimeout(() => {
            currentVideoSrc.value = videoAssets.idle
            isIdleVideo.value = true
            
            // Через 30 секунд начинаем цикл заново с языка по умолчанию
            instance.rotationInterval = setTimeout(() => {
              const defaultVideo = currentLocale.value === 'kk' ? kazakhVideo : russianVideo
              currentVideoSrc.value = defaultVideo
              isIdleVideo.value = false
              
              // Планируем переключение на следующий язык через 5 секунд
              instance.rotationInterval = setTimeout(() => {
                switchToNextLanguage()
              }, 8000)
            }, 30000)
          }, 8000) // 5 секунд для следующего языка
        }
        
        // Планируем первое переключение на следующий язык через 5 секунд
        instance.rotationInterval = setTimeout(() => {
          switchToNextLanguage()
        }, 8000)
        
        // Сохраняем функцию для переключения
        instance.switchToIdle = switchToNextLanguage
      } else {
        // Если нет нужных видео, используем обычную логику с включением idle в ротацию
        const allVideos = [...voiceVideos, videoAssets.idle] // Включаем idle в список видео
        let currentIndex = 0
        
        // Начинаем с первого видео (не idle)
        const firstVideo = voiceVideos[0]
        if (firstVideo) {
          currentVideoSrc.value = firstVideo
          isIdleVideo.value = false
          currentIndex = 0
        } else {
          currentVideoSrc.value = videoAssets.idle
          isIdleVideo.value = true
          currentIndex = allVideos.length - 1 // idle всегда последний
        }
        
        // Функция для переключения на следующее видео в цикле
        const switchToNext = () => {
          currentIndex = (currentIndex + 1) % allVideos.length
          const nextVideo = allVideos[currentIndex]
          
          currentVideoSrc.value = nextVideo
          isIdleVideo.value = nextVideo === videoAssets.idle
          
          // Планируем следующее переключение
          const delay = nextVideo === videoAssets.idle ? 30000 : 5000 // 30 сек для idle, 5 сек для обычных видео
          instance.rotationInterval = setTimeout(() => {
            switchToNext()
          }, delay)
        }
        
        // Функция для переключения на idle после окончания разговорного видеоШ
        const switchToIdle = () => {
          // Находим индекс idle видео в массиве
          const idleIndex = allVideos.findIndex(video => video === videoAssets.idle)
          if (idleIndex !== -1) {
            currentIndex = idleIndex
            currentVideoSrc.value = videoAssets.idle
            isIdleVideo.value = true
            
            // Планируем следующее переключение через 30 секунд
            instance.rotationInterval = setTimeout(() => {
              switchToNext()
            }, 30000)
          }
        }
        
        // Запускаем цикл ротации
        const delay = firstVideo ? 8000 : 30000 // 5 сек для обычного видео, 30 сек для idle
        instance.rotationInterval = setTimeout(() => {
          switchToNext()
        }, delay)
        
        instance.switchToIdle = switchToIdle
      }
    } else {
      // Обычная логика для других страниц с включением idle в ротацию
      const allVideos = [...voiceVideos, videoAssets.idle] // Включаем idle в список видео
      let currentIndex = 0
      
      // Начинаем с первого видео (не idle)
      const firstVideo = voiceVideos[0]
      if (firstVideo) {
        currentVideoSrc.value = firstVideo
        isIdleVideo.value = false
        currentIndex = 0
      } else {
        currentVideoSrc.value = videoAssets.idle
        isIdleVideo.value = true
        currentIndex = allVideos.length - 1 // idle всегда последний
      }
      
      // Функция для переключения на следующее видео в цикле
      const switchToNext = () => {
        currentIndex = (currentIndex + 1) % allVideos.length
        const nextVideo = allVideos[currentIndex]
        
        currentVideoSrc.value = nextVideo
        isIdleVideo.value = nextVideo === videoAssets.idle
        
        // Планируем следующее переключение
        const delay = nextVideo === videoAssets.idle ? 30000 : 5000 // 30 сек для idle, 5 сек для обычных видео
        instance.rotationInterval = setTimeout(() => {
          switchToNext()
        }, delay)
      }
      
      // Функция для переключения на idle после окончания разговорного видео
      const switchToIdle = () => {
        // Находим индекс idle видео в массиве
        const idleIndex = allVideos.findIndex(video => video === videoAssets.idle)
        if (idleIndex !== -1) {
          currentIndex = idleIndex
          currentVideoSrc.value = videoAssets.idle
          isIdleVideo.value = true
          
          // Планируем следующее переключение через 30 секунд
          instance.rotationInterval = setTimeout(() => {
            switchToNext()
          }, 30000)
        }
      }
      
      // Запускаем цикл ротации
      const delay = firstVideo ? 5000 : 30000 // 5 сек для обычного видео, 30 сек для idle
      instance.rotationInterval = setTimeout(() => {
        switchToNext()
      }, delay)
      
      instance.switchToIdle = switchToIdle
    }
  }
  
  const stopRotation = () => {
    if (instance.rotationInterval) {
      clearTimeout(instance.rotationInterval)
      instance.rotationInterval = null
    }
  }
  
  const setSpecificVideo = (videoSrc: string) => {
    stopRotation()
    currentVideoSrc.value = videoSrc
    isIdleVideo.value = videoSrc === videoAssets.idle
    
    // Для страницы main не запускаем ротацию
    if (pageType === 'main') {
      return
    }
    
    // Для других страниц перезапускаем ротацию
    startRotation()
  }
  
  // Отслеживаем изменения языка
  watch(locale, (newLocale) => {
    if (newLocale) {
      console.log('Language changed to:', newLocale)
      updateVideosForLanguage(newLocale)
    }
  })

  onMounted(() => {
    // Небольшая задержка для полной инициализации компонента
    setTimeout(() => {
      startRotation()
    }, 100)
    
    // Дополнительная попытка запуска через 1 секунду для надежности
    setTimeout(() => {
      if (currentVideoSrc.value === videoAssets.idle && voiceVideos.length > 0) {
        const firstVideo = voiceVideos[0]
        currentVideoSrc.value = firstVideo
        isIdleVideo.value = false
      }
    }, 1000)
  })
  
  onUnmounted(() => {
    stopRotation()
    // Удаляем экземпляр из хранилища
    videoInstances.delete(id)
  })
  
  return {
    currentVideoSrc,
    isIdleVideo,
    startRotation,
    stopRotation,
    setSpecificVideo,
    switchToIdle: instance.switchToIdle,
    instanceId: id
  }
}
