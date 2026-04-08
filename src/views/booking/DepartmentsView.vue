<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { useUserStore } from '@/stores/index'
import { useAppStore } from '@/stores/app'
import PageShell from '@/components/shared/PageShell.vue'

const BASE_URL = 'https://bream-crisp-strongly.ngrok-free.app/api/v1'
const TENANT_ID = '00000000-0000-4000-a000-000000000001'
const LANG_MAP: Record<string, string> = { ru: 'ru', kz: 'kk' }

interface Specialty { id: string; name: string }

const router = useRouter()
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

const specialties = ref<Specialty[]>([])
const loading = ref(false)
const error = ref('')

const iin = computed(() => userStore.iin || booking.iin)
const userName = computed(() => {
  const u = userStore.user
  if (!u) return null
  return u.full_name || u.fio || u.name || (u.first_name ? `${u.last_name ?? ''} ${u.first_name} ${u.middle_name ?? ''}`.trim() : null)
})
const plot = computed(() => {
  const u = userStore.user
  if (!u) return null
  return u.plot || u.uchastok || u.district || null
})

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({
      availability: 'terminal_only',
      page: '1',
      limit: '100',
    })
    const res = await fetch(`${BASE_URL}/specialty/items?${params}`, { headers: apiHeaders() })
    const data = await res.json()
    specialties.value = data.items ?? []
  } catch {
    error.value = 'Не удалось загрузить специальности'
  } finally {
    loading.value = false
  }
})

function select(id: string, name: string) {
  booking.setDept(name, id)
  router.push('/book/docs')
}

function bookTherapist() {
  const therapist = specialties.value.find(s =>
    s.name.toLowerCase().includes('терапевт')
  )
  if (therapist) {
    select(therapist.id, therapist.name)
  } else if (specialties.value.length) {
    select(specialties.value[0].id, specialties.value[0].name)
  }
}
</script>

<template>
  <PageShell :show-back="true" :show-home="true" bg="#f0f4ff">

    <!-- Patient info card -->
    <div class="info-card">
      <div class="info-title">Запись на приём</div>
      <div class="info-iin">ИИН: {{ iin }}</div>
      <div v-if="userName" class="info-name">{{ userName }}</div>
      <div v-if="plot" class="info-plot">Участок №{{ plot }}</div>

      <button v-if="!loading" class="therapist-btn" @click="bookTherapist">
        Записаться к терапевту
      </button>
    </div>

    <!-- Departments list -->
    <div class="depts-section">
      <div class="depts-title">Отделения</div>

      <div v-if="loading" class="flex justify-center py-10">
        <div class="w-8 h-8 rounded-full border-2 border-[#5478FF] border-t-transparent animate-spin" />
      </div>

      <div v-else-if="error" class="text-center py-6 text-sm" style="color:#ef4444">{{ error }}</div>

      <div v-else class="depts-list">
        <button
          v-for="(dept, i) in specialties"
          :key="dept.id"
          class="dept-btn animate-fade-in"
          :style="{ animationDelay: `${i * 40}ms` }"
          @click="select(dept.id, dept.name)"
        >
          <span class="dept-name">{{ dept.name }}</span>
          <span class="dept-arrow">→</span>
        </button>

        <div v-if="!specialties.length" class="text-center py-6 text-sm" style="color:#8a94cc">
          Нет доступных специальностей
        </div>
      </div>
    </div>

  </PageShell>
</template>

<style scoped>
.info-card {
  margin-top: 50px; 
  /* background: linear-gradient(160deg, #dce8ff 0%, #eef4ff 100%); */
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

.info-iin {
  font-size: 1.15rem;
  font-weight: 900;
  color: #0d1a6e;
  letter-spacing: 0.04em;
}

.info-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2a3aaa;
}

.info-plot {
  font-size: 0.82rem;
  color: #4a55a2;
}

.therapist-btn {
  margin-top: 14px;
  padding: 13px 36px;
  border-radius: 30px;
  background: linear-gradient(135deg, #111FA2, #5478FF);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(84, 120, 255, 0.35);
  transition: opacity 0.18s;
}

.therapist-btn:active {
  opacity: 0.85;
}

.depts-section {
  background: #ffffff;
  padding: 20px 16px 16px;
  min-height: 100vh;
  border-radius: 20px 20px 0 0;
}

.depts-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  text-align: center;
  margin-bottom: 14px;
}

.depts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dept-btn {
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
}

.dept-btn:active {
  opacity: 0.85;
  transform: scale(0.98);
}

.dept-name {
  text-align: left;
}

.dept-arrow {
  font-size: 1.1rem;
  opacity: 0.85;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (min-width: 1000px) and (min-height: 1600px) {
  .info-card { padding: 48px 40px 40px; gap: 12px; margin-top: 72px; }
  .info-title { font-size: 1.7rem; margin-bottom: 10px; }
  .info-iin   { font-size: 1.7rem; }
  .info-name  { font-size: 1.3rem; }
  .info-plot  { font-size: 1.2rem; }
  .therapist-btn { padding: 22px 60px; font-size: 1.35rem; border-radius: 44px; margin-top: 26px; }
  .depts-section { padding: 32px 28px 28px; border-radius: 32px 32px 0 0; }
  .depts-title { font-size: 1.55rem; margin-bottom: 24px; }
  .depts-list  { gap: 16px; }
  .dept-btn    { padding: 26px 32px; font-size: 1.35rem; border-radius: 20px; }
  .dept-arrow  { font-size: 1.6rem; }
}
</style>
