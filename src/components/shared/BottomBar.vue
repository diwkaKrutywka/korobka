<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  showBack?: boolean
  showHome?: boolean
}>()

const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

function goBack() { router.back() }
function goHome() { router.push('/home') }
function toggleLang() {
  appStore.toggleLang()
  // sync i18n locale
}
</script>

<template>
  <div class="flex items-center gap-1.5 px-3 py-1.5 border-t border-border-light bg-white absolute bottom-0 left-0 right-0 z-10">
    <button v-if="showBack" @click="goBack"
      class="kb px-3 py-1.5 rounded-full text-[11px] font-bold text-pri border border-pri/40 bg-transparent cursor-pointer">
      {{ t('nav.back') }}
    </button>
    <button v-if="showHome" @click="goHome"
      class="kb px-3 py-1.5 rounded-full text-[11px] font-bold text-pri border border-pri/40 bg-transparent cursor-pointer">
      {{ t('nav.home') }}
    </button>
    <div class="flex-1" />
    <button @click="toggleLang"
      class="kb px-2 py-1.5 rounded-full text-[11px] font-bold min-w-[38px] cursor-pointer"
      style="background: linear-gradient(135deg, #111FA2 0%, #5478FF 100%); color: #fff; border: none;">
      {{ appStore.lang === 'ru' ? 'Қаз' : 'Рус' }}
    </button>
    <div class="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
      style="background: linear-gradient(135deg, #111FA2 0%, #5478FF 100%);">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/>
      </svg>
    </div>
  </div>
</template>
