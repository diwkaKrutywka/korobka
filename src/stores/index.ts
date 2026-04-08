// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    iin: '' as string,
    isAuthenticated: false,
    user: null as any,
    accessToken: null as string | null,
    refreshToken: null as string | null
  }),
  getters: {
    isLoggedIn: (state) => {
      const result = state.isAuthenticated && !!state.accessToken && !!state.refreshToken;
      return result;
    }
  },
  actions: {
    setIin(value: string) {
      this.iin = value
    },
    clearIin() {
      this.iin = ''
      // Дополнительная очистка из localStorage и sessionStorage
      localStorage.removeItem('iin')
      sessionStorage.removeItem('iin')
    },
    setUser(userData: any) {
      this.user = userData.user || userData
      this.accessToken = userData.access_token || userData.accessToken
      this.refreshToken = userData.refresh_token || userData.refreshToken
      this.isAuthenticated = true
      
      // Сохраняем в localStorage
      if (this.accessToken) {
        localStorage.setItem('accessToken', this.accessToken)
      }
      if (this.refreshToken) {
        localStorage.setItem('refreshToken', this.refreshToken)
      }
    },
    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false
      this.iin = ''
      
      // Очищаем localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    initializeAuth() {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (accessToken && refreshToken) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.isAuthenticated = true
      } else {
        // Если токенов нет, сбрасываем состояние
        this.accessToken = null
        this.refreshToken = null
        this.isAuthenticated = false
        this.user = null
      }
    }
  },
})
