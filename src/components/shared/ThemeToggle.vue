<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <button
    @click="appStore.toggleTheme()"
    class="kb w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
    :class="appStore.theme === 'dark'
      ? 'bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30'
      : 'bg-white/10 text-white hover:bg-white/20'"
    :title="appStore.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
  >
    <!-- Sun: shown in dark mode (click to go light) -->
    <svg v-if="appStore.theme === 'dark'" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
    <!-- Moon: shown in light mode (click to go dark) -->
    <svg v-else width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  </button>
</template>
