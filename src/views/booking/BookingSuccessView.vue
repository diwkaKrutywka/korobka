<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBookingStore } from '@/stores/booking'
import { useUserStore } from '@/stores/index'
import { useAppStore } from '@/stores/app'
import PageShell from '@/components/shared/PageShell.vue'

const BASE_URL = 'https://bream-crisp-strongly.ngrok-free.app/api/v1'
const TENANT_ID = '00000000-0000-4000-a000-000000000001'
const LANG_MAP: Record<string, string> = { ru: 'ru', kz: 'kk' }

const router = useRouter()
const { t } = useI18n()
const booking = useBookingStore()
const userStore = useUserStore()
const appStore = useAppStore()

const apiHeaders = () => ({
  'accept': 'application/json',
  'X-Tenant-ID': TENANT_ID,
  'X-Service-Binding-Alias': 'terminal',
  'Accept-Language': LANG_MAP[appStore.lang] ?? 'ru',
  'ngrok-skip-browser-warning': 'true',
})

const patientName = computed(() => {
  const u = userStore.user
  if (!u) return userStore.iin || booking.iin || '—'
  return u.full_name || u.fio || u.name || userStore.iin || '—'
})

const formattedDatetime = computed(() => {
  if (!booking.appointmentTime) return '—'
  const d = new Date(booking.appointmentTime)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long' }) + ' · ' +
    d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
})

type PrintStatus = 'idle' | 'loading' | 'success' | 'error'
const printStatus = ref<PrintStatus>('idle')
const printError = ref('')

async function printTicket() {
  if (printStatus.value === 'loading' || !booking.appointmentId) return
  printStatus.value = 'loading'
  printError.value = ''
  try {
    const res = await fetch(
      `${BASE_URL}/appointments/${booking.appointmentId}/print`,
      { method: 'POST', headers: apiHeaders() },
    )
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      printError.value = err?.error?.message || err?.message || t('booking.printError')
      printStatus.value = 'error'
      return
    }
    printStatus.value = 'success'
  } catch {
    printError.value = t('booking.printError')
    printStatus.value = 'error'
  }
}

onMounted(() => {
  printTicket()
})

function goHome() {
  booking.reset()
  router.push('/home')
}
</script>

<template>
  <PageShell :show-back="false" :show-home="true" bg="#ffffff">
    <div class="animate-fade-in flex flex-col items-center justify-center px-8 fhd:px-16 py-10 fhd:py-16 text-center max-w-lg fhd:max-w-3xl mx-auto">
      <!-- Success icon -->
      <div class="w-24 h-24 fhd:w-40 fhd:h-40 rounded-3xl fhd:rounded-4xl flex items-center justify-center mb-6 fhd:mb-10"
        style="background: linear-gradient(135deg,#111FA2,#5478FF); box-shadow: 0 12px 32px rgba(84,120,255,0.35);">
        <svg width="48" height="48" class="fhd:w-20 fhd:h-20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>

      <div class="text-3xl fhd:text-5xl font-extrabold" style="color:#111FA2">{{ t('booking.success') }}</div>
      <div class="text-gray-500 text-base fhd:text-2xl mt-2 fhd:mt-4">{{ t('booking.successSub') }}</div>

      <!-- Booking details card -->
      <div v-if="booking.serviceName"
        class="mt-8 fhd:mt-12 w-full rounded-2xl fhd:rounded-3xl p-6 fhd:p-10 text-left border"
        style="background:#F8F9FF; border-color:#e4e6f8; box-shadow: 0 4px 20px rgba(17,31,162,0.07);">
        <div class="text-xs fhd:text-lg font-bold uppercase tracking-widest mb-4 fhd:mb-6" style="color:#5478FF">
          {{ t('booking.confirm') }}
        </div>

        <div
          v-for="[label, val] in [
            [t('booking.appointment'), `${booking.specialistName} (${booking.serviceName})`],
            [t('booking.patient'), patientName],
            [t('booking.datetime'), formattedDatetime],
          ]"
          :key="label"
          class="flex items-start gap-3 py-3 fhd:py-5 border-b last:border-b-0"
          style="border-color:#e4e6f8;"
        >
          <div class="flex-1">
            <div class="text-xs fhd:text-base text-gray-400 uppercase tracking-wide">{{ label }}</div>
            <div class="text-sm fhd:text-xl font-bold mt-0.5 fhd:mt-1" style="color:#0d1240">{{ val }}</div>
          </div>
        </div>
      </div>

      <!-- Print status -->
      <div class="mt-5 fhd:mt-8 w-full">
        <div v-if="printStatus === 'loading'"
          class="flex items-center justify-center gap-2 py-3 fhd:py-5 rounded-xl fhd:rounded-2xl text-sm fhd:text-xl font-semibold"
          style="background:#EEF1FF; color:#5478FF;">
          <div class="w-4 h-4 fhd:w-7 fhd:h-7 rounded-full border-2 border-[#5478FF] border-t-transparent animate-spin flex-shrink-0" />
          {{ t('booking.printing') }}
        </div>

        <div v-else-if="printStatus === 'success'"
          class="flex items-center justify-center gap-2 py-3 fhd:py-5 rounded-xl fhd:rounded-2xl text-sm fhd:text-xl font-semibold"
          style="background:#EDFBF0; color:#1a7f3c;">
          <svg width="18" height="18" class="fhd:w-7 fhd:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          {{ t('booking.printed') }}
        </div>

        <div v-else-if="printStatus === 'error'"
          class="rounded-xl fhd:rounded-2xl text-sm fhd:text-xl overflow-hidden"
          style="background:#FEF2F2; border:1px solid #fecaca;">
          <div class="flex items-start gap-2 px-4 fhd:px-7 py-3 fhd:py-5">
            <svg class="flex-shrink-0 mt-0.5 fhd:w-7 fhd:h-7" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div class="text-left flex-1">
              <div class="font-bold fhd:text-xl" style="color:#dc2626">{{ t('booking.printErrorTitle') }}</div>
              <div class="text-xs fhd:text-lg mt-0.5" style="color:#b91c1c">{{ printError }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3 fhd:gap-5 mt-5 fhd:mt-8 w-full">
        <button
          v-if="printStatus === 'error' || printStatus === 'success'"
          @click="printTicket"
          class="kb flex-1 py-4 fhd:py-7 rounded-2xl fhd:rounded-3xl text-sm fhd:text-2xl font-extrabold border cursor-pointer"
          style="background:#ffffff; color:#111FA2; border-color:#c7d0f8;">
          {{ t('booking.printAgain') }}
        </button>

        <button @click="goHome"
          class="kb flex-1 py-4 fhd:py-7 rounded-2xl fhd:rounded-3xl text-sm fhd:text-2xl font-extrabold text-white border-none cursor-pointer"
          style="background: linear-gradient(135deg,#111FA2,#5478FF); box-shadow: 0 4px 16px rgba(84,120,255,0.3);">
          {{ t('nav.home') }}
        </button>
      </div>
    </div>
  </PageShell>
</template>
