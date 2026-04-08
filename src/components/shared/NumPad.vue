<script setup lang="ts">
const props = defineProps<{ modelValue: string; max?: number }>()
const emit = defineEmits<{ 'update:modelValue': [v: string]; submit: [] }>()

function press(k: string) {
  if (k === '⌫') {
    emit('update:modelValue', props.modelValue.slice(0, -1))
  } else if (k === '✓') {
    emit('submit')
  } else if (props.modelValue.length < (props.max ?? 12)) {
    emit('update:modelValue', props.modelValue + k)
  }
}

const ready = () => props.modelValue.length === (props.max ?? 12)
</script>

<template>
  <div class="grid grid-cols-3 gap-2 w-full">
    <button
      v-for="k in ['1','2','3','4','5','6','7','8','9','⌫','0','✓']"
      :key="k"
      class="kb numpad-btn h-[52px] fhd:h-[76px] rounded-[13px] fhd:rounded-[18px] border-none font-bold cursor-pointer flex items-center justify-center text-[19px] fhd:text-[26px] transition-all"
      :style="{
        background: k === '✓' ? (ready() ? 'linear-gradient(135deg,#1565C0,#42A5F5)' : '#DAEAF6') : '#F2F6FA',
        color: k === '✓' ? (ready() ? '#fff' : '#90B0CC') : k === '⌫' ? '#4A6A8A' : '#1B2840',
        fontFamily: 'Nunito Sans, sans-serif',
        boxShadow: k === '✓' && ready() ? '0 4px 12px rgba(21,101,192,0.25)' : k !== '✓' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
      }"
      @click="press(k)"
    >
      <!-- Backspace icon -->
      <svg v-if="k === '⌫'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/>
        <path d="M18 9l-6 6M12 9l6 6"/>
      </svg>
      <!-- Confirm icon -->
      <svg v-else-if="k === '✓'" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span v-else>{{ k }}</span>
    </button>
  </div>
</template>
