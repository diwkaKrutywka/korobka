import { ref, computed } from 'vue'
import soundIconOn from '../assets/sound.svg'
import soundIconOff from '../assets/sound-muted.svg'

// Глобальное состояние звука
const isSoundEnabled = ref(true)

export function useSoundControl() {
  const toggleSound = () => {
    isSoundEnabled.value = !isSoundEnabled.value
  }

  const enableSound = () => {
    isSoundEnabled.value = true
  }

  const disableSound = () => {
    isSoundEnabled.value = false
  }

  const soundIcon = computed(() => {
    return isSoundEnabled.value ? soundIconOn : soundIconOff
  })

  const soundIconClass = computed(() => {
    return isSoundEnabled.value 
      ? 'w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7' 
      : 'w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 opacity-50'
  })

  return {
    isSoundEnabled: computed(() => isSoundEnabled.value),
    toggleSound,
    enableSound,
    disableSound,
    soundIcon,
    soundIconClass
  }
}
