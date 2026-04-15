import { ref } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketData {
  patientName:     string
  iin?:            string
  doctorName:      string
  specialtyName?:  string
  serviceName:     string
  /** Raw ISO date-time from the booking, e.g. "2026-04-16T10:30:00" */
  appointmentTime?: string | null
  cabinet?:        string
  appointmentId?:  number | string | null
  /** vue-i18n locale: 'ru' | 'kk' */
  locale?:         string
}

export type PrintStatus = 'idle' | 'loading' | 'success' | 'error'

// ─── window.terminal bridge (injected by Electron preload) ───────────────────

interface TerminalBridge {
  print(payload: {
    ticketNo?:  string | number | null
    fio:        string
    iin?:       string
    doctor:     string
    specialty?: string
    service?:   string
    date:       string
    dateShort:  string
    dayOfWeek:  string
    time:       string
    cabinet?:   string
    locale?:    string
  }): Promise<{ ok: boolean; error?: string; mode?: string; bytes?: number }>
}

function getBridge(): TerminalBridge | undefined {
  return (window as unknown as { terminal?: TerminalBridge }).terminal
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const RU_DAYS   = ['воскресенье', 'понедельник', 'вторник',  'среда',    'четверг',  'пятница',  'суббота']
const KK_DAYS   = ['жексенбі',   'дүйсенбі',   'сейсенбі', 'сәрсенбі', 'бейсенбі', 'жұма',     'сенбі']

// Manual month arrays — avoids reliance on kk-KZ locale support in Node/Chromium
const RU_MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const KK_MONTHS = ['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан']

function formatTicketDate(iso: string, locale = 'ru') {
  const d    = new Date(iso)
  const isKk = locale === 'kk'
  const months = isKk ? KK_MONTHS : RU_MONTHS
  const day   = d.getDate()
  const month = months[d.getMonth()]
  const year  = d.getFullYear()

  return {
    date:      `${day} ${month} ${year}`,
    dateShort: `${day} ${month}`,
    dayOfWeek: (isKk ? KK_DAYS : RU_DAYS)[d.getDay()],
    time:      d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
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

    const locale     = data.locale ?? 'ru'
    const dateFields = data.appointmentTime
      ? formatTicketDate(data.appointmentTime, locale)
      : { date: '—', dateShort: '—', dayOfWeek: '—', time: '—' }

    try {
      const result = await bridge.print({
        ticketNo:  data.appointmentId ?? null,
        fio:       data.patientName,
        doctor:    data.doctorName,
        specialty: data.specialtyName,
        service:   data.serviceName,
        cabinet:   data.cabinet,
        locale,
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
