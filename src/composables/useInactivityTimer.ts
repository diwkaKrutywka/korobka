import { ref, onMounted, onUnmounted } from 'vue'

export function useInactivityTimer(timeoutMs: number = 30000) {
  const isInactive = ref(false)
  let inactivityTimer: number | null = null
  let lastActivityTime = Date.now()

  const resetTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }
    
    lastActivityTime = Date.now()
    isInactive.value = false
    
    inactivityTimer = window.setTimeout(() => {
      // Проверяем, действительно ли прошло нужное время без активности
      const timeSinceLastActivity = Date.now() - lastActivityTime
      if (timeSinceLastActivity >= timeoutMs) {
        isInactive.value = true
      } else {
        // Если была активность, перезапускаем таймер
        resetTimer()
      }
    }, timeoutMs)
  }

  const stopTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
    isInactive.value = false
  }

  const handleActivity = () => {
    lastActivityTime = Date.now()
    resetTimer()
  }

  // Публичная функция для программного сброса таймера (например, при получении сообщений)
  const markActivity = () => {
    lastActivityTime = Date.now()
    if (isInactive.value) {
      isInactive.value = false
    }
  }

  const events = [
    'mousedown',
    'mousemove', 
    'keypress',
    'keydown',
    'keyup',
    'scroll',
    'touchstart',
    'touchmove',
    'touchend',
    'click',
    'input',
    'focus',
    'blur'
  ]

  onMounted(() => {
    // Запускаем таймер
    resetTimer()
    
    // Добавляем слушатели активности
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })
  })

  onUnmounted(() => {
    // Очищаем таймер
    stopTimer()
    
    // Удаляем слушатели
    events.forEach(event => {
      document.removeEventListener(event, handleActivity, true)
    })
  })

  return {
    isInactive,
    resetTimer,
    stopTimer,
    markActivity
  }
}
