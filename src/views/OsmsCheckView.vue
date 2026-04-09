<template>
  <div class="auth-page">

  <PageShell :header-bg="'#ffffff'" :footer-bg="'#ffffff'" :show-back="true" :show-home="true">

    <main class="auth-main">
      <div class="auth-container animate-fade-in">

        <!-- Form -->
        <template v-if="!status">
          <h1 class="auth-title">{{ $t('osms.checkOsms') }}</h1>
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="42" height="42">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
              </svg>
            </button>

            <button class="numpad__key" @click="addDigit('0')">0</button>

            <button class="numpad__key numpad__key--confirm" @click="check">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="42" height="42">
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

          <!-- Check Button -->
          <button class="auth-btn" :disabled="loading" @click="check">
            <span v-if="loading" class="btn-loading">
              <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/>
              </svg>
              {{ $t('osms.checking') }}
            </span>
            <span v-else>{{ $t('osms.checkStatus') }}</span>
          </button>
        </template>

        <!-- Result: Insured -->
        <template v-else-if="status === 'insured'">
          <div class="result-card result-card--ok">
            <div class="result-icon result-icon--ok">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div class="result-title" style="color:#111FA2">{{ $t('osms.insured') }}</div>
            <div class="result-sub" style="color:#4a55a2">{{ $t('osms.insuredSub') }}</div>
            <div class="result-actions">
              <button class="res-btn res-btn--ghost" @click="router.back()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                {{ $t('back_button') }}
              </button>
              <button class="res-btn res-btn--primary" @click="router.push('/')">{{ $t('home_button') }}</button>
            </div>
          </div>
        </template>

        <!-- Result: Not insured -->
        <template v-else-if="status === 'not_insured'">
          <div class="result-card result-card--no">
            <div class="result-icon result-icon--no">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </div>
            <div class="result-title" style="color:#D94848">{{ $t('osms.notInsured') }}</div>
            <div class="result-sub" style="color:#D94848; opacity:.7">{{ $t('osms.notInsuredSub') }}</div>
            <div class="result-actions">
              <button class="res-btn res-btn--ghost" @click="router.back()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                {{ $t('back_button') }}
              </button>
              <button class="res-btn res-btn--danger" @click="router.push('/')">{{ $t('home_button') }}</button>
            </div>
          </div>
        </template>

      </div>
    </main>
</PageShell>  
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import PageShell from '@/components/shared/PageShell.vue'

const { t: $t } = useI18n()
const router = useRouter()

const iin = ref('')
const iinError = ref('')
const consentChecked = ref(false)
const consentError = ref('')
const loading = ref(false)
const status = ref<null | 'insured' | 'not_insured'>(null)
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

const check = async () => {
  if (iin.value.length === 0) {
    iinError.value = $t('auth.errorEmpty')
    return
  }
  if (iin.value.length < 12) {
    iinError.value = $t('auth.errorShort')
    return
  }
  if (!/^\d{12}$/.test(iin.value)) {
    iinError.value = $t('auth.errorInvalid')
    return
  }

  if (!consentChecked.value) {
    consentError.value = $t('auth.errorConsent')
    return
  }

  loading.value = true
  iinError.value = ''

  try {
    const body = new URLSearchParams({ iin: iin.value })
    const res = await fetch('https://proxy.medcontact.kz/insurance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    const data = await res.json()

    if (data.errorData) {
      if (data.errorData.error === '400') {
        iinError.value = $t('osms.errorIin')
      } else if (data.errorData.error === '500') {
        iinError.value = $t('osms.errorNotFound')
      } else {
        iinError.value = $t('osms.errorService')
      }
    } else if (data.insuredData) {
      status.value = data.insuredData.statusDescriptionRu === 'Застрахован' ? 'insured' : 'not_insured'
    } else {
      iinError.value = $t('osms.errorService')
    }
  } catch {
    iinError.value = $t('osms.errorService')
  } finally {
    loading.value = false
  }
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
  padding: 90px 20px 80px;
  overflow-y: auto;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
}

.auth-title {
  font-size: 1.6rem;
  font-weight: 900;
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 8px;
}

.auth-desc {
  font-size: 0.88rem;
  font-weight: 500;
  color: #64748b;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 24px;
}

/* IIN Input */
.auth-input-wrap {
  width: 100%;
  margin-bottom: 20px;
}

.auth-input {
  width: 100%;
  text-align: center;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  padding: 10px 20px;
  border-radius: 16px;
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
  font-size: 0.78rem;
  font-weight: 500;
  text-align: center;
  margin-top: 10px;
}

/* Numpad */
.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
}

.numpad__key {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  border-radius: 14px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0D2E5A;
  background: #f1f5f9;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(37,99,235,0.06);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
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
  
  padding: 14px 72px;
  border-radius: 34px;
  font-size: 1rem;
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
  gap: 10px;
  cursor: pointer;
  margin-bottom: 4px;
  width: 100%;
}

.consent-checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  accent-color: #2563EB;
  cursor: pointer;
}

.consent-text {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.5;
}

.consent-err {
  margin-bottom: 8px;
}

/* Privacy */
.auth-privacy {
  font-size: 0.68rem;
  color: #94a3b8;
  text-align: center;
  line-height: 1.5;
  margin-top: 16px;
}

/* Result cards */
.result-card {
  width: 100%;
  border-radius: 24px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1.5px solid transparent;
}

.result-card--ok {
  background: #E8EBFF;
  border-color: rgba(84,120,255,.3);
}

.result-card--no {
  background: #FDF0F0;
  border-color: rgba(217,72,72,.2);
}

.result-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.result-icon--ok {
  background: linear-gradient(135deg, #111FA2, #5478FF);
}

.result-icon--no {
  background: #D94848;
}

.result-title {
  font-size: 1.4rem;
  font-weight: 900;
  margin-bottom: 6px;
}

.result-sub {
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.5;
}

.auth-btn--outline {
  background: transparent !important;
  color: #2563EB !important;
  border: 1.5px solid rgba(37,99,235,0.35) !important;
  box-shadow: none !important;
}

.result-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.res-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.18s ease;
  -webkit-tap-highlight-color: transparent;
}

.res-btn--ghost {
  background: rgba(37,99,235,0.08);
  color: #2563EB;
}

.res-btn--ghost:hover {
  background: rgba(37,99,235,0.15);
}

.res-btn--ghost:active {
  transform: scale(0.96);
}

.res-btn--primary {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: #fff;
  box-shadow: 0 3px 10px rgba(37,99,235,0.3);
}

.res-btn--primary:hover {
  box-shadow: 0 5px 14px rgba(37,99,235,0.4);
}

.res-btn--primary:active {
  transform: scale(0.96);
}

.res-btn--danger {
  background: rgba(217,72,72,0.1);
  color: #D94848;
}

.res-btn--danger:hover {
  background: rgba(217,72,72,0.18);
}

.res-btn--danger:active {
  transform: scale(0.96);
}

.auth-btn--red {
  background: #FDF0F0 !important;
  color: #D94848 !important;
  border: 1.5px solid rgba(217,72,72,.3) !important;
  box-shadow: none !important;
}

/* Loading spinner */
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Kiosk 1080×1920 */
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
