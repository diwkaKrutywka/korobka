import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const lang = ref<'ru' | 'kk'>('ru')
  const showPhoneBadge = ref(true)
  const theme = ref<'light' | 'dark'>('light')

  function setLang(l: 'ru' | 'kk') {
    lang.value = l
  }

  function toggleLang() {
    lang.value = lang.value === 'ru' ? 'kk' : 'ru'
  }

  function dismissPhoneBadge() {
    showPhoneBadge.value = false
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { lang, showPhoneBadge, theme, setLang, toggleLang, dismissPhoneBadge, toggleTheme }
})
