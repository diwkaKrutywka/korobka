<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useInactivityTimer } from '@/composables/useInactivityTimer'
import { useSoundControl } from '@/composables/useSoundControl'

const { locale } = useI18n()
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

watch(() => appStore.lang, (l) => { locale.value = l })
watch(() => appStore.theme, (t) => {
  const app = document.getElementById('app')
  if (app) app.classList.toggle('dark', t === 'dark')
}, { immediate: true })

// Inactivity modal — skip on home screen "/"
const showInactivity = ref(false)
const countdown = ref(5)
let redirectTimer: number | null = null
let countdownInterval: number | null = null

const { isInactive, resetTimer } = useInactivityTimer(30000)
const { enableSound } = useSoundControl()

watch(isInactive, (inactive) => {
  if (!inactive) return
  if (route.path === '/') return
  showInactivity.value = true
  countdown.value = 5
  countdownInterval = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval!); countdownInterval = null
    }
  }, 1000)
  redirectTimer = window.setTimeout(() => {
    dismiss()
    enableSound()
    router.replace('/')
  }, 5000)
})

function dismiss() {
  showInactivity.value = false
  if (redirectTimer) { clearTimeout(redirectTimer); redirectTimer = null }
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null }
  resetTimer()
}

onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<template>
  <RouterView />

  <!-- Inactivity modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showInactivity"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(15,30,26,0.55);">
        <div class="inactivity-card bg-white rounded-2xl p-6 w-full max-w-[300px] text-center"
          style="box-shadow:0 8px 32px rgba(0,0,0,0.18);">
          <!-- Circular countdown -->
          <div class="flex items-center justify-center mb-3">
            <svg class="inactivity-svg" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#E8EBFF" stroke-width="6"/>
              <circle cx="36" cy="36" r="30" fill="none" stroke="#111FA2" stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="`${2 * Math.PI * 30}`"
                :stroke-dashoffset="`${2 * Math.PI * 30 * (1 - countdown / 5)}`"
                transform="rotate(-90 36 36)"
                style="transition: stroke-dashoffset 1s linear;"/>
              <text x="36" y="42" text-anchor="middle" font-size="22" font-weight="800" fill="#111FA2">{{ countdown }}</text>
            </svg>
          </div>
          <div class="inactivity-title font-extrabold text-base mb-1" style="color:#111827">Вы здесь?</div>
          <div class="inactivity-sub text-sm mb-5" style="color:#6b7280">Сессия завершится через {{ countdown }} сек</div>
          <button
            @click="dismiss"
            class="inactivity-btn w-full py-3 rounded-2xl text-sm font-extrabold text-white border-none cursor-pointer"
            style="background:linear-gradient(135deg,#111FA2,#5478FF);">
            Да, я здесь
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.inactivity-svg { width: 72px; height: 72px; }

@media (min-height: 1600px) {
  .inactivity-card  { max-width: 560px !important; padding: 48px !important; border-radius: 32px !important; }
  .inactivity-svg   { width: 160px; height: 160px; }
  .inactivity-title { font-size: 2rem; margin-bottom: 12px; }
  .inactivity-sub   { font-size: 1.4rem; margin-bottom: 36px; }
  .inactivity-btn   { padding: 28px 0 !important; font-size: 1.6rem; border-radius: 20px !important; }
}
</style>
