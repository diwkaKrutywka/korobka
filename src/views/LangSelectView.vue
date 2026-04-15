<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useLangCycleVideo } from '@/composables/useLangCycleVideo'
import { useSoundControl } from '@/composables/useSoundControl'
import AppStatusBar from '@/components/shared/AppStatusBar.vue'
import FooterNav from '@/components/FooterNav.vue'

const router = useRouter()
const { locale } = useI18n()
const appStore = useAppStore()
const { videoSrc, isLoop, onVideoEnded } = useLangCycleVideo()
const { isSoundEnabled } = useSoundControl()

function select(lang: 'ru' | 'kk') {
  locale.value = lang
  localStorage.setItem('currentLang', lang)
  appStore.setLang(lang)
  router.push('/home')
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <AppStatusBar />

    <div class="lang-content flex-1 flex flex-col items-center justify-center overflow-hidden">

      <!-- Title -->
      <div class="animate-fade-in text-center" style="animation-delay:.05s">
        <div class="lang-title font-extrabold leading-tight" style="color:#1565C0;">
          Емханаға қош келдіңіздер
        </div>
        <div class="lang-sub font-bold mt-1" style="color:#90C4E8;">
          Добро пожаловать <br>в поликлинику
        </div>
      </div>

      <!-- Circular video -->
      <div class="animate-pop-in relative flex items-center justify-center lang-video-wrap" style="animation-delay:.18s;">
        <div class="absolute rounded-full animate-aura-1"
          style="inset:-24px; background: radial-gradient(circle, rgba(66,165,245,0.15) 0%, transparent 70%);" />
        <div class="lang-video video-glow rounded-full overflow-hidden border-2 border-white">
          <video :src="videoSrc" autoplay :loop="isLoop" :muted="!isSoundEnabled" playsinline class="w-full h-full object-cover" @ended="onVideoEnded" />
        </div>
      </div>

      <!-- Buttons -->
      <div class="lang-btns-wrap animate-fade-in flex flex-col items-center w-full" style="animation-delay:.3s;">
        <div class="lang-hint font-semibold text-gray-400">
          Тілді таңдаңыз · Выберите язык
        </div>
        <div class="flex w-full lang-btns-row">
          <button @click="select('kk')" class="kb lang-btn flex-1 font-extrabold text-white border-none cursor-pointer"
            style="background: linear-gradient(135deg, #1565C0, #42A5F5); box-shadow: 0 6px 20px rgba(21,101,192,0.28);">
            Қазақ
          </button>
          <button @click="select('ru')" class="kb lang-btn flex-1 font-extrabold text-white border-none cursor-pointer"
            style="background: linear-gradient(135deg, #1565C0, #42A5F5); box-shadow: 0 6px 20px rgba(21,101,192,0.28);">
            Русский
          </button>
        </div>
      </div>

    </div>

    <FooterNav :showBackButton="false" :showQR="false" :showLanguageButton="false" />
  </div>
</template>

<style scoped>
.lang-content    { gap: 28px; padding: 0 32px; }
.lang-title      { font-size: 2.3rem; font-weight: 1500;}
.lang-sub        { font-size: 2rem; }
.lang-video      { width: clamp(280px, 42vw, 460px); height: clamp(280px, 42vw, 460px); }
.lang-video-wrap { margin: 0; }
.lang-btns-wrap  { max-width: 384px; gap: 16px; }
.lang-btns-row   { gap: 16px; }
.lang-hint       { font-size: 0.875rem; }
.lang-btn        { padding: 12px 0; border-radius: 999px; font-size: 1.125rem; }

.video-glow {
  box-shadow: 0 16px 56px rgba(21,101,192,0.2), 0 4px 16px rgba(21,101,192,0.12);
  border-color: rgba(6, 34, 78, 0.55);
  will-change: filter;
  animation: video-glow-pulse 5s ease-in-out infinite;
}
@keyframes video-glow-pulse {
  0%,100% {
    filter: drop-shadow(0 0 6px rgba(13, 51, 112, 0.3));
    border-color: rgba(99,160,255,0.45);
  }
  50% {
    filter: drop-shadow(0 0 18px rgba(99,160,255,0.65));
    border-color: rgba(99,160,255,0.85);
  }
}

@media (min-width: 1000px) and (min-height: 1600px) {
  .lang-content   { gap: 56px; padding: 0 64px; }
  .lang-title     { font-size: 3rem; font-weight: 1500; }
  .lang-sub       { font-size: 2.85rem; margin-top: 12px; }
  .lang-btns-wrap { max-width: 680px; gap: 24px; }
  .lang-btns-row  { gap: 24px; }
  .lang-hint      { font-size: 1.35rem; }
  .lang-btn       { padding: 28px 0; font-size: 2rem; border-radius: 999px; }
}
</style>
