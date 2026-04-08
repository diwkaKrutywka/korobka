<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import PageShell from '@/components/shared/PageShell.vue'
import KModal from '@/components/shared/KModal.vue'

const { t } = useI18n()
const appStore = useAppStore()

const BASE_URL = 'https://terminal.dev.medcontact.kz/orginfo/api/v1/public/npa'
const langMap: Record<string, string> = { ru: 'ru', kz: 'kk' }
const apiHeaders = () => ({
  'Accept-Language': langMap[appStore.lang] ?? 'ru',
  'ngrok-skip-browser-warning': 'true',
})

interface NpaItem {
  id: number
  slug: string
  name: string
  link: string
  content: string
  sort_order: number
}

interface NpaDoc {
  id: number
  name: string
  link: string
  content: string
  file_url: string
}

const items = ref<NpaItem[]>([])
const loading = ref(false)
const openId = ref<number | null>(null)

const docModal = ref<NpaDoc | null>(null)
const docLoading = ref(false)

async function openDoc(id: number) {
  docLoading.value = true
  docModal.value = null
  try {
    const res = await fetch(`${BASE_URL}/document/${id}`, { headers: apiHeaders() })
    if (!res.ok) return
    docModal.value = await res.json()
  } finally {
    docLoading.value = false
  }
}

async function fetchNpa() {
  loading.value = true
  try {
    const res = await fetch(`${BASE_URL}/?page=1&limit=50`, {
      headers: apiHeaders(),
    })
    const data = await res.json()
    items.value = data.items ?? []
  } finally {
    loading.value = false
  }
}

onMounted(fetchNpa)

watch(() => appStore.lang, () => {
  items.value = []
  openId.value = null
  fetchNpa()
})
</script>

<template>
  <PageShell :show-back="true" :show-home="true">
    <div class="px-6 fhd:px-10 py-4 fhd:py-8 max-w-2xl fhd:max-w-4xl mx-auto">

      <div class="animate-fade-in text-center mb-6 fhd:mb-10">
        <div class="text-2xl fhd:text-4xl font-extrabold" style="color:#111FA2">{{ t('info.npa') }}</div>
        <div class="text-sm fhd:text-xl mt-1 fhd:mt-2" style="color:#4a55a2">{{ t('info.npaSub') }}</div>
      </div>

      <div v-if="loading" class="flex justify-center py-10 fhd:py-16">
        <div class="w-8 h-8 fhd:w-14 fhd:h-14 rounded-full border-2 fhd:border-4 border-[#5478FF] border-t-transparent animate-spin" />
      </div>

      <div v-else class="flex flex-col gap-2 fhd:gap-4">
        <div v-for="(item, i) in items" :key="item.id"
          class="animate-fade-in" :style="{ animationDelay: `${i * 35}ms` }">

          <!-- Header row -->
          <button
            @click="openId = openId === item.id ? null : item.id"
            class="kb w-full flex items-center justify-between px-4 fhd:px-7 py-3.5 fhd:py-6 rounded-2xl fhd:rounded-3xl border text-sm fhd:text-xl font-semibold cursor-pointer text-left transition-all"
            :style="{
              background: openId === item.id ? '#E8EBFF' : '#F3F4FF',
              border: `1.5px solid ${openId === item.id ? '#5478FF' : '#e4e6f8'}`,
              color: '#0d1240',
            }"
          >
            <span class="flex items-center gap-3 fhd:gap-5">
              <div class="w-8 h-8 fhd:w-14 fhd:h-14 rounded-xl fhd:rounded-2xl flex items-center justify-center flex-shrink-0"
                :style="{ background: openId === item.id ? '#5478FF' : '#dde1ff' }">
                <svg class="npa-icon" viewBox="0 0 24 24" fill="none"
                  :stroke="openId === item.id ? '#fff' : '#5478FF'"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
              </div>
              {{ item.name }}
            </span>
            <span class="flex-shrink-0 ml-2 fhd:text-2xl transition-transform" style="color:#5478FF"
              :style="{ transform: openId === item.id ? 'rotate(180deg)' : '' }">▾</span>
          </button>

          <!-- Expanded content -->
          <div v-if="openId === item.id"
            class="animate-fade-in px-4 fhd:px-7 py-3 fhd:py-5 border-l-4 ml-2 fhd:ml-3 mt-1 fhd:mt-2 rounded-r-xl fhd:rounded-r-2xl text-sm fhd:text-xl leading-relaxed"
            style="border-color:#5478FF; background:#F8F9FF; color:#4a55a2;">
            <p v-if="item.content" class="mb-3 fhd:mb-5">{{ item.content }}</p>
            <button
              class="kb inline-flex items-center gap-1.5 fhd:gap-3 font-semibold text-xs fhd:text-lg px-3 fhd:px-5 py-1.5 fhd:py-3 rounded-lg fhd:rounded-xl border-none cursor-pointer"
              style="background:#5478FF; color:#fff;"
              :style="{ opacity: docLoading ? 0.6 : 1 }"
              :disabled="docLoading"
              @click="openDoc(item.id)"
            >
              <svg class="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
              {{ t('info.openDoc') }}
            </button>
          </div>

        </div>

        <div v-if="!loading && items.length === 0"
          class="text-center py-8 fhd:py-14 text-sm fhd:text-xl" style="color:#6b72c9">
          {{ t('info.noDocs') }}
        </div>
      </div>

    </div>

    <!-- Document modal -->
    <KModal v-if="docModal" @close="docModal = null">
      <div class="p-5 fhd:p-10">
        <div class="font-extrabold text-sm fhd:text-2xl mb-3 fhd:mb-6" style="color:#111FA2">{{ docModal.name }}</div>
        <div class="text-sm fhd:text-xl leading-relaxed mb-4 fhd:mb-7" style="color:#4a55a2; max-height:55vh; overflow-y:auto; white-space:pre-wrap;">{{ docModal.content }}</div>
        <a v-if="docModal.file_url" :href="docModal.file_url" target="_blank"
          class="inline-flex items-center gap-1.5 fhd:gap-3 font-semibold text-xs fhd:text-xl px-3 fhd:px-6 py-2 fhd:py-4 rounded-xl fhd:rounded-2xl mb-3 fhd:mb-5"
          style="background:#E8EBFF; color:#111FA2;">
          <svg class="dl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Скачать файл
        </a>
        <button class="kb w-full py-2.5 fhd:py-5 rounded-xl fhd:rounded-2xl text-xs fhd:text-xl font-bold border-none cursor-pointer"
          style="background:#F3F4FF; color:#5478FF;"
          @click="docModal = null">
          Закрыть
        </button>
      </div>
    </KModal>

  </PageShell>
</template>

<style scoped>
.npa-icon { width: 15px; height: 15px; }
.doc-icon { width: 13px; height: 13px; }
.dl-icon  { width: 13px; height: 13px; }

@media (min-width: 1000px) and (min-height: 1600px) {
  .npa-icon { width: 28px; height: 28px; }
  .doc-icon { width: 22px; height: 22px; }
  .dl-icon  { width: 24px; height: 24px; }
}
</style>
