<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import PageShell from '@/components/shared/PageShell.vue'

const { t } = useI18n()
const appStore = useAppStore()
const navTab = ref<'nav' | 'map'>('nav')
const floorFilter = ref('all')
const mapFloor = ref('1')

const BASE_URL = 'https://terminal.dev.medcontact.kz/orginfo/api/v1/public/nav/items'
const TENANT_ID = '00000000-0000-4000-a000-000000000001'


const apiHeaders = () => ({
  'Accept-Language': appStore.lang,
  'X-Tenant-ID': TENANT_ID,
  'X-Service-Binding-Alias': 'terminal',
  'ngrok-skip-browser-warning': 'true',
})

interface NavItem {
  id: number
  name: string
  note: string
  floor: number
  number: string
  work_from: string
  work_to: string
  sort_order: number
  department_name: string
  block_code: string
  map_coords: { x: number; y: number; width: number; height: number } | null
}

const items = ref<NavItem[]>([])
const loading = ref(false)
const error = ref('')

async function fetchItems() {
  loading.value = true
  error.value = ''
  try {
    let page = 1
    let all: NavItem[] = []
    while (true) {
      const params = new URLSearchParams({ page: String(page), limit: '100' })
      const res = await fetch(`${BASE_URL}?${params}`, { headers: apiHeaders() })
      const data = await res.json()
      all = all.concat(data.items ?? [])
      if (!data.has_next) break
      page++
    }
    items.value = all.sort((a, b) => a.sort_order - b.sort_order)
  } catch {
    error.value = 'Не удалось загрузить навигацию'
  } finally {
    loading.value = false
  }
}

onMounted(fetchItems)

const DEPT_CLR: Record<string, { ic: string; bg: string }> = {
  'Регистратура': { ic:'#111FA2', bg:'#E8EBFF' },
  'Терапия':      { ic:'#111FA2', bg:'#E8EBFF' },
  'Лаборатория':  { ic:'#E8941A', bg:'#FFF8EB' },
  'Инфекционное': { ic:'#3B82F6', bg:'#EFF6FF' },
  'Гинекология':  { ic:'#9333EA', bg:'#FDF4FF' },
  'Кардиология':  { ic:'#D94848', bg:'#FDF0F0' },
  'Хирургия':     { ic:'#D94848', bg:'#FDF0F0' },
  'Аптека':       { ic:'#5478FF', bg:'#E8EBFF' },
  'Рентген / УЗИ':{ ic:'#E8941A', bg:'#FFF8EB' },
}

const floors = computed(() => ['all', ...new Set(items.value.map(n => String(n.floor)))])
const filtered = computed(() =>
  floorFilter.value === 'all'
    ? items.value
    : items.value.filter(n => String(n.floor) === floorFilter.value)
)

const FDATA: Record<string, Array<{ id: string; name: string; x: number; y: number; w: number; h: number; ic: string; bg: string }>> = {
  'Ц': [
    { id:'Р',   name:'Рентген',        x:8,   y:8,  w:96,  h:66, ic:'#E8941A', bg:'#FFF8EB' },
    { id:'УЗИ', name:'УЗИ',            x:104, y:8,  w:52,  h:66, ic:'#E8941A', bg:'#FFF8EB' },
    { id:'АРХ', name:'Архив',          x:176, y:8,  w:32,  h:66, ic:'#8a94cc', bg:'#F3F4FF' },
    { id:'ЛЦ',  name:'Лаб. цоколь',   x:208, y:8,  w:64,  h:66, ic:'#E8941A', bg:'#FFF8EB' },
    { id:'ТП',  name:'Техн. помещ.',   x:8,   y:82, w:200, h:70, ic:'#8a94cc', bg:'#F3F4FF' },
  ],
  '1': [
    { id:'101', name:'Регистратура',   x:8,   y:8,  w:96,  h:66, ic:'#111FA2', bg:'#E8EBFF' },
    { id:'102', name:'Терапия',        x:104, y:8,  w:52,  h:66, ic:'#111FA2', bg:'#E8EBFF' },
    { id:'103', name:'Каб. врача',     x:176, y:8,  w:32,  h:66, ic:'#8a94cc', bg:'#F3F4FF' },
    { id:'АП',  name:'Аптека',         x:208, y:8,  w:64,  h:66, ic:'#5478FF', bg:'#E8EBFF' },
    { id:'121', name:'Инфекционное',   x:8,   y:82, w:86,  h:70, ic:'#3B82F6', bg:'#EFF6FF' },
    { id:'ВХ',  name:'Главный вход',   x:94,  y:82, w:114, h:70, ic:'#1565C0', bg:'#E3F2FD' },
  ],
  '2': [
    { id:'247', name:'Инфекционное',   x:8,   y:8,  w:148, h:66, ic:'#3B82F6', bg:'#EFF6FF' },
    { id:'210', name:'Каб. 210',       x:176, y:8,  w:32,  h:66, ic:'#8a94cc', bg:'#F3F4FF' },
    { id:'2А',  name:'Проц.кабинет',  x:208, y:8,  w:64,  h:66, ic:'#1565C0', bg:'#E3F2FD' },
    { id:'P',   name:'Процедурная',    x:8,   y:82, w:86,  h:70, ic:'#1565C0', bg:'#E3F2FD' },
    { id:'М2',  name:'Мед.сестры',     x:94,  y:82, w:114, h:70, ic:'#8a94cc', bg:'#F3F4FF' },
  ],
  '3': [
    { id:'301', name:'Гинекология',    x:8,   y:8,  w:96,  h:66, ic:'#9333EA', bg:'#FDF4FF' },
    { id:'310', name:'Кардиология',    x:104, y:8,  w:52,  h:66, ic:'#D94848', bg:'#FDF0F0' },
    { id:'3Б',  name:'Каб. 3Б',       x:176, y:8,  w:32,  h:66, ic:'#9333EA', bg:'#FDF4FF' },
    { id:'3А',  name:'Лаб. 3 эт.',    x:208, y:8,  w:64,  h:66, ic:'#E8941A', bg:'#FFF8EB' },
    { id:'315', name:'Процедурная',    x:8,   y:82, w:86,  h:70, ic:'#8a94cc', bg:'#F3F4FF' },
    { id:'М3',  name:'Пост',           x:94,  y:82, w:114, h:70, ic:'#9333EA', bg:'#FDF4FF' },
  ],
  '4': [
    { id:'410', name:'Хирургия',       x:8,   y:8,  w:96,  h:66, ic:'#D94848', bg:'#FDF0F0' },
    { id:'ОП',  name:'Операционная',   x:104, y:8,  w:52,  h:66, ic:'#D94848', bg:'#FDF0F0' },
    { id:'ПА',  name:'Предоперац.',    x:176, y:8,  w:32,  h:66, ic:'#D94848', bg:'#FDF0F0' },
    { id:'418', name:'Стерилизация',   x:208, y:8,  w:64,  h:66, ic:'#E8941A', bg:'#FFF8EB' },
    { id:'419', name:'Перевязочная',   x:8,   y:82, w:86,  h:70, ic:'#D94848', bg:'#FDF0F0' },
    { id:'420', name:'Реанимация',     x:94,  y:82, w:114, h:70, ic:'#D94848', bg:'#FDF0F0' },
  ],
}
</script>

<template>
  <PageShell :show-back="true" :show-home="true">
    <div class="px-6 fhd:px-10 py-4 fhd:py-8 max-w-3xl fhd:max-w-4xl mx-auto">
      <div class="animate-fade-in text-center mb-5 fhd:mb-8">
        <div class="text-2xl fhd:text-4xl font-extrabold" style="color:#111FA2">{{ t('info.nav') }}</div>
        <div class="text-sm fhd:text-xl mt-1 fhd:mt-2" style="color:#4a55a2">{{ t('info.navSub') }}</div>
      </div>

      <!-- Tab toggle -->
      <div class="flex rounded-2xl fhd:rounded-3xl p-1 fhd:p-1.5 mb-4 fhd:mb-6" style="background:#F3F4FF;">
        <button v-for="tab in ['nav', 'map']" :key="tab"
          @click="tab !== 'map' && (navTab = tab as 'nav' | 'map')"
          class="flex-1 py-3 fhd:py-5 rounded-xl fhd:rounded-2xl border-none text-sm fhd:text-xl font-bold transition-all"
          :class="tab === 'map' ? 'cursor-not-allowed' : 'cursor-pointer'"
          :disabled="tab === 'map'"
          :style="{
            background: navTab === tab ? '#fff' : 'transparent',
            color: navTab === tab ? '#111FA2' : tab === 'map' ? '#b0b8d9' : '#4a55a2',
            boxShadow: navTab === tab ? '0 1px 6px rgba(17,31,162,0.1)' : 'none',
            opacity: tab === 'map' ? '0.5' : '1',
          }">
          {{ tab === 'nav' ? t('info.navigation') : t('info.map') }}
        </button>
      </div>

      <!-- Navigation list -->
      <template v-if="navTab === 'nav'">
        <div class="flex rounded-2xl fhd:rounded-3xl p-1 fhd:p-1.5 mb-4 fhd:mb-6" style="background:#F3F4FF;">
          <button v-for="f in floors" :key="f"
            @click="floorFilter = f"
            class="flex-1 py-2.5 fhd:py-4 rounded-xl fhd:rounded-2xl border-none text-xs fhd:text-lg font-bold cursor-pointer transition-all"
            :style="{
              background: floorFilter === f ? '#fff' : 'transparent',
              color: floorFilter === f ? '#111FA2' : '#4a55a2',
              boxShadow: floorFilter === f ? '0 1px 6px rgba(17,31,162,0.1)' : 'none',
            }">
            {{ f === 'all' ? t('info.allFloors') : `Эт.${f}` }}
          </button>
        </div>

        <div class="flex flex-col gap-2.5 fhd:gap-4">
          <div v-for="(n, i) in filtered" :key="i"
            class="animate-fade-in" :style="{ animationDelay: `${i*30}ms` }">
            <div class="bg-white rounded-2xl fhd:rounded-3xl border overflow-hidden flex"
              style="box-shadow: 0 2px 12px rgba(17,31,162,0.06); border-color:#e4e6f8;">
              <div class="w-1.5 fhd:w-2.5 flex-shrink-0" :style="{ background: (DEPT_CLR[n.department_name] || { ic:'#111FA2' }).ic }" />
              <div class="flex-1 py-3.5 fhd:py-6 px-4 fhd:px-7 flex items-center gap-3 fhd:gap-5">
                <div class="w-10 h-10 fhd:w-16 fhd:h-16 rounded-xl fhd:rounded-2xl flex items-center justify-center flex-shrink-0"
                  :style="{ background: (DEPT_CLR[n.department_name] || { bg:'#E8EBFF' }).bg }">
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
                    :stroke="(DEPT_CLR[n.department_name] || { ic:'#111FA2' }).ic"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="font-extrabold text-sm fhd:text-xl" style="color:#0d1240">{{ n.department_name }}</div>
                  <div class="text-xs fhd:text-lg mt-0.5 fhd:mt-1" style="color:#4a55a2">Каб. {{ n.number }} · Эт.{{ n.floor }}</div>
                  <div v-if="n.note" class="flex items-center gap-1 fhd:gap-2 mt-0.5 fhd:mt-1">
                    <svg class="note-icon" viewBox="0 0 24 24" fill="none" stroke="#E8941A" stroke-width="2.5" stroke-linecap="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <span class="text-xs fhd:text-lg font-semibold" style="color:#E8941A">{{ n.note }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Floor map -->
      <template v-else>
        <div class="flex gap-2 fhd:gap-3 mb-4 fhd:mb-6 justify-center">
          <button v-for="f in ['Ц','1','2','3','4']" :key="f"
            @click="mapFloor = f"
            class="kb w-11 h-11 fhd:w-16 fhd:h-16 rounded-xl fhd:rounded-2xl border-none text-sm fhd:text-xl font-extrabold cursor-pointer transition-all"
            :style="{
              background: mapFloor === f ? 'linear-gradient(135deg,#111FA2,#5478FF)' : '#F3F4FF',
              color: mapFloor === f ? '#fff' : '#4a55a2',
              boxShadow: mapFloor === f ? '0 3px 10px rgba(84,120,255,0.25)' : 'none',
            }">
            {{ f }}
          </button>
        </div>

        <div class="bg-white rounded-2xl fhd:rounded-3xl border p-3 fhd:p-6 overflow-hidden"
          style="box-shadow: 0 2px 12px rgba(17,31,162,0.06); border-color:#e4e6f8;">
          <div class="text-center text-xs fhd:text-xl font-bold mb-2 fhd:mb-4" style="color:#8a94cc">
            Этаж {{ mapFloor === 'Ц' ? 'Цоколь' : mapFloor }}
          </div>
          <svg viewBox="0 0 280 162" width="100%" class="block">
            <rect x="6" y="78" width="268" height="6" rx="3" fill="#e4e6f8"/>
            <template v-for="room in FDATA[mapFloor]" :key="room.id">
              <rect :x="room.x" :y="room.y" :width="room.w" :height="room.h"
                :rx="6" :fill="room.bg" :stroke="room.ic" stroke-width="1.5"/>
              <text :x="room.x + room.w/2" :y="room.y + room.h/2 - 8"
                text-anchor="middle" dominant-baseline="middle"
                :fill="room.ic" font-size="7" font-weight="800" font-family="Nunito Sans, sans-serif">
                {{ room.id }}
              </text>
              <text :x="room.x + room.w/2" :y="room.y + room.h/2 + 6"
                text-anchor="middle" dominant-baseline="middle"
                :fill="room.ic" font-size="5.5" font-weight="600" font-family="Nunito Sans, sans-serif" opacity="0.8">
                {{ room.name.slice(0, 10) }}
              </text>
            </template>
          </svg>
        </div>
      </template>
    </div>
  </PageShell>
</template>

<style scoped>
.nav-icon  { width: 18px; height: 18px; }
.note-icon { width: 10px; height: 10px; }

@media (min-width: 1000px) and (min-height: 1600px) {
  .nav-icon  { width: 32px; height: 32px; }
  .note-icon { width: 20px; height: 20px; }
}
</style>
