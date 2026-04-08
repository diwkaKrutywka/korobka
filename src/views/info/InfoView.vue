<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageShell from '@/components/shared/PageShell.vue'

const router = useRouter()
const { t } = useI18n()

const items = [
  {
    route: '/info/faq',
    delay: .07,
    gradient: 'linear-gradient(145deg,#0d1785,#2a4fff)',
    shadow: '0 6px 20px rgba(13,23,133,0.45)',
    icon: new URL('../../assets/help.svg', import.meta.url).href,
    iconFilter: 'brightness(0) invert(1)',
    nKey: 'info.faq',
    sKey: 'info.faqSub',
  },
  {
    route: '/info/sched',
    delay: .12,
    gradient: 'linear-gradient(145deg,#1246a8,#3b7ef5)',
    shadow: '0 6px 20px rgba(18,70,168,0.4)',
    icon: new URL('../../assets/icon2.svg', import.meta.url).href,
    iconFilter: 'brightness(0) invert(1)',
    nKey: 'info.schedule',
    sKey: 'info.scheduleSub',
  },
  {
    route: '/info/nav',
    delay: .17,
    gradient: 'linear-gradient(145deg,#0d3b7a,#2563eb)',
    shadow: '0 6px 20px rgba(13,59,122,0.4)',
    icon: new URL('../../assets/help.svg', import.meta.url).href,
    iconFilter: 'brightness(0) invert(1)',
    nKey: 'info.nav',
    sKey: 'info.navSub',
  },
  {
    route: '/info/npa',
    delay: .22,
    gradient: 'linear-gradient(145deg,#0a4080,#1d6fd6)',
    shadow: '0 6px 20px rgba(10,64,128,0.4)',
    icon: new URL('../../assets/help.svg', import.meta.url).href,
    iconFilter: 'brightness(0) invert(1)',
    nKey: 'info.npa',
    sKey: 'info.npaSub',
  },
]
</script>

<template>
  <PageShell :show-back="true" :show-home="true">
    <div class="px-6 fhd:px-10 py-8 fhd:py-12 max-w-2xl fhd:max-w-4xl mx-auto">

      <!-- Header -->
      <div class="animate-fade-in text-center mb-6 fhd:mb-10">
        <h1 class="text-2xl fhd:text-4xl font-extrabold" style="color:#111FA2">
          {{ t('info.title') }}
        </h1>
        <div class="text-sm fhd:text-xl mt-1 fhd:mt-3" style="color:#4a55a2">
          {{ t('info.sub') }}
        </div>
      </div>

      <!-- Cards -->
      <div class="grid grid-cols-2 gap-3 fhd:gap-6">
        <button
          v-for="item in items"
          :key="item.route"
          @click="router.push(item.route)"
          class="kb animate-fade-in flex flex-col gap-3 fhd:gap-5 rounded-2xl fhd:rounded-3xl cursor-pointer text-start
                 transition-all active:scale-[0.97] py-6 fhd:py-10 px-4 fhd:px-7 hover:brightness-110 hover:shadow-xl"
          :style="{
            background: item.gradient,
            boxShadow: item.shadow,
            animationDelay: `${item.delay}s`,
          }"
        >
          <img :src="item.icon" class="w-7 h-7 fhd:w-14 fhd:h-14" />
          <div>
            <div class="font-extrabold text-lg fhd:text-2xl leading-tight text-white">
              {{ t(item.nKey) }}
            </div>
            <div class="text-sm fhd:text-lg mt-1 fhd:mt-2" style="color:rgba(255,255,255,0.7)">
              {{ t(item.sKey) }}
            </div>
          </div>
        </button>
      </div>

    </div>
  </PageShell>
</template>
