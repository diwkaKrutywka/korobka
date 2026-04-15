import { ref } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Data passed from the booking view */
export interface TicketData {
  patientName:    string
  doctorName:     string
  specialtyName?: string
  serviceName:    string
  /** Raw ISO date-time string from the booking, e.g. "2026-04-16T10:30:00" */
  appointmentTime?: string | null
  cabinet?:       string
  appointmentId?: number | string | null
}

export type PrintStatus = 'idle' | 'loading' | 'success' | 'error'

// ─── window.terminal bridge (injected by Electron preload) ───────────────────

interface TerminalBridge {
  print(payload: {
    ticketNo?:  string | number | null
    fio:        string
    doctor:     string
    specialty?: string
    service?:   string
    date:       string
    dateShort:  string
    dayOfWeek:  string
    time:       string
    cabinet?:   string
  }): Promise<{ ok: boolean; error?: string; mode?: string; bytes?: number }>
}

function getBridge(): TerminalBridge | undefined {
  return (window as unknown as { terminal?: TerminalBridge }).terminal
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const RU_DAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

function formatTicketDate(iso: string) {
  const d = new Date(iso)
  return {
    date:      d.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' }),
    dateShort: d.toLocaleDateString('ru', { day: 'numeric', month: 'long' }),
    dayOfWeek: RU_DAYS[d.getDay()],
    time:      d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
  }
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useThermalPrint() {
  const printStatus = ref<PrintStatus>('idle')
  const printError  = ref('')

  async function printTicket(data: TicketData) {
    printStatus.value = 'loading'
    printError.value  = ''

    const bridge = getBridge()
    if (!bridge) {
      printError.value  = 'Electron недоступен — запустите приложение через Electron'
      printStatus.value = 'error'
      return
    }

    // Build date fields from raw ISO string (preferred) or fall back to "—"
    const dateFields = data.appointmentTime
      ? formatTicketDate(data.appointmentTime)
      : { date: '—', dateShort: '—', dayOfWeek: '—', time: '—' }

    try {
      const result = await bridge.print({
        ticketNo:  data.appointmentId ?? null,
        fio:       data.patientName,
        doctor:    data.doctorName,
        specialty: data.specialtyName,
        service:   data.serviceName,
        cabinet:   data.cabinet,
        ...dateFields,
      })

      if (!result.ok) throw new Error(result.error ?? 'Ошибка печати')

      console.info('[print] ok — mode:', result.mode, 'bytes:', result.bytes)
      printStatus.value = 'success'
    } catch (e: unknown) {
      printError.value  = e instanceof Error ? e.message : String(e)
      printStatus.value = 'error'
      console.error('[print]', printError.value)
    }
  }

  return { printStatus, printError, printTicket }
}
