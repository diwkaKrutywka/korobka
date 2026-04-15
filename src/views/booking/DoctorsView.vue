<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBookingStore } from '@/stores/booking'
import { useUserStore } from '@/stores/index'
import { useAppStore } from '@/stores/app'
import PageShell from '@/components/shared/PageShell.vue'
import KModal from '@/components/shared/KModal.vue'
import { vid } from '@/composables/usePageVideo'

const BASE_URL = import.meta.env.VITE_BOOKING_API_URL
const TENANT_ID = import.meta.env.VITE_TENANT_ID


// Slot: [start_timestamp_seconds, end_timestamp_seconds]
type Slot = [number, number]
// slots live inside each specialist, not on the schedule itself
interface Specialist { id: string; full_name: string; slots: Slot[] }
interface Schedule { service_id: string; service_name: string; specialists: Specialist[] }
type SlotItem = { sched: Schedule; spec: Specialist; slot: Slot }

// Server stores timestamps as UTC — display as-is without timezone conversion
const SLOT_TZ = 'UTC'

function slotDate(slot: Slot): Date { return new Date(slot[0] * 1000) }
function specSlots(spec: Specialist): Slot[] { return Array.isArray(spec.slots) ? spec.slots : [] }

// ISO date "YYYY-MM-DD" in UTC (matches server storage)
function slotIsoDay(slot: Slot): string {
  return new Date(slot[0] * 1000).toLocaleDateString('en-CA', { timeZone: SLOT_TZ })
}
function allSpecSlots(scheds: Schedule[], doctorId: string | null): SlotItem[] {
  const items: SlotItem[] = []
  for (const sched of scheds) {
    for (const spec of (Array.isArray(sched.specialists) ? sched.specialists : [])) {
      if (doctorId && spec.id !== doctorId) continue
      for (const slot of specSlots(spec)) items.push({ sched, spec, slot })
    }
  }
  return items
}

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

const schedules = ref<Schedule[]>([])
const loading = ref(false)
const fetchError = ref('')
const fetchedEndDate = ref<Date | null>(null)

const selSpec = ref<Specialist | null>(null)
const selSchedule = ref<Schedule | null>(null)
const selSlot = ref<Slot | null>(null)
const bookLoading = ref(false)
const bookError = ref('')

interface ErrorModal {
  title: string
  message: string
  primaryBtn: { label: string; action: () => void }
  secondaryBtn?: { label: string; action: () => void }
}
const apiErrorModal = ref<ErrorModal | null>(null)

function showApiError(code: number | undefined, message: string) {
  if (code === 30) {
    apiErrorModal.value = {
      title: 'Пациент не найден',
      message,
      primaryBtn: { label: 'Ввести ИИН заново', action: () => router.replace('/book') },
      secondaryBtn: { label: 'Закрыть', action: () => router.replace('/') },
    }
  } else if (code === 210) {
    apiErrorModal.value = {
      title: 'Нет данных о прикреплении',
      message,
      primaryBtn: { label: 'На главную', action: () => router.replace('/') },
      secondaryBtn: { label: 'Закрыть', action: () => router.replace('/') },
    }
  } else if (code === 560) {
    apiErrorModal.value = {
      title: 'Время недоступно',
      message,
      primaryBtn: {
        label: 'Выбрать другое время',
        action: () => { apiErrorModal.value = null; fetchSchedules() },
      },
    }
  } else if (code === 10) {
    apiErrorModal.value = {
      title: 'Требуется направление',
      message,
      primaryBtn: { label: 'Понятно', action: () => { apiErrorModal.value = null } },
    }
  } else {
    apiErrorModal.value = {
      title: 'Ошибка',
      message,
      primaryBtn: { label: 'Закрыть', action: () => { apiErrorModal.value = null } },
    }
  }
}

const iin = computed(() => userStore.iin || booking.iin)
const patientName = computed(() => {
  const u = userStore.user
  if (!u) return iin.value
  return u.full_name || u.fio || u.name || iin.value
})

// Calendar state
const now = new Date()
const calYear = ref(now.getFullYear())
const calMonth = ref(now.getMonth())
const selDayKey = ref<string | null>(null)

// Doctor filter
const selDoctorId = ref<string | null>(null)
const ddOpen = ref(false)

onMounted(() => {
  if (!iin.value) {
    router.replace('/book')
    return
  }
  fetchSchedules()
})

async function fetchSchedules(extendToDate?: Date) {
  loading.value = true
  fetchError.value = ''
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end = extendToDate ?? new Date()
    if (!extendToDate) { end.setMonth(end.getMonth() + 3) }
    end.setHours(23, 59, 59, 0)
    fetchedEndDate.value = new Date(end)
    const params = new URLSearchParams({
      iin: iin.value,
      start_date: start.toISOString(), end_date: end.toISOString(),
      page: '1', limit: '100',
    })
    if (booking.selectedSpecialtyId) params.set('specialty_id', booking.selectedSpecialtyId)
    const res = await fetch(`${BASE_URL}/schedules/items?${params}`, { headers: apiHeaders() })
    const data = await res.json()
    if (!res.ok) {
      const code = data?.error?.details?.damumed_code
      const msg: string = data?.error?.message || 'Не удалось загрузить расписание'
      if (code === 30 || code === 210) {
        showApiError(code, msg)
      } else {
        fetchError.value = msg
      }
      return
    }
    schedules.value = data.items ?? []
    autoSelectDay()
  } catch {
    fetchError.value = 'Не удалось загрузить расписание'
  } finally {
    loading.value = false
  }
}

// All unique doctors across all schedules
const allDoctors = computed(() => {
  const seen = new Set<string>()
  const result: Specialist[] = []
  for (const sched of schedules.value) {
    for (const spec of (Array.isArray(sched.specialists) ? sched.specialists : [])) {
      if (!seen.has(spec.id)) { seen.add(spec.id); result.push(spec) }
    }
  }
  return result
})

const selDoctorName = computed(() => {
  if (!selDoctorId.value) return 'Все врачи'
  return allDoctors.value.find(d => d.id === selDoctorId.value)?.full_name ?? 'Все врачи'
})

function autoSelectDay() {
  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: SLOT_TZ })
  // Prefer today if it has slots, otherwise first available day
  const targetKey = slotsByDay.value.has(todayKey)
    ? todayKey
    : [...slotsByDay.value.keys()].sort()[0]
  if (!targetKey) return
  const [y, m] = targetKey.split('-').map(Number)
  calYear.value = y
  calMonth.value = m - 1
  selDayKey.value = targetKey
}

function selectDoctor(id: string | null) {
  selDoctorId.value = id
  ddOpen.value = false
  selDayKey.value = null
  selSlot.value = null
  selSchedule.value = null
  selSpec.value = null
  autoSelectDay()
}

// Calendar helpers — ISO "YYYY-MM-DD" keys, Kazakhstan timezone
function cellKey(year: number, month: number, day: number): string {
  // month is 0-indexed; ISO needs 1-indexed
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

// All slots grouped by Kazakhstan date key
const slotsByDay = computed((): Map<string, SlotItem[]> => {
  const map = new Map<string, SlotItem[]>()
  for (const item of allSpecSlots(schedules.value, selDoctorId.value)) {
    const key = slotIsoDay(item.slot)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  for (const arr of map.values()) arr.sort((a, b) => a.slot[0] - b.slot[0])
  return map
})

const calCells = computed(() => {
  const dim = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const fd = (new Date(calYear.value, calMonth.value, 1).getDay() + 6) % 7
  return Array(fd).fill(null).concat(Array.from({ length: dim }, (_, i) => i + 1))
})

const calMonthLabel = computed(() =>
  new Date(calYear.value, calMonth.value, 1).toLocaleDateString('ru', { month: 'long', year: 'numeric' })
)

const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: SLOT_TZ }) // "YYYY-MM-DD"

function isDayAvail(d: number): boolean {
  return slotsByDay.value.has(cellKey(calYear.value, calMonth.value, d))
}
function isDayPast(d: number): boolean {
  return cellKey(calYear.value, calMonth.value, d) < todayIso
}

function selectDay(d: number) {
  if (!d || isDayPast(d) || !isDayAvail(d)) return
  const key = cellKey(calYear.value, calMonth.value, d)
  selDayKey.value = selDayKey.value === key ? null : key
  selSlot.value = null
  selSchedule.value = null
  selSpec.value = null
}

function prevMonth() {
  if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- }
  else calMonth.value--
  selDayKey.value = null
}
function nextMonth() {
  if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ }
  else calMonth.value++
  selDayKey.value = null
  // If navigated beyond fetched range, extend the fetch
  if (fetchedEndDate.value) {
    const viewEnd = new Date(calYear.value, calMonth.value + 1, 0, 23, 59, 59)
    if (viewEnd > fetchedEndDate.value) {
      const newEnd = new Date(calYear.value, calMonth.value + 1, 0, 23, 59, 59)
      fetchSchedules(newEnd)
    }
  }
}

const slotsForDay = computed((): SlotItem[] => {
  if (!selDayKey.value) return []
  const items = slotsByDay.value.get(selDayKey.value) ?? []
  if (selDoctorId.value) return items
  // When showing all doctors, deduplicate slots by start time
  const seen = new Set<number>()
  return items.filter(item => {
    if (seen.has(item.slot[0])) return false
    seen.add(item.slot[0])
    return true
  })
})

function selectSlot(item: SlotItem) {
  selSchedule.value = item.sched
  selSpec.value = item.spec
  selSlot.value = item.slot
  bookError.value = ''
}

async function confirmBooking() {
  if (!selSchedule.value || !selSpec.value || !selSlot.value) return
  if (!iin.value) {
    router.replace('/book')
    return
  }
  bookLoading.value = true
  bookError.value = ''
  try {
    const body = {
      iin: iin.value,
      appointment_time: slotDate(selSlot.value).toISOString(),
      service_id: selSchedule.value.service_id,
      specialty_id: booking.selectedSpecialtyId || null,
      specialist_id: selSpec.value.id || null,
      is_pmsp: null,
      is_self_registration_payable: null,
    }
    const res = await fetch(`${BASE_URL}/appointments/book`, {
      method: 'POST',
      headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      const msg: string = err?.error?.message || err?.message || 'Ошибка при записи'
      const code = err?.error?.details?.damumed_code
      // IIN missing or invalid — redirect to IIN input
      if (code === 20 || msg.toLowerCase().includes('iin')) {
        router.replace('/book')
        return
      }
      // Structured API errors — show modal
      if (code === 10 || code === 30 || code === 210 || code === 560) {
        selSchedule.value = null
        selSlot.value = null
        showApiError(code, msg)
        return
      }
      bookError.value = msg
      return
    }
    const data = await res.json()
    booking.setBookingResult({
      serviceId: selSchedule.value.service_id,
      serviceName: data.service_name || selSchedule.value.service_name,
      specialistName: data.doctor_name || selSpec.value.full_name,
      appointmentTime: data.appointment_time || slotDate(selSlot.value).toISOString(),
      appointmentId: data.appointment_id,
      scheduleRecordId: data.schedule_record_id,
      cabinet: data.cabinet || '',
    })
    selSchedule.value = null
    selSpec.value = null
    selSlot.value = null
    router.push('/book/ok')
  } catch {
    bookError.value = 'Ошибка сети'
  } finally {
    bookLoading.value = false
  }
}

function formatTime(slot: Slot) {
  return slotDate(slot).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit', timeZone: SLOT_TZ })
}

// Видео: book-confirm когда открыта модалка подтверждения, иначе авто из routeMap
const lang = computed(() => appStore.lang === 'kk' ? 'kz' : 'ru')
const avatarVideoSrc = computed(() =>
  selSchedule.value && selSlot.value
    ? vid(`book-confirm-${lang.value}`)
    : undefined
)
</script>

<template>
  <PageShell :show-back="true" :show-home="true" :video-src="avatarVideoSrc">
    <div class="px-4 fhd:px-10 py-3 fhd:py-8 max-w-sm fhd:max-w-3xl mx-auto">

      <!-- Title -->
      <div class="text-center mb-3 fhd:mb-6">
        <div class="text-xl fhd:text-4xl font-extrabold" style="color:#111FA2">{{ booking.selectedDept }}</div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 fhd:w-14 fhd:h-14 rounded-full border-2 border-[#5478FF] border-t-transparent animate-spin" />
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="text-center py-8 text-sm fhd:text-xl" style="color:#ef4444">
        {{ fetchError }}
        <button @click="fetchSchedules()" class="block mx-auto mt-3 px-4 fhd:px-7 py-2 fhd:py-4 rounded-xl text-xs fhd:text-lg font-bold border-none cursor-pointer"
          style="background:#E8EBFF; color:#111FA2;">Повторить</button>
      </div>

      <template v-else>
        <!-- Doctor dropdown -->
        <div class="relative mb-3 fhd:mb-5">
          <button
            @click="ddOpen = !ddOpen"
            class="w-full flex items-center justify-between px-4 fhd:px-7 py-3 fhd:py-5 rounded-xl fhd:rounded-2xl border text-sm fhd:text-xl font-semibold cursor-pointer"
            style="background:#fff; border-color:#d1d5db; color:#1B2D2A;"
          >
            <span>{{ selDoctorName }}</span>
            <svg width="18" height="18" class="fhd:w-7 fhd:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round"
              :style="{ transform: ddOpen ? 'rotate(180deg)' : '', transition: '.2s' }">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          <div v-if="ddOpen"
            class="absolute top-full left-0 right-0 z-20 rounded-xl fhd:rounded-2xl border overflow-hidden mt-1"
            style="background:#fff; border-color:#d1d5db; box-shadow:0 8px 24px rgba(0,0,0,0.12);">
            <button
              @click="selectDoctor(null)"
              class="w-full px-4 fhd:px-7 py-3 fhd:py-5 text-sm fhd:text-xl font-semibold text-left border-b cursor-pointer"
              :style="{ background: !selDoctorId ? '#E8EBFF' : '#fff', color: !selDoctorId ? '#111FA2' : '#1B2D2A', borderColor:'#e4e6f8' }"
            >Все врачи</button>
            <button
              v-for="doc in allDoctors" :key="doc.id"
              @click="selectDoctor(doc.id)"
              class="w-full px-4 fhd:px-7 py-3 fhd:py-5 text-sm fhd:text-xl font-semibold text-left border-b last:border-0 cursor-pointer"
              :style="{ background: selDoctorId === doc.id ? '#E8EBFF' : '#fff', color: selDoctorId === doc.id ? '#111FA2' : '#1B2D2A', borderColor:'#e4e6f8' }"
            >{{ doc.full_name }}</button>
          </div>
        </div>

        <!-- Calendar -->
        <div class="rounded-2xl fhd:rounded-3xl overflow-hidden mb-3 fhd:mb-6" style="border:1px solid #e4e6f8;">
          <!-- Month header with nav -->
          <div class="flex items-center justify-between px-3 fhd:px-6 py-2 fhd:py-4 text-white" style="background:#111FA2;">
            <button @click="prevMonth"
              class="w-7 h-7 fhd:w-12 fhd:h-12 flex items-center justify-center rounded-full cursor-pointer border-none"
              style="background:rgba(255,255,255,0.15); color:#fff;">
              <svg width="14" height="14" class="fhd:w-6 fhd:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span class="text-sm fhd:text-2xl font-extrabold capitalize">{{ calMonthLabel }}</span>
            <button @click="nextMonth"
              class="w-7 h-7 fhd:w-12 fhd:h-12 flex items-center justify-center rounded-full cursor-pointer border-none"
              style="background:rgba(255,255,255,0.15); color:#fff;">
              <svg width="14" height="14" class="fhd:w-6 fhd:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <!-- Weekday headers -->
          <div class="grid grid-cols-7 text-center" style="background:#f0f2ff;">
            <div v-for="(d, i) in ['пн','вт','ср','чт','пт','сб','вс']" :key="d"
              class="py-1.5 fhd:py-3 text-xs fhd:text-lg font-bold"
              :style="{ color: i >= 5 ? '#D94848' : '#6b7280' }">
              {{ d }}
            </div>
          </div>

          <!-- Days grid -->
          <div class="grid grid-cols-7 text-center p-1.5 fhd:p-3 gap-0.5 fhd:gap-1" style="background:#fff;">
            <button
              v-for="(cell, i) in calCells"
              :key="i"
              :disabled="!cell || isDayPast(cell) || !isDayAvail(cell)"
              @click="cell && selectDay(cell)"
              class="aspect-square flex items-center justify-center text-xs fhd:text-lg rounded-full transition-all"
              :style="{
                background: !cell ? 'transparent'
                  : selDayKey === cellKey(calYear, calMonth, cell) ? '#111FA2'
                  : isDayAvail(cell) ? '#E8EBFF'
                  : 'transparent',
                color: !cell ? 'transparent'
                  : selDayKey === cellKey(calYear, calMonth, cell) ? '#fff'
                  : isDayPast(cell) || !isDayAvail(cell) ? '#d1d5db'
                  : (i % 7 === 5 || i % 7 === 6) ? '#D94848'
                  : '#111FA2',
                fontWeight: isDayAvail(cell) ? '700' : '400',
                border: '2px solid transparent',
                cursor: !cell || isDayPast(cell) || !isDayAvail(cell) ? 'default' : 'pointer',
              }"
            >{{ cell || '' }}</button>
          </div>
        </div>

        <!-- Time slots -->
        <div v-if="selDayKey">
          <div class="text-xs fhd:text-xl font-semibold mb-2 fhd:mb-4" style="color:#6b7280">Открытые окошки:</div>
          <div v-if="slotsForDay.length" class="flex flex-wrap gap-2 fhd:gap-3 mb-3 fhd:mb-6">
            <button
              v-for="item in slotsForDay"
              :key="item.slot[0]"
              @click="selectSlot(item)"
              class="kb px-4 fhd:px-7 py-2 fhd:py-4 rounded-xl fhd:rounded-2xl text-xs fhd:text-xl font-bold border-2 cursor-pointer transition-all"
              :style="{
                background: selSlot?.[0] === item.slot[0] ? '#111FA2' : '#fff',
                color: selSlot?.[0] === item.slot[0] ? '#fff' : '#111FA2',
                borderColor: selSlot?.[0] === item.slot[0] ? '#111FA2' : '#c7cef5',
              }"
            >{{ formatTime(item.slot) }}</button>
          </div>
          <div v-else class="text-xs fhd:text-xl mb-3" style="color:#8a94cc">Нет доступных слотов</div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!schedules.length" class="text-center py-6 text-sm fhd:text-xl" style="color:#8a94cc">
          {{ t('booking.noDoctors') }}
        </div>
      </template>
    </div>

    <!-- API error modal -->
    <KModal v-if="apiErrorModal" @close="router.replace('/')" >
      <div class="p-6 fhd:p-10 flex flex-col items-center text-center">
        <div class="mb-4 fhd:mb-6 w-14 h-14 fhd:w-20 fhd:h-20 rounded-full flex items-center justify-center" style="background:#FEE2E2;">
          <svg width="28" height="28" class="fhd:w-10 fhd:h-10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="font-extrabold text-base fhd:text-2xl mb-2 fhd:mb-3" style="color:#1a1a2e">{{ apiErrorModal.title }}</div>
        <div class="text-sm fhd:text-xl mb-6 fhd:mb-10 leading-snug" style="color:#6b7280">{{ apiErrorModal.message }}</div>
        <button
          class="kb w-full py-3 fhd:py-5 rounded-2xl fhd:rounded-3xl text-sm fhd:text-xl font-extrabold text-white border-none cursor-pointer mb-2 fhd:mb-4"
          style="background:linear-gradient(135deg,#111FA2,#5478FF);"
          @click="apiErrorModal.primaryBtn.action()"
        >{{ apiErrorModal.primaryBtn.label }}</button>
        <button
          v-if="apiErrorModal.secondaryBtn"
          class="kb w-full py-2.5 fhd:py-5 rounded-2xl fhd:rounded-3xl text-xs fhd:text-xl font-bold cursor-pointer border-2 bg-transparent"
          style="color:#111FA2; border-color:#5478FF;"
          @click="apiErrorModal.secondaryBtn.action()"
        >{{ apiErrorModal.secondaryBtn.label }}</button>
      </div>
    </KModal>

    <!-- Confirmation modal -->
    <KModal v-if="selSchedule && selSlot" @close="selSchedule = null; selSlot = null">
      <div class="p-6 fhd:p-10">
        <div class="text-center font-extrabold text-base fhd:text-2xl mb-4 fhd:mb-7" style="color:#111FA2">{{ t('booking.confirm') }}</div>

        <div
          v-for="[label, val] in [
            [t('booking.patient'), patientName],
            [t('booking.appointment'), `${selSpec?.full_name} (${selSchedule.service_name})`],
            [t('booking.datetime'), `${slotDate(selSlot).toLocaleDateString('ru', { day: 'numeric', month: 'long', timeZone: SLOT_TZ })} · ${formatTime(selSlot)}`],
          ]"
          :key="label"
          class="py-3 fhd:py-5 border-b"
          style="border-color:#e4e6f8;"
        >
          <div class="text-xs fhd:text-base uppercase tracking-wide" style="color:#8a94cc">{{ label }}</div>
          <div class="text-sm fhd:text-xl font-bold mt-0.5 fhd:mt-1" style="color:#0d1240">{{ val }}</div>
        </div>

        <div v-if="bookError" class="text-xs fhd:text-lg text-center mt-3" style="color:#ef4444">{{ bookError }}</div>
        <div class="text-xs fhd:text-base text-center mt-3" style="color:#8a94cc">{{ t('booking.arrive') }}</div>

        <button
          :disabled="bookLoading"
          class="kb w-full mt-4 fhd:mt-6 py-3 fhd:py-5 rounded-2xl fhd:rounded-3xl text-sm fhd:text-xl font-extrabold text-white border-none cursor-pointer transition-opacity"
          style="background:linear-gradient(135deg,#111FA2,#5478FF);"
          :style="{ opacity: bookLoading ? 0.6 : 1 }"
          @click="confirmBooking"
        >
          <span v-if="bookLoading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/>
            </svg>
            Запись...
          </span>
          <span v-else>✓ {{ t('booking.doBook') }}</span>
        </button>

        <div class="flex gap-2 fhd:gap-4 mt-2 fhd:mt-4">
          <button
            class="kb flex-1 py-2.5 fhd:py-5 rounded-2xl fhd:rounded-3xl text-xs fhd:text-xl font-bold cursor-pointer border-2 bg-transparent"
            style="color:#111FA2; border-color:#5478FF;"
            @click="selSchedule = null; selSlot = null"
          >{{ t('nav.back') }}</button>
        </div>
      </div>
    </KModal>
  </PageShell>
</template>
