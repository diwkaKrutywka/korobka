import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const videos = import.meta.glob('/src/assets/video/*.mp4', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>

function vid(name: string): string {
  return videos[`/src/assets/video/${name}.mp4`] ?? videos['/src/assets/video/idle.mp4'] ?? ''
}

const routeMap: Record<string, { ru: string; kz: string }> = {
  welcome:      { ru: 'idle',                               kz: 'idle' },
  lang:         { ru: 'idle',                               kz: 'idle' },
  home:         { ru: 'home_new_ru-0',                     kz: 'home_new_kz-1' },
  book:         { ru: 'registration_ru',                   kz: 'registration_kz' },
  depts:        { ru: 'search_ru',                         kz: 'search_kz' },
  docs:         { ru: 'doctors-authorized_ru',             kz: 'doctors-authorized_kz' },
  'book-ok':    { ru: 'registration_confirmation_ru',      kz: 'registration_confirmation_kz' },
  osms:         { ru: 'IDcheck_ru',                        kz: 'IDcheck_kz' },
  info:         { ru: 'info_about_services_questions_ru',  kz: 'info_about_services_questions_kz' },
  'info-faq':   { ru: 'info_about_services_questions_ru',  kz: 'info_about_services_questions_kz' },
  'info-sched': { ru: 'info_about_services_charters_ru',   kz: 'info_about_services_charters_kz' },
  'info-nav':   { ru: 'info_about_services_charters_ru',   kz: 'info_about_services_charters_kz' },
  queue:        { ru: 'talon_ru',                          kz: 'talon_kz' },
  profile:      { ru: 'doctors-authorized_ru',             kz: 'doctors-authorized_kz' },
  ai:           { ru: 'idle',                              kz: 'idle' },
}

export function usePageVideo() {
  const route = useRoute()
  const { locale } = useI18n()

  const videoSrc = computed(() => {
    const entry = routeMap[route.name as string]
    if (!entry) return vid('idle')
    const lang = locale.value === 'kk' ? 'kz' : 'ru'
    return vid(entry[lang])
  })

  return { videoSrc }
}
