import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQueueStore = defineStore('queue', () => {
  const iin = ref('')
  const selectedService = ref<{ id: string; name: string; prefix: string } | null>(null)
  const ticket = ref<{ number: string; ahead: number } | null>(null)

  function setIin(v: string) { iin.value = v }
  function selectService(s: { id: string; name: string; prefix: string }) { selectedService.value = s }
  function issueTicket() {
    if (!selectedService.value) return
    const num = Math.floor(Math.random() * 20) + 1
    ticket.value = {
      number: `${selectedService.value.prefix}${String(num).padStart(3, '0')}`,
      ahead: Math.floor(Math.random() * 8),
    }
  }
  function reset() { iin.value = ''; selectedService.value = null; ticket.value = null }

  return { iin, selectedService, ticket, setIin, selectService, issueTicket, reset }
})
