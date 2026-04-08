<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { DOCTORS } from '@/lib/data'
import PageShell from '@/components/shared/PageShell.vue'
import DeptIcon from '@/components/shared/DeptIcon.vue'

const { t } = useI18n()
const DAY_A = ['пн','вт','ср','чт','пт','сб','вс']
const specs = [...new Set(DOCTORS.map(d => d.spec))]
const filter = ref('all')

function parseDays(ds: string | undefined) {
  if (!ds) return []
  const res: number[] = []
  if (ds.includes('–')) {
    const [a, b] = ds.split('–').map(s => DAY_A.indexOf(s.trim()))
    if (a >= 0 && b >= 0) for (let i = a; i <= b; i++) res.push(i)
  }
  ds.split(',').forEach(d => { const i = DAY_A.indexOf(d.trim()); if (i >= 0 && !res.includes(i)) res.push(i) })
  return res
}

const filtered = computed(() => filter.value === 'all' ? DOCTORS : DOCTORS.filter(d => d.spec === filter.value))
</script>

<template>
  <PageShell :show-back="true" :show-home="true">
    <div class="px-6 fhd:px-10 py-4 fhd:py-8 max-w-3xl fhd:max-w-4xl mx-auto">
      <div class="animate-fade-in text-center mb-5 fhd:mb-8">
        <div class="text-2xl fhd:text-4xl font-extrabold" style="color:#111FA2">{{ t('info.schedule') }}</div>
        <div class="text-sm fhd:text-xl mt-1 fhd:mt-2" style="color:#4a55a2">{{ t('info.scheduleSub') }}</div>
      </div>

      <!-- Filter chips -->
      <div class="flex gap-2 fhd:gap-3 overflow-x-auto py-2 fhd:py-3 mb-4 fhd:mb-6" style="scrollbar-width:none;">
        <button v-for="s in ['all', ...specs]" :key="s"
          @click="filter = s"
          class="kb flex-shrink-0 px-4 fhd:px-6 py-2 fhd:py-3.5 rounded-2xl fhd:rounded-3xl border-none text-xs fhd:text-lg font-bold cursor-pointer transition-all"
          :style="{
            background: filter === s ? 'linear-gradient(135deg,#111FA2,#5478FF)' : '#F3F4FF',
            color: filter === s ? '#fff' : '#4a55a2',
            boxShadow: filter === s ? '0 3px 10px rgba(84,120,255,0.25)' : 'none',
          }">
          {{ s === 'all' ? t('info.all') : s }}
        </button>
      </div>

      <!-- Doctor cards -->
      <div class="flex flex-col gap-3 fhd:gap-5">
        <div v-for="(doc, i) in filtered" :key="doc.id"
          class="animate-fade-in" :style="{ animationDelay: `${i*35}ms` }">
          <div class="rounded-2xl fhd:rounded-3xl border overflow-hidden flex bg-white"
            style="box-shadow: 0 2px 12px rgba(17,31,162,0.06); border-color:#e4e6f8;">
            <div class="w-1.5 fhd:w-2.5 flex-shrink-0" style="background: linear-gradient(180deg,#111FA2,#5478FF);" />
            <div class="flex-1 p-4 fhd:p-7">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-extrabold text-sm fhd:text-xl" style="color:#0d1240">{{ doc.name }}</div>
                  <div class="flex items-center gap-1.5 fhd:gap-2.5 mt-0.5 fhd:mt-1">
                    <DeptIcon :name="doc.spec" :size="12" color="#5478FF" />
                    <span class="text-xs fhd:text-lg font-semibold" style="color:#5478FF">{{ doc.spec }}</span>
                  </div>
                </div>
                <div class="text-right text-xs fhd:text-lg" style="color:#4a55a2">
                  <div>Каб. {{ doc.room }}</div>
                  <div>Эт. {{ doc.floor }}</div>
                </div>
              </div>

              <!-- Day bars -->
              <div class="flex gap-1 fhd:gap-2 mt-3 fhd:mt-5">
                <div v-for="(day, idx) in DAY_A" :key="idx" class="flex-1 flex flex-col items-center gap-1 fhd:gap-2">
                  <div class="text-[8px] fhd:text-sm font-bold"
                    :style="{ color: [...parseDays(doc.days), ...parseDays(doc.days2)].includes(idx) ? '#111FA2' : '#c8ccee' }">
                    {{ day }}
                  </div>
                  <div class="w-full h-1.5 fhd:h-3 rounded"
                    :style="{ background: [...parseDays(doc.days), ...parseDays(doc.days2)].includes(idx) ? 'linear-gradient(90deg,#111FA2,#5478FF)' : '#e4e6f8' }" />
                </div>
              </div>

              <div class="mt-2 fhd:mt-4 text-xs fhd:text-lg" style="color:#4a55a2">
                {{ doc.days }} · {{ doc.hours }}
                <span v-if="doc.days2"> / {{ doc.days2 }} · {{ doc.hours2 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageShell>
</template>
