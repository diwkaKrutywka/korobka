<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBookingStore } from '@/stores/booking'
import { useUserStore } from '@/stores/index'
import AppAvatar from '@/components/shared/AppAvatar.vue'
import AppStatusBar from '@/components/shared/AppStatusBar.vue'
import { useThermalPrint } from '@/composables/useThermalPrint'

const TOTAL_SECS = 10
// SVG countdown ring — r=38 inside the 96×96 badge
const RADIUS        = 38
const CIRCUMFERENCE = 2 * Math.PI * RADIUS   // ≈ 238.8

const router    = useRouter()
const { t, locale } = useI18n()
const booking   = useBookingStore()
const userStore = useUserStore()
const { printStatus, printError, printTicket } = useThermalPrint()

const countdown = ref(TOTAL_SECS)
let timer: ReturnType<typeof setInterval> | null = null

// stroke-dashoffset: 0 = full ring, CIRCUMFERENCE = empty
const dashOffset = computed(() =>
  CIRCUMFERENCE * (1 - countdown.value / TOTAL_SECS),
)

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

const ticketData = computed(() => ({
  patientName:     patientName.value,
  iin:             userStore.iin || booking.iin || undefined,
  doctorName:      booking.specialistName || '—',
  serviceName:     booking.serviceName || '—',
  appointmentTime: booking.appointmentTime || null,
  cabinet:         booking.cabinet || undefined,
  appointmentId:   booking.appointmentId,
  locale:          locale.value,
}))

function close() {
  if (timer) { clearInterval(timer); timer = null }
  booking.reset()
  router.push('/')
}

onMounted(() => {
  printTicket(ticketData.value)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) close()
  }, 1000)
})

onUnmounted(() => {
  if (timer) { clearInterval(timer); timer = null }
})
</script>

<template>
  <!-- ── Full-screen modal overlay ───────────────────────────────────────── -->
  <div class="success-overlay">

    <!-- Status bar (top) -->
    <AppStatusBar />

    <!-- Avatar glows in top-right — positioned absolute inside this container -->
    <AppAvatar :mini="true" />

    <!-- Frosted backdrop -->
    <div class="success-backdrop" />

    <!-- Scrollable card area -->
    <div class="success-scroll">
      <div class="success-card animate-fade-in">

        <!-- ── Badge: gradient circle + countdown ring ─────────────────── -->
        <div class="success-badge">
          <svg viewBox="0 0 96 96" class="badge-svg fhd:w-[140px] fhd:h-[140px]">
            <defs>
              <linearGradient id="badgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#111FA2"/>
                <stop offset="100%" stop-color="#5478FF"/>
              </linearGradient>
            </defs>
            <!-- Gradient fill circle -->
            <circle cx="48" cy="48" r="48" fill="url(#badgeBg)"/>
            <!-- Ring track -->
            <circle cx="48" cy="48" :r="RADIUS" fill="none"
              stroke="rgba(255,255,255,0.22)" stroke-width="4.5"/>
            <!-- Progress ring (white, depletes as countdown goes) -->
            <circle cx="48" cy="48" :r="RADIUS" fill="none"
              stroke="white" stroke-width="4.5"
              stroke-linecap="round"
              :stroke-dasharray="CIRCUMFERENCE"
              :stroke-dashoffset="dashOffset"
              style="transform:rotate(-90deg);transform-origin:center;
                     transition:stroke-dashoffset 0.9s linear;"/>
          </svg>
          <!-- Centred checkmark + number -->
          <div class="badge-inner">
       
            <span class="badge-num">{{ countdown }}</span>
          </div>
        </div>

        <div class="success-title">{{ t('booking.success') }}</div>
        <div class="success-sub">{{ t('booking.successSub') }}</div>

        <!-- ── Booking details ───────────────────────────────────────────── -->
        <div v-if="booking.serviceName" class="success-details">
          <div class="details-heading">{{ t('booking.confirm') }}</div>
          <div
            v-for="[label, val] in ([
              [t('booking.doctor'),   booking.specialistName],
              [t('booking.service'),  booking.serviceName],
              [t('booking.datetime'), formattedDatetime],
              booking.cabinet ? [t('booking.cabinet'), booking.cabinet] : null,
              [t('booking.patient'),  patientName],
            ] as [string,string][]).filter(Boolean)"
            :key="label"
            class="detail-row"
          >
            <div class="detail-label">{{ label }}</div>
            <div class="detail-value">{{ val }}</div>
          </div>
        </div>

        <!-- ── Print status ──────────────────────────────────────────────── -->
        <div class="print-status-wrap">
          <div v-if="printStatus === 'loading'" class="print-pill print-pill--loading">
            <span class="spin-ring" />
            {{ t('booking.printing') }}
          </div>
          <div v-else-if="printStatus === 'success'" class="print-pill print-pill--ok">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            {{ t('booking.printed') }}
          </div>
          <div v-else-if="printStatus === 'error'" class="print-pill print-pill--err">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <div class="font-bold">{{ t('booking.printErrorTitle') }}</div>
              <div class="text-xs fhd:text-base mt-0.5">{{ printError }}</div>
            </div>
          </div>
        </div>

        <!-- ── Buttons ──────────────────────────────────────────────────── -->
        <div class="btn-group">
          <button
            v-if="printStatus === 'error' || printStatus === 'success'"
            class="btn btn--outline"
            @click="printTicket(ticketData)">
            {{ t('booking.printAgain') }}
          </button>
          <button class="btn btn--primary" @click="close">
            {{ t('nav.home') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Overlay ──────────────────────────────────────────────────────────────── */
.success-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  /* transparent top — lets the avatar "float" over a clean background */
  background: transparent;
}

/* Dark frosted-glass backdrop — darkens & blurs whatever is behind */
.success-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(117, 117, 117, 0.911) ;
  backdrop-filter: blur(22px);
  opacity: 0.95;
  -webkit-backdrop-filter: blur(22px);
  z-index: 0;
}

/* Scrollable area that sits on top of the backdrop */
.success-scroll {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 3vw, 40px) clamp(12px, 3vw, 32px);
  /* push down to leave space for the avatar in the top-right */
  padding-top: clamp(80px, 10vh, 140px);
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
.success-card {
  width: 100%;
  max-width: clamp(340px, 50vw, 620px);
  background: #ffffff;
  border-radius: clamp(20px, 2.5vw, 36px);
  border: 1px solid #e4e6f8;
  box-shadow: 0 24px 72px rgba(17, 31, 162, 0.13), 0 4px 16px rgba(84, 120, 255, 0.08);
  padding: clamp(24px, 3vw, 48px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: clamp(12px, 1.5vh, 20px);
}

@media (min-height: 1600px) {
  .success-card { max-width: 900px; padding: 64px; gap: 28px; }
}

/* ── Badge (gradient circle + countdown ring) ─────────────────────────────── */
.success-badge {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(88px, 10vw, 116px);
  height: clamp(88px, 10vw, 116px);
  border-radius: 50%;
  box-shadow: 0 12px 32px rgba(84, 120, 255, 0.45);
}

.badge-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.badge-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.badge-num {
  font-size: clamp(0.75rem, 0.85vw, 1rem);
  font-weight: 900;
  color: white;
  line-height: 1;
}

.success-title {
  font-size: clamp(1.6rem, 2.2vw + 0.5vh, 2.6rem);
  font-weight: 900;
  color: #111FA2;
  line-height: 1.1;
}

.success-sub {
  font-size: clamp(0.9rem, 1vw + 0.3vh, 1.4rem);
  color: #6b7280;
  margin-top: -4px;
}


/* ── Details ──────────────────────────────────────────────────────────────── */
.success-details {
  width: 100%;
  background: #F8F9FF;
  border: 1px solid #e4e6f8;
  border-radius: clamp(14px, 1.6vw, 22px);
  padding: clamp(14px, 1.8vw, 28px);
  text-align: left;
  box-shadow: 0 2px 12px rgba(17, 31, 162, 0.06);
}

.details-heading {
  font-size: clamp(0.65rem, 0.7vw, 0.85rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #5478FF;
  margin-bottom: clamp(10px, 1.2vw, 18px);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: clamp(8px, 1vw, 14px);
  padding: clamp(8px, 0.9vw, 14px) 0;
  border-bottom: 1px solid #e4e6f8;
}
.detail-row:last-child { border-bottom: none; }

.detail-label {
  font-size: clamp(0.65rem, 0.7vw, 0.85rem);
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.detail-value {
  font-size: clamp(0.8rem, 0.9vw + 0.2vh, 1.1rem);
  font-weight: 700;
  color: #0d1240;
  margin-top: 2px;
}

/* ── Print status ─────────────────────────────────────────────────────────── */
.print-status-wrap { width: 100%; }

.print-pill {
  display: flex;
  align-items: center;
  gap: clamp(6px, 0.8vw, 10px);
  justify-content: center;
  padding: clamp(10px, 1.2vw, 18px) clamp(14px, 1.5vw, 22px);
  border-radius: clamp(10px, 1.2vw, 16px);
  font-size: clamp(0.8rem, 0.85vw, 1.05rem);
  font-weight: 600;
}
.print-pill--loading { background: #EEF1FF; color: #5478FF; }
.print-pill--ok      { background: #EDFBF0; color: #1a7f3c; }
.print-pill--err     { background: #FEF2F2; color: #dc2626; border: 1px solid #fecaca; }

.spin-ring {
  width: clamp(14px, 1.2vw, 18px);
  height: clamp(14px, 1.2vw, 18px);
  border-radius: 50%;
  border: 2px solid rgba(84, 120, 255, 0.3);
  border-top-color: #5478FF;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Buttons ──────────────────────────────────────────────────────────────── */
.btn-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1vw, 12px);
  margin-top: clamp(4px, 0.5vh, 8px);
}

.btn {
  width: 100%;
  min-height: clamp(44px, 5vh, 64px);
  border-radius: clamp(12px, 1.4vw, 20px);
  font-size: clamp(0.85rem, 0.95vw + 0.2vh, 1.2rem);
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
}
.btn:hover { opacity: 0.9; }

.btn--primary {
  background: linear-gradient(135deg, #111FA2, #5478FF);
  color: #fff;
  box-shadow: 0 4px 16px rgba(84, 120, 255, 0.3);
}
.btn--outline {
  background: #fff;
  color: #111FA2;
  border: 1.5px solid #c7d0f8;
}

@media (min-height: 1600px) {
  .btn { min-height: 80px; font-size: 1.5rem; border-radius: 24px; }
  .countdown-num { font-size: 1.6rem; }
  .details-heading { font-size: 1rem; }
  .detail-label  { font-size: 0.9rem; }
  .detail-value  { font-size: 1.3rem; }
}

/* ── Fade-in animation ────────────────────────────────────────────────────── */
.animate-fade-in {
  animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}
</style>
