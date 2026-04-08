<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
    style="z-index: 9999 !important;"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full pt-8"
      style="box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);"
      @click.stop
    >
      <div class="flex flex-col items-center justify-center gap-4 h-full">
        <!-- Таймер -->
        <div class="flex items-center justify-center mb-4">
          <div class="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" stroke="#E5E7EB" stroke-width="2" fill="none"/>
              <circle
                cx="20" cy="20" r="18"
                stroke="#5478FF"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                :stroke-dasharray="`${2 * Math.PI * 18}`"
                :stroke-dashoffset="`${2 * Math.PI * 18 * (1 - (totalTime - countdown) / totalTime)}`"
                class="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-sm sm:text-base lg:text-lg font-bold" style="color: #5478FF;">{{ countdown }}</span>
            </div>
          </div>
        </div>

        <!-- Логотип продукта (inline) -->
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg,#111FA2,#5478FF);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <span class="text-lg font-extrabold" style="color: #111FA2;">MedContact</span>
        </div>
        <div class="text-xs text-gray-400 mb-2">Медицинский киоск</div>

        <!-- Нижняя панель -->
        <nav class="flex flex-col justify-between items-center w-full py-6 rounded-2xl" style="background: #0d1240;">
          <div class="text-center text-white text-sm sm:text-base lg:text-lg font-bold leading-tight my-3 sm:my-4" v-html="t('static_ad_title')" />

          <!-- QR (inline) -->
          <div class="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white rounded-xl p-2 flex items-center justify-center">
            <svg viewBox="0 0 24 24" class="w-full h-full" fill="none" stroke="#111FA2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="5" y="5" width="3" height="3" fill="#111FA2" stroke="none"/>
              <rect x="16" y="5" width="3" height="3" fill="#111FA2" stroke="none"/>
              <rect x="5" y="16" width="3" height="3" fill="#111FA2" stroke="none"/>
              <path d="M14 14h2v2h-2zM18 14h3M18 17v3M14 18h2v2"/>
            </svg>
          </div>

          <a href="http://medcontact.ai" target="_blank"
            class="font-bold text-sm sm:text-base hover:opacity-80 transition-colors mb-6 mt-10"
            style="color: #5478FF;">
            http://medcontact.ai
          </a>

          <!-- Закрыть -->
          <div
            @click="closeModal"
            class="m-auto px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-white font-medium transition-all duration-300 transform hover:scale-105 cursor-pointer text-sm sm:text-base"
            style="background: linear-gradient(135deg,#111FA2,#5478FF); border: 2px solid #5478FF;"
          >
            {{ t('static_ad_close') }}
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useUserStore } from '../stores/index'
import { useI18n } from 'vue-i18n'
import { useSoundControl } from '../composables/useSoundControl'
import { useChatSoundControl } from '../composables/useChatSoundControl'

const props = defineProps<{ isVisible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const userStore = useUserStore()
const { t } = useI18n()
const { disableSound, enableSound } = useSoundControl()
const { disableChatSound, enableChatSound } = useChatSoundControl()

const countdown = ref(10)
const totalTime = 10
let countdownInterval: number | null = null

const closeModal = () => {
  stopCountdown()
  userStore.clearIin()
  emit('close')
}

const startCountdown = () => {
  countdown.value = 10
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      userStore.clearIin()
      localStorage.removeItem('iin')
      sessionStorage.removeItem('iin')
      userStore.$patch({ iin: '' })
      disableSound()
      disableChatSound()
      setTimeout(() => { enableSound(); enableChatSound() }, 100)
      stopCountdown()
      emit('close')
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null }
}

watch(() => props.isVisible, (visible) => {
  if (visible) startCountdown(); else stopCountdown()
}, { immediate: true })

onUnmounted(() => { stopCountdown() })
</script>
