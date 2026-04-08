<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ThemeToggle from './ThemeToggle.vue'

defineProps<{ bg?: string }>()

const { locale } = useI18n()
const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 30000) })
onUnmounted(() => clearInterval(timer))

const localeCode = computed(() => locale.value === 'kk' ? 'kk-KZ' : 'ru-RU')

const currentTime = computed(() =>
  now.value.toLocaleTimeString(localeCode.value, { hour: '2-digit', minute: '2-digit' })
)
const currentDate = computed(() =>
  now.value.toLocaleDateString(localeCode.value, {  day: '2-digit', month: '2-digit' })
)
</script>

<template>
  <nav class="h-16 sm:h-20 lg:h-24 fhd:h-32 flex items-center justify-between px-4 sm:px-6 lg:px-8 fhd:px-14 w-full flex-shrink-0 border-b border-[#d5e9f7] "
    :style="{ background: bg ?? '#ffffff', boxShadow: '0 1px 8px rgba(21,101,192,0.06)' }">
    <div class="font-bold text-xl sm:text-2xl lg:text-3xl fhd:text-5xl leading-tight" style="color:#1565C0;">
      <div>{{ currentTime }}</div>
      <div class="text-xl sm:text-xl lg:text-3xl fhd:text-4xl font-bold" style="color:#64B0E8;">{{ currentDate }}</div>
    </div>
    <ThemeToggle />
  </nav>
</template>
