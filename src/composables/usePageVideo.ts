import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const videos = import.meta.glob('/src/assets/video/*.mp4', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>

export function vid(name: string): string {
  return videos[`/src/assets/video/${name}.mp4`] ?? videos['/src/assets/video/idle.mp4'] ?? ''
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

  return { videoSrc, isLoop, onVideoEnded }
}
