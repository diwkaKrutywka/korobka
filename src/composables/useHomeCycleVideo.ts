import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const videos = import.meta.glob('/src/assets/video/*.mp4', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>

function vid(name: string): string {
  return videos[`/src/assets/video/${name}.mp4`] ?? videos['/src/assets/video/idle.mp4'] ?? ''
}

const IDLE_DURATION = 30_000

export function useHomeCycleVideo() {
  const { locale } = useI18n()
  const state = ref<'main' | 'idle'>('main')
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  const mainSrc = computed(() => {
    const lang = locale.value === 'kk' ? 'kz' : 'ru'
    return lang === 'ru' ? vid('main-menu-ru') : vid('main-menu-kz')
  })

  const videoSrc = computed(() =>
    state.value === 'idle' ? vid('idle') : mainSrc.value
  )

  const isLoop = computed(() => state.value === 'idle')

  function onVideoEnded() {
    if (state.value !== 'main') return
    state.value = 'idle'
    idleTimer = setTimeout(() => {
      state.value = 'main'
    }, IDLE_DURATION)
  }

  // Смена языка — сразу переключаем на главное видео
  watch(locale, () => {
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null }
    state.value = 'main'
  })

  onUnmounted(() => {
    if (idleTimer) clearTimeout(idleTimer)
  })

  return { videoSrc, isLoop, onVideoEnded }
}
