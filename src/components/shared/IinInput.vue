<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import NumPad from './NumPad.vue'

const props = defineProps<{
  modelValue: string
  submitLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [val: string]
  'submit': []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center w-full">
    <!-- IIN blocks -->
    <div class="animate-fade-in flex gap-3 w-full">
      <div v-for="i in 3" :key="i"
        class="flex-1 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold tracking-widest transition-all"
        :style="{
          border: `2px solid ${modelValue.slice((i-1)*4,(i-1)*4+4) ? '#111FA2' : '#c8ccee'}`,
          background: modelValue.slice((i-1)*4,(i-1)*4+4) ? '#E8EBFF' : '#F3F4FF',
          color: '#111FA2',
        }">
        <span v-if="modelValue.slice((i-1)*4,(i-1)*4+4)">{{ modelValue.slice((i-1)*4,(i-1)*4+4) }}</span>
        <span v-else class="text-sm font-semibold tracking-widest opacity-25">····</span>
      </div>
    </div>

    <div class="mt-4 w-full">
      <NumPad :model-value="modelValue" :max="12"
        @update:model-value="emit('update:modelValue', $event)"
        @submit="emit('submit')" />
    </div>

    <button @click="emit('submit')"
      class="kb mt-4 w-full py-4 rounded-2xl text-base font-extrabold text-white border-none cursor-pointer transition-opacity"
      :style="{
        background: 'linear-gradient(135deg,#111FA2,#5478FF)',
        boxShadow: '0 4px 16px rgba(84,120,255,0.3)',
        opacity: modelValue.length === 12 ? 1 : 0.4,
      }">
      {{ submitLabel ?? t('booking.next') }}
    </button>
  </div>
</template>
