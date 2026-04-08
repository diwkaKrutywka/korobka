<template>
  <div class="auth-page">

  <PageShell :header-bg="'#ffffff'" :footer-bg="'#ffffff'" >

    <main class="auth-main">
      <div class="auth-container animate-fade-in">
        <h1 class="auth-title">{{ $t('auth.title') }}</h1>
        <p class="auth-desc">{{ $t('auth.description') }}</p>

        <!-- IIN Input -->
        <div class="auth-input-wrap">
          <input
            v-model="iin"
            type="text"
            class="auth-input"
            :class="{ 'auth-input--error': iinError }"
            readonly
            placeholder="____________"
          />
          <div v-if="iinError" class="auth-error">{{ iinError }}</div>
        </div>

        <!-- Numpad -->
        <div class="numpad">
          <button
            v-for="n in numbers"
            :key="n"
            class="numpad__key"
            @click="addDigit(n)"
          >
            {{ n }}
          </button>

          <button class="numpad__key numpad__key--action" @click="backspace">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="22" height="22">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
            </svg>
          </button>

          <button class="numpad__key" @click="addDigit('0')">0</button>

          <button class="numpad__key numpad__key--confirm" @click="authorize">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="22" height="22">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </button>
        </div>

        <!-- Consent Checkbox -->
        <label class="consent-label">
          <input
            v-model="consentChecked"
            type="checkbox"
            class="consent-checkbox"
            @change="consentError = ''"
          />
          <span class="consent-text">{{ $t('auth.consentLabel') }}</span>
        </label>
        <div v-if="consentError" class="auth-error consent-err">{{ consentError }}</div>

        <!-- Authorize Button -->
        <button class="auth-btn" @click="authorize">
          {{ $t('auth.button') }}
        </button>

        <p class="auth-privacy">{{ $t('auth.privacy') }}</p>
      </div>
    </main>
</PageShell>  
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/index'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageVideo } from '@/composables/usePageVideo'
import FooterNav from '@/components/FooterNav.vue'
import PageShell from '@/components/shared/PageShell.vue'

const { t: $t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const { videoSrc } = usePageVideo()

const now = ref(new Date())
let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 30000) })
onUnmounted(() => clearInterval(timer))

const localeCode = computed(() => locale.value === 'kk' ? 'kk-KZ' : 'ru-RU')
const currentTime = computed(() =>
  now.value.toLocaleTimeString(localeCode.value, { hour: '2-digit', minute: '2-digit' })
)
const currentDate = computed(() =>
  now.value.toLocaleDateString(localeCode.value, { day: '2-digit', month: '2-digit' })
)

const iin = ref('')
const iinError = ref('')
const consentChecked = ref(false)
const consentError = ref('')
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

const addDigit = (digit: string) => {
  if (iin.value.length < 12) {
    iin.value += digit
    if (iinError.value) iinError.value = ''
  }
}

const backspace = () => {
  iin.value = iin.value.slice(0, -1)
  if (iinError.value) iinError.value = ''
}

const validateIin = () => {
  if (iin.value.length === 0) {
    iinError.value = $t('auth.errorEmpty')
    return false
  } else if (iin.value.length < 12) {
    iinError.value = $t('auth.errorShort')
    return false
  } else if (iin.value.length > 12) {
    iinError.value = $t('auth.errorLong')
    return false
  } else if (!/^\d{12}$/.test(iin.value)) {
    iinError.value = $t('auth.errorInvalid')
    return false
  }
  return true
}

const authorize = () => {
  if (!validateIin()) return
  if (!consentChecked.value) {
    consentError.value = $t('auth.errorConsent')
    return
  }
  userStore.setIin(iin.value)
  router.push('/departments')
}
</script>

<style scoped>
.auth-page {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
}

.page-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 72px;
  background: #ffffff;
  border-bottom: 1.5px solid #e2e8f0;
  box-shadow: 0 1px 8px rgba(21, 101, 192, 0.06);
}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-time {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1565C0;
  line-height: 1.1;
}

.header-date {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64B0E8;
}

.header-video-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(59, 130, 246, 0.35);
  box-shadow: 0 0 8px 2px rgba(59, 130, 246, 0.18);
  flex-shrink: 0;
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 3vw, 50px) clamp(20px, 3vw, 50px);
  overflow-y: auto;
}

.auth-container {
  width: 100%;
  max-width: clamp(700px, 65vw, 1200px);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
}

.auth-title {
  font-size: clamp(3.2rem, 5.5vw, 7rem);
  font-weight: 900;
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: clamp(12px, 1.2vw, 28px);
}

.auth-desc {
  font-size: clamp(1.6rem, 3vw, 4rem);
  font-weight: 500;
  color: #64748b;
  text-align: center;
  line-height: 1.5;
  margin-bottom: clamp(28px, 3.5vw, 60px);
}

/* IIN Input */
.auth-input-wrap {
  width: 100%;
  margin-bottom: clamp(22px, 3vw, 50px);
}

.auth-input {
  width: 100%;
  text-align: center;
  font-size: clamp(2.5rem, 5vw, 7rem);
  font-weight: 800;
  letter-spacing: 0.18em;
  padding: clamp(16px, 3.5vw, 56px) clamp(24px, 6vw, 88px);
  border-radius: clamp(16px, 2.5vw, 40px);
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  color: #0D2E5A;
  box-shadow: 0 2px 8px rgba(37,99,235,0.06);
  outline: none;
  transition: all 0.3s ease;
}

.auth-input::placeholder {
  color: #cbd5e1;
  letter-spacing: 0.3em;
  font-weight: 400;
}

.auth-input:focus {
  border-color: rgba(37,99,235,0.4);
  box-shadow: 0 2px 8px rgba(37,99,235,0.06), 0 0 0 3px rgba(59,130,246,0.12);
}

.auth-input--error {
  border-color: rgba(239,68,68,0.5) !important;
  box-shadow: 0 2px 8px rgba(239,68,68,0.08), 0 0 0 3px rgba(239,68,68,0.1) !important;
}

.auth-error {
  color: #ef4444;
  font-size: clamp(1.1rem, 2vw, 2.4rem);
  font-weight: 500;
  text-align: center;
  margin-top: clamp(8px, 1vw, 18px);
}

/* Numpad */
.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(14px, 2.5vw, 36px);
  width: 100%;
  margin-bottom: clamp(22px, 3.5vw, 56px);
}

.numpad__key {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(28px, 5.5vw, 76px) 0;
  border-radius: clamp(14px, 2.5vw, 36px);
  font-size: clamp(2rem, 4vw, 5.5rem);
  font-weight: 700;
  color: #0D2E5A;
  background: #f1f5f9;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(37,99,235,0.06);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
}

.numpad__key svg {
  width: clamp(28px, 3.5vw, 56px);
  height: clamp(28px, 3.5vw, 56px);
}

.numpad__key:hover {
  background: #e8f0fe;
  border-color: rgba(59,130,246,0.3);
  transform: translateY(-1px);
}

.numpad__key:active {
  transform: scale(0.96);
  background: rgba(59,130,246,0.15);
  border-color: rgba(37,99,235,0.3);
}

.numpad__key--action {
  color: #64748b;
}

.numpad__key--action:active {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.25);
  color: #ef4444;
}

.numpad__key--confirm {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
}

.numpad__key--confirm:hover {
  background: linear-gradient(135deg, #60a5fa 0%, #3B82F6 100%);
  box-shadow: 0 6px 16px rgba(37,99,235,0.4);
}

.numpad__key--confirm:active {
  background: linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%);
  box-shadow: 0 2px 8px rgba(37,99,235,0.4);
}

/* Authorize Button */
.auth-btn {
  padding: clamp(24px, 4.5vw, 68px) clamp(72px, 12vw, 180px);
  border-radius: clamp(40px, 5vw, 80px);
  font-size: clamp(1.8rem, 3.5vw, 4.5rem);
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(37,99,235,0.35), 0 1px 4px rgba(37,99,235,0.2);
  transition: all 0.2s ease;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  -webkit-tap-highlight-color: transparent;
}

.auth-btn:hover {
  box-shadow: 0 6px 24px rgba(37,99,235,0.45);
  transform: translateY(-1px);
}

.auth-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(37,99,235,0.4);
}

/* Consent */
.consent-label {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(12px, 2vw, 30px);
  cursor: pointer;
  margin-bottom: clamp(4px, 0.6vw, 10px);
  width: 100%;
}

.consent-checkbox {
  flex-shrink: 0;
  width: clamp(28px, 4vw, 60px);
  height: clamp(28px, 4vw, 60px);
  margin-top: 2px;
  accent-color: #2563EB;
  cursor: pointer;
}

.consent-text {
  font-size: clamp(1.2rem, 2.5vw, 3rem);
  color: #475569;
  line-height: 1.5;
}

.consent-err {
  margin-bottom: clamp(6px, 0.8vw, 14px);
}

/* Privacy */
.auth-privacy {
  font-size: clamp(1rem, 1.8vw, 2.2rem);
  color: #94a3b8;
  text-align: center;
  line-height: 1.5;
  margin-top: clamp(18px, 2vw, 40px);
}

@media (min-width: 1000px) and (min-height: 1600px) {
  .auth-container { max-width: 880px; }
  .auth-title { font-size: 2.6rem; }
  .auth-desc { font-size: 1.25rem; margin-bottom: 36px; }
  .auth-input { font-size: 2.4rem; padding: 22px 32px; border-radius: 22px; }
  .numpad { gap: 16px; margin-bottom: 32px; }
  .numpad__key { padding: 28px 0; font-size: 1.7rem; border-radius: 20px; }
  .auth-btn { padding: 34px 90px; font-size: 1.4rem; border-radius: 54px; margin: 20px 0; }
  .consent-text { font-size: 1.25rem; }
  .consent-checkbox { width: 28px; height: 28px; }
  .auth-privacy { font-size: 1.25rem; margin-top: 28px; }
  .auth-error { font-size: 1.05rem; }
}

@media (min-width: 2560px) {
  .auth-title { font-size: 2.2rem; }
  .auth-desc { font-size: 1.15rem; }
  .auth-input { font-size: 2rem; padding: 22px 28px; }
  .numpad__key { padding: 22px 0; font-size: 1.5rem; }
  .auth-btn { padding: 24px 40px; font-size: 1.3rem; }
  .auth-privacy { font-size: 0.85rem; }
}

@media (min-width: 3840px) {
  .auth-container { max-width: 560px; }
  .auth-title { font-size: 2.8rem; }
  .auth-desc { font-size: 1.4rem; }
  .auth-input { font-size: 2.4rem; padding: 28px 36px; }
  .numpad__key { padding: 28px 0; font-size: 1.8rem; }
  .auth-btn { padding: 30px 48px; font-size: 1.55rem; }
  .auth-privacy { font-size: 1rem; }
}
</style>
