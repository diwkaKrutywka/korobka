<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { usePageVideo } from '@/composables/usePageVideo'
import { useSoundControl } from '@/composables/useSoundControl'

const props = defineProps<{ size?: number; mini?: boolean; videoSrc?: string; subtitle?: string }>()
const { videoSrc: autoVideoSrc, isLoop, onVideoEnded, pageSubtitle } = usePageVideo()
const { isSoundEnabled } = useSoundControl()
const { t } = useI18n()
const route = useRoute()

const bubbleKey = ref(0)
watch(() => route.fullPath, () => {
  bubbleKey.value++
})

onMounted(() => {
  if (props.mini) sessionStorage.removeItem('fromLang')
})

onUnmounted(() => {
  if (props.mini) sessionStorage.setItem('returnToHome', '1')
})

// Crossfade: старое видео накладывается поверх и исчезает,
// пока новое грузится снизу — вспышки не видно
const effectiveSrc = computed(() => props.videoSrc ?? autoVideoSrc.value)
const currSrc = ref(effectiveSrc.value)
const prevSrc = ref('')
const prevVisible = ref(false)
let fadeTimer: ReturnType<typeof setTimeout> | null = null

watch(effectiveSrc, (newSrc, oldSrc) => {
  if (oldSrc && oldSrc !== newSrc) {
    if (fadeTimer) clearTimeout(fadeTimer)
    prevSrc.value = oldSrc
    prevVisible.value = true
    fadeTimer = setTimeout(() => {
      prevVisible.value = false
    }, 500)
  }
  currSrc.value = newSrc
})

onUnmounted(() => {
  if (fadeTimer) clearTimeout(fadeTimer)
})
</script>

<template>
  <!-- Mini avatar in top-right corner -->
  <div v-if="mini"
    class="avatar-mini-container absolute top-2.5 right-3.5 fhd:top-3 fhd:right-4 z-10 flex items-center"
  >
    <!-- Subtitle bubble (shown when muted) -->
    <Transition name="subtitle-fade">
      <div v-if="!isSoundEnabled" :key="bubbleKey" class="subtitle-bubble-mini">
        {{ props.subtitle ?? pageSubtitle ?? t('subtitle.mini') }}
        <span class="bubble-tail" />
      </div>
    </Transition>

    <div class="avatar-glow-mini rounded-full overflow-hidden flex-shrink-0 relative">
      <!-- Новое видео снизу -->
      <video
        :key="currSrc"
        :src="currSrc"
        autoplay :loop="isLoop" :muted="!isSoundEnabled" playsinline
        class="w-full h-full object-cover"
        @ended="onVideoEnded"
      />
      <!-- Старое видео сверху — плавно исчезает -->
      <Transition name="prev-fade">
        <video
          v-if="prevVisible && prevSrc"
          :src="prevSrc"
          autoplay loop muted playsinline
          class="absolute inset-0 w-full h-full object-cover"
        />
      </Transition>
    </div>
  </div>

  <!-- Regular avatar -->
  <div v-else
    class="avatar-glow rounded-full overflow-hidden border-[3px] border-white flex-shrink-0 relative"
    :style="{
      width: `${props.size ?? 120}px`,
      height: `${props.size ?? 120}px`,
    }">
    <!-- Новое видео снизу -->
    <video
      :key="currSrc"
      :src="currSrc"
      autoplay :loop="isLoop" :muted="!isSoundEnabled" playsinline
      class="w-full h-full object-cover"
      @ended="onVideoEnded"
    />
    <!-- Старое видео сверху — плавно исчезает -->
    <Transition name="prev-fade">
      <video
        v-if="prevVisible && prevSrc"
        :src="prevSrc"
        autoplay loop muted playsinline
        class="absolute inset-0 w-full h-full object-cover"
      />
    </Transition>
  </div>
</template>

<style scoped>
/* Контейнер мини-аватара: простой fade-in при монтировании */
.avatar-mini-container {
  animation: miniContainerFade 0.35s ease both;
}

@keyframes miniContainerFade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Mini avatar glow */
.avatar-glow-mini {
  width: clamp(114px, 18vw, 210px);
  height: clamp(114px, 18vw, 210px);
  border: 2px solid rgba(99, 160, 255, 0.5);
  box-shadow: 0 3px 12px rgba(21, 101, 192, 0.25);
  animation: glow-pulse 6s ease-in-out infinite;
}

@media (min-height: 1600px) {
  .avatar-glow-mini {
    width: 240px;
    height: 240px;
    border-width: 3px;
    box-shadow: 0 6px 24px rgba(21, 101, 192, 0.35);
  }
  .subtitle-bubble-mini {
    font-size: 42px;
    padding: 33px 42px;
    border-radius: 30px;
    max-width: 570px;
    right: -30px;
  }
}

/* Large avatar glow */
.avatar-glow {
  border: 2px solid rgba(99, 160, 255, 0.45);
  box-shadow: 0 4px 16px rgba(21, 101, 192, 0.22);
  animation: glow-pulse 6s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 10px rgba(99, 160, 255, 0.55));
  }
}

.avatar-enter {
  animation: avatarEnterFromCenter 1.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes avatarEnterFromCenter {
  0%   { opacity: 0; transform: scale(0.3); }
  60%  { opacity: 1; transform: scale(1.12); }
  100% { opacity: 1; transform: scale(1); }
}

/* Subtitle bubble next to mini avatar */
.subtitle-bubble-mini {
  position: relative;
  background: #fff;
  box-shadow: 0 3px 12px rgba(21, 101, 192, 0.25);
  color: #1a2340;
  font-size: 22px;
  font-weight: 700;
  right: -22px;
  line-height: 1.4;
  padding: 21px 27px;
  border-radius: 18px;
  max-width: 300px;
  white-space: normal;
  border: 1px solid rgba(21, 101, 192, 0.1);
  transform-origin: right center;
  animation: bubbleOpen 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes bubbleOpen {
  from {
    opacity: 0;
    clip-path: inset(0 0 0 100%);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0%);
  }
}

/* Arrow pointing right toward avatar */
.bubble-tail {

  right: -70px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
  border-left: 10px solid #fff;
  filter: drop-shadow(1px 0 1px rgba(21, 101, 192, 0.1));
}

/* Старое видео появляется мгновенно (уже играло) и плавно исчезает */
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

/* Transition — только fade при уходе */
.subtitle-fade-enter-active,
.subtitle-fade-leave-active {
  transition: opacity 0.25s ease;
}
.subtitle-fade-enter-from,
.subtitle-fade-leave-to {
  opacity: 0;
}
</style>
