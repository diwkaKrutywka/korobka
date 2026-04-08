import { createI18n } from 'vue-i18n'
import ru from './ru'
import kz from './kz'

export const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'ru',
  messages: { ru, kk: kz },
})
