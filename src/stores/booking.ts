import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBookingStore = defineStore('booking', () => {
  const iin = ref('')
  const selectedDept = ref('')
  const selectedSpecialtyId = ref('')
  const selectedServiceId = ref('')
  const selectedServiceName = ref('')

  const serviceId = ref('')
  const serviceName = ref('')
  const specialistName = ref('')
  const appointmentTime = ref('')
  const appointmentId = ref<number | null>(null)
  const scheduleRecordId = ref<number | null>(null)
  const cabinet = ref('')

  function setIin(v: string) { iin.value = v }

  function setDept(name: string, id: string) {
    selectedDept.value = name
    selectedSpecialtyId.value = id
    selectedServiceId.value = ''
    selectedServiceName.value = ''
    serviceId.value = ''
    serviceName.value = ''
    specialistName.value = ''
    appointmentTime.value = ''
    appointmentId.value = null
    scheduleRecordId.value = null
  }

  function setService(id: string, name: string) {
    selectedServiceId.value = id
    selectedServiceName.value = name
  }

  function setBookingResult(params: {
    serviceId: string
    serviceName: string
    specialistName: string
    appointmentTime: string
    appointmentId: number
    scheduleRecordId: number
    cabinet: string
  }) {
    serviceId.value = params.serviceId
    serviceName.value = params.serviceName
    specialistName.value = params.specialistName
    appointmentTime.value = params.appointmentTime
    appointmentId.value = params.appointmentId
    scheduleRecordId.value = params.scheduleRecordId
    cabinet.value = params.cabinet
  }

  function reset() {
    iin.value = ''
    selectedDept.value = ''
    selectedSpecialtyId.value = ''
    selectedServiceId.value = ''
    selectedServiceName.value = ''
    serviceId.value = ''
    serviceName.value = ''
    specialistName.value = ''
    appointmentTime.value = ''
    appointmentId.value = null
    scheduleRecordId.value = null
    cabinet.value = ''
  }

  return {
    iin, selectedDept, selectedSpecialtyId, selectedServiceId, selectedServiceName,
    serviceId, serviceName, specialistName, appointmentTime,
    appointmentId, scheduleRecordId, cabinet,
    setIin, setDept, setService, setBookingResult, reset,
  }
})
