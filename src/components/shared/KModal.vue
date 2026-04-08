<script setup lang="ts">
defineEmits<{ close: [] }>()
</script>

<template>
  <div class="animate-overlay absolute inset-0 z-30 flex items-center justify-center p-3"
    style="background: rgba(15,30,26,0.5);"
    @click.self="$emit('close')">
    <div class="animate-pop-in bg-white rounded-[20px] fhd:rounded-[32px] w-full max-w-[340px] fhd:max-w-[600px] max-h-[92%] overflow-y-auto"
      style="box-shadow: 0 8px 32px rgba(0,0,0,0.12);">
      <slot />
    </div>
  </div>
</template>
