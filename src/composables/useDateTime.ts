import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable для единообразного отображения времени и даты
 * во всех компонентах приложения
 */
export function useDateTime() {
  const currentDate = ref('')
  const currentTime = ref('')
  let timeInterval: number | null = null

  // Единая функция для обновления даты и времени
  const updateDateTime = () => {
    const now = new Date()
    
    // Время HH:mm (единый формат)
    currentTime.value = now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // Дата dd / MM (единый формат)
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    currentDate.value = `${day} / ${month}`
  }

  // Функция для получения текущего времени в строковом формате
  // (для использования в сообщениях чата)
  const getCurrentTimeString = () => {
    const now = new Date()
    return now.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Инициализация при монтировании
  const initDateTime = () => {
    updateDateTime()
    timeInterval = window.setInterval(updateDateTime, 1000)
  }

  // Очистка при размонтировании
  const cleanupDateTime = () => {
    if (timeInterval) {
      clearInterval(timeInterval)
      timeInterval = null
    }
  }

  // Автоматическая инициализация и очистка
  onMounted(() => {
    initDateTime()
  })

  onUnmounted(() => {
    cleanupDateTime()
  })

  return {
    currentDate,
    currentTime,
    updateDateTime,
    getCurrentTimeString,
    initDateTime,
    cleanupDateTime
  }
}

// Единые CSS классы для времени и даты
export const dateTimeClasses = {
  container: 'text-[#11AE78] font-bold text-lg sm:text-xl lg:text-2xl leading-tight',
  time: '', // наследует от контейнера
  date: 'text-[#14865E] text-sm sm:text-base lg:text-lg font-bold'
}
