<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePageVideo } from "@/composables/usePageVideo";
import AppStatusBar from "@/components/shared/AppStatusBar.vue";

const router = useRouter();
const { t } = useI18n();
const { videoSrc, isLoop, onVideoEnded } = usePageVideo();

// Crossfade: старое видео поверх, плавно исчезает
const currSrc = ref(videoSrc.value)
const prevSrc = ref('')
const prevVisible = ref(false)
let fadeTimer: ReturnType<typeof setTimeout> | null = null

watch(videoSrc, (newSrc, oldSrc) => {
  if (oldSrc && oldSrc !== newSrc) {
    if (fadeTimer) clearTimeout(fadeTimer)
    prevSrc.value = oldSrc
    prevVisible.value = true
    fadeTimer = setTimeout(() => { prevVisible.value = false }, 500)
  }
  currSrc.value = newSrc
})

onUnmounted(() => { if (fadeTimer) clearTimeout(fadeTimer) })

function startApp() {
  router.push('/lang')
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <AppStatusBar />

    <div class="welcome-content flex-1 flex flex-col items-center justify-center overflow-hidden mt-[-100px]">

      <!-- Title -->
      <div class="animate-fade-in text-center" style="animation-delay: 0.05s">
        <div class="welcome-title font-bold leading-tight" style="color: #1565c0">
          {{ t("welcome.subtitle") }}
        </div>
        <div class="welcome-sub font-bold mt-1" style="color: #90c4e8">
          {{ t("welcome.title") }}
        </div>
      </div>

      <!-- Circular video -->
      <div class="animate-pop-in relative flex items-center justify-center" style="animation-delay: 0.2s">
        <div class="absolute rounded-full animate-aura-1"
          style="inset:-24px; background:radial-gradient(circle,rgba(66,165,245,0.15) 0%,transparent 70%);" />
        <div class="absolute rounded-full animate-aura-2"
          style="inset:-24px; background:radial-gradient(circle,rgba(21,101,192,0.1) 0%,transparent 70%);" />
        <div class="welcome-video video-glow rounded-full overflow-hidden border-2 border-white relative">
          <!-- Новое видео снизу -->
          <video :key="currSrc" :src="currSrc" autoplay :loop="isLoop" muted playsinline
            class="w-full h-full object-cover" @ended="onVideoEnded" />
          <!-- Старое видео сверху — плавно исчезает -->
          <Transition name="prev-fade">
            <video v-if="prevVisible && prevSrc" :src="prevSrc" autoplay loop muted playsinline
              class="absolute inset-0 w-full h-full object-cover" />
          </Transition>
        </div>
      </div>

      <!-- CTA -->
      <div class="animate-fade-in welcome-cta flex flex-col items-center w-full" style="animation-delay: 0.38s">
        <button
          @click="startApp"
          class="kb animate-pulse-btn welcome-btn w-full font-extrabold text-white border-none cursor-pointer"
          style="background:linear-gradient(135deg,#1565c0,#42a5f5); box-shadow:0 6px 20px rgba(21,101,192,0.28);"
        >
          Бастау · Начать
        </button>
        <div class="welcome-hint font-semibold text-gray-500">
          Бастау үшін басыңыз · Нажмите для начала
        </div>
        <div class="h-[80px] fhd:h-[180px]" />

      </div>
    </div>

    <div class="welcome-footer fixed bottom-0 left-0 flex items-center justify-between w-full z-20"
      :style="{ borderTop:'1.5px solid #D5E9F7', boxShadow:'0 -2px 12px rgba(21,101,192,0.07)' }"
    ></div>
  </div>
</template>

<style scoped>
/* Старое видео появляется мгновенно и плавно исчезает */
.prev-fade-enter-from,
.prev-fade-enter-active {
  opacity: 1;
}
.prev-fade-leave-active {
  transition: opacity 0.5s ease;
}
.prev-fade-leave-to {
  opacity: 0;
}

.welcome-content { gap: 32px; padding: 0 32px; }
.welcome-title   { font-size: 1.875rem; }
.welcome-sub     { font-size: 1.875rem; }
.welcome-video   { width: clamp(280px, 42vw, 460px); height: clamp(280px, 42vw, 460px); }
.welcome-cta     { max-width: 384px; gap: 12px; }
.welcome-btn     { padding: 16px 0; border-radius: 999px; font-size: 1.125rem; }
.welcome-hint    { font-size: 0.75rem; }
.welcome-footer  { height: 64px; }

.video-glow {
  box-shadow: 0 16px 56px rgba(21,101,192,0.2), 0 4px 16px rgba(21,101,192,0.12);
  border-color: rgba(6, 26, 58, 0.55);
  will-change: filter;
  animation: video-glow-pulse 5s ease-in-out infinite;
}
@keyframes video-glow-pulse {
  0%,100% {
    filter: drop-shadow(0 0 6px rgba(13, 49, 107, 0.3));
    border-color: rgba(99,160,255,0.45);
  }
  50% {
    filter: drop-shadow(0 0 18px rgba(47, 90, 158, 0.65));
    border-color: rgba(99,160,255,0.85);
  }
}

@media (min-width: 1000px) and (min-height: 1600px) {
  .welcome-content { gap: 56px; padding: 0 64px; }
  .welcome-title   { font-size: 2.75rem; }
  .welcome-sub     { font-size: 2.5rem; margin-top: 12px; }
  .welcome-video   { width: 460px; height: 460px; }
  .welcome-cta     { max-width: 680px; gap: 24px; }
  .welcome-btn     { padding: 20px 0; border-radius: 999px; font-size: 2rem; }
  .welcome-hint    { font-size: 1.35rem; }
  .welcome-footer  { height: 128px; }
}
</style>
