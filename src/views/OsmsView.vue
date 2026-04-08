<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import PageShell from '@/components/shared/PageShell.vue'

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()

const BASE_URL = 'https://terminal.dev.medcontact.kz/orginfo/api/v1/public/faq'
const TENANT_ID = '00000000-0000-4000-a000-000000000001'

const apiHeaders = () => ({
  'Accept-Language': appStore.lang,
  'ngrok-skip-browser-warning': 'true',
  'x-tenant-id': TENANT_ID,
  'X-Service-Binding-Alias': 'terminal',
})

interface FaqCategory {
  id: number
  slug: string
  name: string
  sort_order: number
  children: FaqCategory[]
}

interface FaqItem {
  id: number
  question: string
  answer: string
  sort_order: number
}

type View = 'menu' | 'categories' | 'items'
const view = ref<View>('menu')
const openQ = ref<number | null>(null)

const categories = ref<FaqCategory[]>([])
const items = ref<FaqItem[]>([])
const selectedCat = ref<FaqCategory | null>(null)
const loadingCats = ref(false)
const loadingItems = ref(false)

async function openFaq() {
  view.value = 'categories'
  if (categories.value.length) return
  loadingCats.value = true
  try {
    const res = await fetch(`${BASE_URL}/categories?page=1&limit=20&is_osms=true`, {
      headers: apiHeaders(),
    })
    const data = await res.json()
    categories.value = data.items ?? []
  } finally {
    loadingCats.value = false
  }
}

async function selectCategory(cat: FaqCategory) {
  selectedCat.value = cat
  openQ.value = null
  items.value = []
  view.value = 'items'
  loadingItems.value = true
  try {
    const res = await fetch(`${BASE_URL}/items?category_id=${cat.id}`, {
      headers: apiHeaders(),
    })
    const data = await res.json()
    items.value = data.items ?? []
  } finally {
    loadingItems.value = false
  }
}

function goBack() {
  if (view.value === 'items') {
    view.value = 'categories'
    selectedCat.value = null
    openQ.value = null
  } else {
    view.value = 'menu'
  }
}

watch(() => appStore.lang, () => {
  categories.value = []
  items.value = []
  openQ.value = null
  selectedCat.value = null
  if (view.value !== 'menu') view.value = 'categories'
  if (view.value === 'categories') openFaq()
})
</script>

<template>
  <PageShell :show-back="view !== 'menu'" :show-home="true" @back="goBack">

    <!-- Category items -->
    <div v-if="view === 'items'" class="px-6 fhd:px-10 py-4 fhd:py-8 max-w-2xl fhd:max-w-4xl mx-auto">
      <div class="animate-fade-in text-center mb-5 fhd:mb-8">
        <div class="text-2xl fhd:text-4xl font-extrabold" style="color:#111FA2">{{ selectedCat?.name }}</div>
      </div>

      <div v-if="loadingItems" class="flex justify-center py-10">
        <div class="w-8 h-8 fhd:w-12 fhd:h-12 rounded-full border-2 border-[#5478FF] border-t-transparent animate-spin" />
      </div>

      <div v-else class="flex flex-col gap-2 fhd:gap-4">
        <div v-for="(item, i) in items" :key="item.id"
          class="animate-fade-in" :style="{ animationDelay: `${i * 35}ms` }">
          <button @click="openQ = openQ === item.id ? null : item.id"
            class="kb w-full flex items-center justify-between px-4 fhd:px-7 py-3.5 fhd:py-5 rounded-2xl fhd:rounded-3xl border text-sm fhd:text-xl font-semibold cursor-pointer text-left transition-all"
            :style="{
              background: openQ === item.id ? '#E8EBFF' : '#F3F4FF',
              border: `1.5px solid ${openQ === item.id ? '#5478FF' : '#e4e6f8'}`,
              color: '#0d1240',
            }">
            {{ item.question }}
            <span class="flex-shrink-0 ml-2 transition-transform text-lg fhd:text-2xl" style="color:#5478FF"
              :style="{ transform: openQ === item.id ? 'rotate(180deg)' : '' }">▾</span>
          </button>
          <div v-if="openQ === item.id"
            class="animate-fade-in px-4 fhd:px-7 py-3 fhd:py-5 text-sm fhd:text-xl leading-relaxed border-l-4 ml-2 mt-1 rounded-r-xl"
            style="border-color:#5478FF; background:#F8F9FF; color:#4a55a2;">
            {{ item.answer }}
          </div>
        </div>
        <div v-if="!loadingItems && items.length === 0"
          class="text-center py-8 text-sm fhd:text-xl" style="color:#6b72c9">
          {{ t('info.noItems') }}
        </div>
      </div>
    </div>

    <!-- FAQ categories -->
    <div v-else-if="view === 'categories'" class="px-6 fhd:px-10 py-4 fhd:py-8 max-w-2xl fhd:max-w-4xl mx-auto">
      <div class="animate-fade-in text-center mb-6 fhd:mb-10">
        <div class="text-2xl fhd:text-4xl font-extrabold" style="color:#111FA2">{{ t('osms.faqTitle') }}</div>
      </div>

      <div v-if="loadingCats" class="flex justify-center py-10">
        <div class="w-8 h-8 fhd:w-12 fhd:h-12 rounded-full border-2 border-[#5478FF] border-t-transparent animate-spin" />
      </div>

      <div v-else class="flex flex-col gap-2.5 fhd:gap-4">
        <div v-for="(c, i) in categories" :key="c.id"
          class="animate-fade-in" :style="{ animationDelay: `${i * 35}ms` }">
          <button @click="selectCategory(c)"
            class="kb w-full flex items-center justify-between px-5 fhd:px-8 py-4 fhd:py-6 rounded-2xl fhd:rounded-3xl border-none cursor-pointer font-bold text-white text-sm fhd:text-xl transition-all hover:opacity-90"
            style="background: linear-gradient(135deg,#111FA2,#5478FF); box-shadow: 0 3px 10px rgba(84,120,255,0.2);">
            <span class="flex items-center gap-3 fhd:gap-5">
              <div class="w-9 h-9 fhd:w-14 fhd:h-14 rounded-xl fhd:rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg width="17" height="17" class="fhd:w-7 fhd:h-7" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
              </div>
              {{ c.name }}
            </span>
            <span class="opacity-70 text-lg fhd:text-3xl">›</span>
          </button>
        </div>
        <div v-if="!loadingCats && categories.length === 0"
          class="text-center py-8 text-sm fhd:text-xl" style="color:#6b72c9">
          {{ t('info.noCategories') }}
        </div>
      </div>
    </div>

    <!-- Menu -->
    <div v-else class="px-6 fhd:px-10 py-18 fhd:py-20 max-w-2xl fhd:max-w-4xl mx-auto">
      <div class="animate-fade-in text-center mb-6 fhd:mb-10">
        <div class="text-2xl fhd:text-4xl font-extrabold" style="color:#111FA2">{{ t('osms.title') }}</div>
        <div class="text-sm fhd:text-xl mt-1 fhd:mt-3" style="color:#4a55a2">{{ t('osms.sub') }}</div>
      </div>

      <div class="grid grid-cols-2 gap-3 fhd:gap-6">
        <button @click="router.push('/osms/check')"
          class="kb animate-fade-in flex flex-col gap-3 fhd:gap-5 rounded-2xl fhd:rounded-3xl cursor-pointer text-start transition-all active:scale-[0.97] py-6 fhd:py-10 px-4 fhd:px-7 hover:brightness-110 hover:shadow-xl"
          style="background: linear-gradient(145deg,#0d1785,#2a4fff); box-shadow: 0 6px 20px rgba(13,23,133,0.45);">
          <img src="../assets/stra.png" class="w-7 h-7 fhd:w-14 fhd:h-14">
          <div>
            <div class="font-extrabold text-lg fhd:text-2xl leading-tight text-white">{{ t('osms.checkStatus') }}</div>
            <div class="text-sm fhd:text-lg mt-1 fhd:mt-2" style="color:rgba(255,255,255,0.7)">{{ t('osms.checkSub') }}</div>
          </div>
        </button>

        <button @click="openFaq()"
          class="kb animate-fade-in flex flex-col gap-3 fhd:gap-5 rounded-2xl fhd:rounded-3xl cursor-pointer text-start transition-all active:scale-[0.97] py-6 fhd:py-10 px-4 fhd:px-7 hover:brightness-110 hover:shadow-xl"
          style="background: linear-gradient(145deg,#1246a8,#3b7ef5); box-shadow: 0 6px 20px rgba(18,70,168,0.4); animation-delay:.06s">
          <img src="../assets/help.svg" class="w-7 h-7 fhd:w-14 fhd:h-14">
          <div>
            <div class="font-extrabold text-lg fhd:text-2xl leading-tight text-white">{{ t('osms.faqTitle') }}</div>
            <div class="text-sm fhd:text-lg mt-1 fhd:mt-2" style="color:rgba(255,255,255,0.7)">{{ t('osms.faqSub') }}</div>
          </div>
        </button>
      </div>

      <!-- Info card -->
      <div class="mt-5 fhd:mt-8 bg-white rounded-2xl fhd:rounded-3xl p-4 fhd:p-7 border" style="border-color:#e4e6f8; box-shadow: 0 2px 12px rgba(17,31,162,0.06);">
        <div class="flex gap-3 fhd:gap-5 items-start">
          <div class="w-8 h-8 fhd:w-14 fhd:h-14 rounded-lg fhd:rounded-2xl flex items-center justify-center flex-shrink-0" style="background:#E8EBFF;">
            <svg width="16" height="16" class="fhd:w-7 fhd:h-7" viewBox="0 0 24 24" fill="none" stroke="#111FA2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div class="text-sm fhd:text-xl leading-relaxed" style="color:#4a55a2">
            <strong style="color:#0d1240">{{ t('osms.what') }}</strong><br/>
            {{ t('osms.desc') }}
          </div>
        </div>
      </div>
    </div>

  </PageShell>
</template>
