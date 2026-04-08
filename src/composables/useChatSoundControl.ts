import { ref, computed } from 'vue'
import soundIconOn from '../assets/sound.svg'
import soundIconOff from '../assets/sound-muted.svg'

// Отдельное состояние звука для чата (независимо от глобального звука)
const isChatSoundEnabled = ref(true)

export function useChatSoundControl() {
  const toggleChatSound = () => {
    isChatSoundEnabled.value = !isChatSoundEnabled.value
  }

  const enableChatSound = () => {
    isChatSoundEnabled.value = true
  }

  const disableChatSound = () => {
    isChatSoundEnabled.value = false
  }

  const chatSoundIcon = computed(() => {
    return isChatSoundEnabled.value ? soundIconOn : soundIconOff
  })

  const chatSoundIconClass = computed(() => {
    return isChatSoundEnabled.value 
      ? 'w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7' 
      : 'w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 opacity-50'
  })

  return {
    isChatSoundEnabled: computed(() => isChatSoundEnabled.value),
    toggleChatSound,
    enableChatSound,
    disableChatSound,
    chatSoundIcon,
    chatSoundIconClass
  }
}
