import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const videos = import.meta.glob('/src/assets/video/*.mp4', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>

export function vid(name: string): string {
  return videos[`/src/assets/video/${name}.mp4`] ?? videos['/src/assets/video/idle.mp4'] ?? ''
}

// Текст бабла (когда звук выключен) для каждой страницы
// ru — русский, kz — казахский
const subtitleMap: Record<string, { ru: string; kz: string }> = {
  welcome:      { ru: 'Добро пожаловать!',                          kz: 'Қош келдіңіз!' },
  lang:         { ru: 'Выберите язык',                              kz: 'Тілді таңдаңыз' },
  home:         { ru: 'Выберите нужную услугу',                     kz: 'Қажетті қызметті таңдаңыз' },
  book:         { ru: 'Введите ваш ИИН',                           kz: 'ЖСН енгізіңіз' },
  depts:        { ru: 'Выберите специальность',                     kz: 'Мамандықты таңдаңыз' },
  services:     { ru: 'Выберите услугу',                            kz: 'Қызметті таңдаңыз' },
  docs:         { ru: 'Выберите удобное время',                     kz: 'Ыңғайлы уақытты таңдаңыз' },
  'book-ok':    { ru: 'Запись подтверждена!',                       kz: 'Жазылу расталды!' },
  osms:         { ru: 'Проверьте статус страховки',                 kz: 'Сақтандыру мәртебесін тексеріңіз' },
  'osms-check': { ru: 'Введите ИИН для проверки ОСМС',             kz: 'МӘМС тексеру үшін ЖСН енгізіңіз' },
  info:         { ru: 'Выберите раздел справочной',                 kz: 'Анықтама бөлімін таңдаңыз' },
  'info-faq':   { ru: 'Часто задаваемые вопросы',                  kz: 'Жиі қойылатын сұрақтар' },
  'info-sched': { ru: 'Расписание врачей',                         kz: 'Дәрігерлер кестесі' },
  'info-nav':   { ru: 'Навигация по клинике',                      kz: 'Емхана бойынша навигация' },
  'info-npa':   { ru: 'Нормативные документы',                     kz: 'Нормативтік құжаттар' },
  queue:        { ru: 'Получите талон электронной очереди',         kz: 'Электрондық кезек талонын алыңыз' },
  profile:      { ru: 'Личный кабинет',                            kz: 'Жеке кабинет' },
  ai:           { ru: 'Спросите меня о поликлинике',               kz: 'Емхана туралы сұраңыз' },
}

const routeMap: Record<string, { ru: string; kz: string }> = {
  welcome:         { ru: 'idle',                kz: 'idle' },
  lang:            { ru: 'asel-welcome-lang',   kz: 'asel-welcome-lang' },
  home:            { ru: 'main-menu-ru',        kz: 'main-menu-kz' },
  book:            { ru: 'book-auth-ru',        kz: 'book-auth-kz' },
  depts:           { ru: 'book-specialty-ru',   kz: 'book-specialty-kz' },
  docs:            { ru: 'book-slot-ru',        kz: 'book-slot-kz' },
  'book-slot':     { ru: 'book-slot-ru',        kz: 'book-slot-kz' },
  'book-confirm':  { ru: 'book-confirm-ru',     kz: 'book-confirm-kz' },
  'book-ok':       { ru: 'book-success-ru',     kz: 'book-success-kz' },
  osms:            { ru: 'osms-menu-ru',        kz: 'osms-menu-kz' },
  'osms-check':    { ru: 'osms-check-ru',       kz: 'osms-check-kz' },
  'osms-faq':      { ru: 'osms-faq-ru',         kz: 'osms-faq-kz' },
  'osms-result':   { ru: 'osms-result-ok-ru',   kz: 'osms-result-ok-kz' },
  info:            { ru: 'info-ru',             kz: 'info-kz' },
  'info-faq':      { ru: 'info-faq-ru',         kz: 'info-faq-kz' },
  'info-sched':    { ru: 'info-sched-ru',       kz: 'info-sched-kz' },
  'info-nav':      { ru: 'info-nav-ru',         kz: 'info-nav-kz' },
  'info-npa':      { ru: 'info-npa-ru',         kz: 'info-npa-kz' },
  queue:           { ru: 'idle',                kz: 'idle' },
  profile:         { ru: 'idle',                kz: 'idle' },
  ai:              { ru: 'idle',                kz: 'idle' },
}

const IDLE_DURATION = 30_000

export function usePageVideo() {
  const route = useRoute()
  const { locale } = useI18n()
  const state = ref<'main' | 'idle'>('main')
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  const mainSrc = computed(() => {
    const entry = routeMap[route.name as string]
    if (!entry) return vid('idle')
    const lang = locale.value === 'kk' ? 'kz' : 'ru'
    return vid(entry[lang])
  })

  // welcome — это сам экран idle, цикличность не нужна
  const isWelcome = computed(() => route.name === 'welcome')

  const videoSrc = computed(() =>
    (!isWelcome.value && state.value === 'idle') ? vid('idle') : mainSrc.value
  )

  const isLoop = computed(() => isWelcome.value || state.value === 'idle')

  function onVideoEnded() {
    if (isWelcome.value || state.value !== 'main') return
    state.value = 'idle'
    idleTimer = setTimeout(() => { state.value = 'main' }, IDLE_DURATION)
  }

  // При смене роута или языка — сразу возврат к основному видео
  watch([() => route.name, locale], () => {
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null }
    state.value = 'main'
  })

  onUnmounted(() => {
    if (idleTimer) clearTimeout(idleTimer)
  })

  const pageSubtitle = computed(() => {
    const entry = subtitleMap[route.name as string]
    if (!entry) return undefined
    const lang = locale.value === 'kk' ? 'kz' : 'ru'
    return entry[lang]
  })

  return { videoSrc, isLoop, onVideoEnded, pageSubtitle }
}
