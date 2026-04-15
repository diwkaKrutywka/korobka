<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBookingStore } from '@/stores/booking'
import { useUserStore } from '@/stores/index'
import { useAppStore } from '@/stores/app'
import PageShell from '@/components/shared/PageShell.vue'

const BASE_URL = import.meta.env.VITE_BOOKING_API_URL
const TENANT_ID = import.meta.env.VITE_TENANT_ID

interface Service { service_id: string; service_name: string }

const router = useRouter()
const { t } = useI18n()
const booking = useBookingStore()
const userStore = useUserStore()
const appStore = useAppStore()

const apiHeaders = () => ({
  'accept': 'application/json',
  'X-Tenant-ID': TENANT_ID,
  'X-Service-Binding-Alias': 'terminal',
  'Accept-Language': appStore.lang,
  'ngrok-skip-browser-warning': 'true',
})

const services = ref<Service[]>([])
const loading = ref(false)
const error = ref('')

const iin = computed(() => userStore.iin || booking.iin)

onMounted(async () => {
  if (!iin.value) { router.replace('/book'); return }
  if (!booking.selectedSpecialtyId) { router.replace('/book/depts'); return }

  loading.value = true
  error.value = ''
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end = new Date(); end.setMonth(end.getMonth() + 3); end.setHours(23, 59, 59, 0)
    const params = new URLSearchParams({
      iin: iin.value,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      page: '1',
      limit: '100',
      specialty_id: booking.selectedSpecialtyId,
    })
    const res = await fetch(`${BASE_URL}/schedules/items?${params}`, { headers: apiHeaders() })
    const data = await res.json()
    if (!res.ok) {
      error.value = data?.error?.message || t('booking.servicesLoadError')
      return
    }
    // Extract unique services
    const seen = new Set<string>()
    const result: Service[] = []
    for (const item of (data.items ?? [])) {
      if (!seen.has(item.service_id)) {
        seen.add(item.service_id)
        result.push({ service_id: item.service_id, service_name: item.service_name })
      }
    }
    services.value = result
  } catch {
    error.value = t('booking.servicesLoadError')
  } finally {
    loading.value = false
  }
})

function select(id: string, name: string) {
  booking.setService(id, name)
  router.push('/book/docs')
}
</script>

<template>
  <PageShell :show-back="true" :show-home="true" bg="#f0f4ff">

    <!-- Header card -->
    <div class="info-card">
      <div class="info-title">{{ t('booking.selectService') }}</div>
      <div class="info-dept">{{ booking.selectedDept }}</div>
    </div>

    <!-- Services list -->
    <div class="services-section">
      <div v-if="loading" class="flex justify-center py-10">
        <div class="w-8 h-8 rounded-full border-2 border-[#5478FF] border-t-transparent animate-spin" />
      </div>

      <div v-else-if="error" class="text-center py-6 text-sm" style="color:#ef4444">{{ error }}</div>

      <div v-else class="services-list">
        <button
          v-for="(svc, i) in services"
          :key="svc.service_id"
          class="svc-btn animate-fade-in"
          :style="{ animationDelay: `${i * 40}ms` }"
          @click="select(svc.service_id, svc.service_name)"
        >
          <span class="svc-name">{{ svc.service_name }}</span>
          <span class="svc-arrow">→</span>
        </button>

        <div v-if="!services.length" class="text-center py-6 text-sm" style="color:#8a94cc">
          {{ t('booking.noServices') }}
        </div>
      </div>
    </div>

  </PageShell>
</template>

<style scoped>
.info-card {
  margin-top: 50px;
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.info-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111FA2;
  margin-bottom: 4px;
}

.info-dept {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a55a2;
  text-align: center;
}

.services-section {
  background: #ffffff;
  padding: 20px 16px 16px;
  min-height: 100vh;
  border-radius: 20px 20px 0 0;
}

.services-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.svc-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #111FA2, #5478FF);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(84, 120, 255, 0.22);
  transition: opacity 0.18s, transform 0.18s;
  opacity: 0;
  animation: fadeSlideIn 0.35s ease forwards;
  text-align: left;
}

.svc-btn:active {
  opacity: 0.85;
  transform: scale(0.98);
}

.svc-name {
  text-align: left;
}

.svc-arrow {
  font-size: 1.1rem;
  opacity: 0.85;
  flex-shrink: 0;
  margin-left: 12px;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (min-width: 1000px) {
  .info-card { padding: 36px 32px 32px; gap: 10px; margin-top: 60px; }
  .info-title { font-size: 1.4rem; margin-bottom: 6px; }
  .info-dept  { font-size: 1.1rem; }
  .services-section { padding: 24px 22px 22px; border-radius: 26px 26px 0 0; }
  .services-list { gap: 13px; }
  .svc-btn { padding: 20px 26px; font-size: 1.15rem; border-radius: 18px; }
  .svc-arrow { font-size: 1.3rem; }
}

@media (min-width: 1000px) and (min-height: 1600px) {
  .info-card { padding: 48px 40px 40px; gap: 12px; margin-top: 72px; }
  .info-title { font-size: 1.7rem; margin-bottom: 10px; }
  .info-dept  { font-size: 1.3rem; }
  .services-section { padding: 32px 28px 28px; border-radius: 32px 32px 0 0; }
  .services-list { gap: 16px; }
  .svc-btn { padding: 26px 32px; font-size: 1.55rem; border-radius: 20px; }
  .svc-arrow { font-size: 1.8rem; }
}
</style>
