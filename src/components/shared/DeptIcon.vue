<script setup lang="ts">
defineProps<{ name: string; size?: number; color?: string }>()
</script>

<template>
  <svg :width="size ?? 18" :height="size ?? 18" viewBox="0 0 24 24" fill="none"
    :stroke="color ?? '#5E7572'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">

    <template v-if="name === 'Терапевт'">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </template>
    <template v-else-if="name === 'Инфекционист'">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </template>
    <template v-else-if="name === 'Гинеколог'">
      <circle cx="12" cy="8" r="4"/>
      <path d="M12 12v8M9 17h6"/>
    </template>
    <template v-else-if="name === 'Хирург'">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <path d="M14 2v6h6M12 18v-6M9 15h6"/>
    </template>
    <template v-else-if="name === 'Травматолог'">
      <path d="M9 3v6m6-6v6M3 9h18v2a9 9 0 01-18 0V9z"/>
      <path d="M9 22v-4m6 4v-4"/>
    </template>
    <template v-else-if="name === 'Кардиолог'">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </template>
    <template v-else-if="name === 'Офтальмолог'">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </template>
    <template v-else-if="name === 'ЛОР'">
      <path d="M7 4a8 8 0 018 8 5 5 0 01-5 5c-1.657 0-3-1.343-3-3 0-1.105.895-2 2-2s2 .895 2 2"/>
    </template>
    <template v-else>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </template>
  </svg>
</template>
