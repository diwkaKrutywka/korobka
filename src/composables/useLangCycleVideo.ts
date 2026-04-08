import { ref, computed, onUnmounted } from 'vue'

const videos = import.meta.glob('/src/assets/video/*.mp4', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>

function vid(name: string): string {
  return videos[`/src/assets/video/${name}.mp4`] ?? videos['/src/assets/video/idle.mp4'] ?? ''
}

const IDLE_DURATION = 30_000

export function useLangCycleVideo() {
  const state = ref<'main' | 'idle'>('main')
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  const videoSrc = computed(() =>
    state.value === 'idle' ? vid('idle') : vid('asel-welcome-lang')
  )

  const isLoop = computed(() => state.value === 'idle')

  function onVideoEnded() {
    if (state.value !== 'main') return
    state.value = 'idle'
    idleTimer = setTimeout(() => {
      state.value = 'main'
    }, IDLE_DURATION)
  }

  onUnmounted(() => {
    if (idleTimer) clearTimeout(idleTimer)
  })

  return { videoSrc, isLoop, onVideoEnded }
}
