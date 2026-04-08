<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppStatusBar from '@/components/shared/AppStatusBar.vue'
import FooterNav from '@/components/FooterNav.vue'
import { useHomeCycleVideo } from '@/composables/useHomeCycleVideo'
import { useSoundControl } from '@/composables/useSoundControl'

const router = useRouter()
const { t } = useI18n()
const { videoSrc, isLoop, onVideoEnded } = useHomeCycleVideo()
const { isSoundEnabled } = useSoundControl()

const videoRef = ref<HTMLElement | null>(null)
const animating = ref(false)
const cloneVisible = ref(false)
const cloneStyle = ref<Record<string, string>>({})

// Return animation (from corner to center)
const returnCloneVisible = ref(false)
const returnCloneStyle = ref<Record<string, string>>({})
const isReturning = ref(false)

onMounted(async () => {
  if (sessionStorage.getItem('returnToHome') !== '1') return
  sessionStorage.removeItem('returnToHome')

  await nextTick()

  const el = videoRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const startSize = (window.innerWidth >= 1000 && window.innerHeight >= 1600) ? 160 : 76
  const startLeft = window.innerWidth - 14 - startSize
  const startTop = 10

  returnCloneStyle.value = {
    position: 'fixed',
    left: startLeft + 'px',
    top: startTop + 'px',
    width: startSize + 'px',
    height: startSize + 'px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(99, 160, 255, 0.5)',
    boxShadow: '0 3px 12px rgba(21, 101, 192, 0.25)',
    zIndex: '9999',
    transition: 'none',
    pointerEvents: 'none',
  }

  isReturning.value = true
  returnCloneVisible.value = true

  await nextTick()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      returnCloneStyle.value = {
        ...returnCloneStyle.value,
        left: rect.left + 'px',
        top: rect.top + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px',
        border: '2px solid rgba(59, 130, 246, 0.4)',
        boxShadow: '0 0 10px 2px rgba(59, 130, 246, 0.3), 0 0 24px 6px rgba(99, 160, 255, 0.18)',
        transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    })
  })

  setTimeout(() => {
    returnCloneVisible.value = false
    isReturning.value = false
  }, 730)
})

async function navigate(route: string) {
  if (animating.value) return

  const el = videoRef.value
  if (!el) { router.push(route); return }

  const rect = el.getBoundingClientRect()

  cloneStyle.value = {
    position: 'fixed',
    left: rect.left + 'px',
    top: rect.top + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(59,130,246,0.4)',
    boxShadow: '0 0 10px 2px rgba(59,130,246,0.3)',
    zIndex: '9999',
    transition: 'none',
    pointerEvents: 'none',
  }

  animating.value = true
  cloneVisible.value = true

  await nextTick()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetSize = (window.innerWidth >= 1000 && window.innerHeight >= 1600) ? 160 : 76
      const targetLeft = window.innerWidth - 14 - targetSize
      const targetTop = 10

      cloneStyle.value = {
        ...cloneStyle.value,
        left: targetLeft + 'px',
        top: targetTop + 'px',
        width: targetSize + 'px',
        height: targetSize + 'px',
        border: '3px solid white',
        boxShadow: '0 3px 16px rgba(21,101,192,0.22)',
        transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    })
  })

  setTimeout(() => {
    sessionStorage.setItem('fromLang', '1')
    router.push(route)
  }, 730)
}

const menuItems = [
  {
    key: 'apt', route: '/book',
    delay: .07,
    icon: new URL('../assets/calendar.png', import.meta.url).href,
  },
  {
    key: 'info', route: '/info',
    delay: .12,
    icon: new URL('../assets/faq.png', import.meta.url).href,
  },
  {
    key: 'osms', route: '/osms',
    delay: .17,
    icon: new URL('../assets/checked.png', import.meta.url).href,
  },
  // {
  //   key: 'queue', route: '/queue',
  //   delay: .22,
  //   icon: new URL('../assets/ticket.png', import.meta.url).href,
  // },
  // {
  //   key: 'profile', route: '/profile',
  //   delay: .27,
  //   icon: new URL('../assets/user.png', import.meta.url).href,
  // },
  // {
  //   key: 'ai', route: '/ai',
  //   delay: .32,
  //   icon: new URL('../assets/artificial-intelligence.png', import.meta.url).href,
  // },
]

const labelMap: Record<string, { n: string; sub: string }> = {
  apt:     { n: t('home.appointment'),  sub: t('home.appointmentSub') },
  info:    { n: t('home.info'),          sub: t('home.infoSub') },
  osms:    { n: t('home.osms'),          sub: t('home.osmsSub') },
  queue:   { n: t('home.queue'),         sub: t('home.queueSub') },
  // profile: { n: t('profile.title'),      sub: 'Записи, история' },
  // ai:      { n: t('home.ai'),            sub: t('home.aiSub') },
}
</script>

<template>
  <div class="flex flex-col h-full relative bg-white">
    <AppStatusBar />

    <div class=" overflow-y-auto pb-[80px] fhd:pb-[148px] my-auto">
      <div class="px-4 fhd:px-5 pt-4 m-auto">

        <!-- Greeting -->
        <div class="animate-fade-in mt-4  px-1">
          <!-- <div class="text-[1.65rem] fhd:text-[2.4rem] font-bold leading-snug text-center pt-6 pb-4 fhd:pt-10 fhd:pb-6 home-greeting" style="color:rgb(94 141 205);"
            v-html="t('home.greeting')" /> -->
        </div>

        <!-- Video -->
        <div class="animate-fade-in flex justify-center my-10 fhd:my-14" style="animation-delay:.08s">
          <div ref="videoRef" class="video-glow-wrapper" :style="{ opacity: animating || isReturning ? 0 : 1, transition: (animating || isReturning) ? 'opacity 0.1s' : 'none' }">
            <video :key="videoSrc" :src="videoSrc" autoplay :loop="isLoop" :muted="!isSoundEnabled" playsinline class="w-full h-full object-cover" @ended="onVideoEnded" />
          </div>
        </div>
<div class="px-8 fhd:px-4">
        <!-- Grid -->
        <div class="grid grid-cols-2 gap-3 fhd:gap-5 w-full mt-6 fhd:mt-10">

      <button
        class="service-card"
        @click="navigate('/book')"
      >
        <img src="../assets/icon2.svg" class="card-icon" />
        <div class="card-title" v-html="t('home.appointmentCard')" />
        <div class="card-sub">{{ t('home.appointmentSub') }}</div>
      </button>

      <button
        class="service-card"
        @click="navigate('/info')"
      >
        <img src="../assets/faq.svg" class="card-icon" />
        <div class="card-title" v-html="t('home.infoCard')" />
        <div class="card-sub">{{ t('home.infoSub') }}</div>
      </button>

    </div>

    <button
      class="ai-button mt-4 w-full flex justify-evenly"
      @click="navigate('/osms')"
    >
      <img src="../assets/stra.png" class="w-10 h-10"/>
      {{ t('home.osmsCard') }}
      <span class="arrow"></span>
    </button>
    </div>
      </div>
    </div>

    <FooterNav :show-home-button="false" :show-back-button="false"  :show-info-modal="false"/>

    <Teleport to="body">
      <div v-if="cloneVisible" :style="cloneStyle">
        <video :src="videoSrc" autoplay loop :muted="!isSoundEnabled" playsinline class="w-full h-full object-cover" />
      </div>
      <div v-if="returnCloneVisible" :style="returnCloneStyle">
        <video :src="videoSrc" autoplay loop :muted="!isSoundEnabled" playsinline class="w-full h-full object-cover" />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.menu-card {
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(145deg, #3B82F6 0%, #2563EB 40%, #1D4ED8 70%, #1E3A8A 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 22px;
  padding: 20px 18px 18px;
  min-height: 160px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 4px 16px rgba(15, 23, 42, 0.05);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  position: relative;
  overflow: hidden;
}

.menu-card:hover {
  transform: translateY(-2px);
  background: linear-gradient(145deg, #1D4ED8 0%, #1E40AF 55%, #1B3A9F 100%);
  box-shadow:
    0 4px 12px rgba(30, 64, 175, 0.35),
    0 8px 28px rgba(30, 64, 175, 0.25);
  filter: none;
}

.menu-card:active {
  transform: scale(0.95);
  background: linear-gradient(145deg, #1B3A9F 0%, #173494 55%, #122D88 100%);
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.4);
  filter: none;
}

.icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.icon-wrap img {
  filter: brightness(0) invert(1);
}

.card-label {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: 5px;
}

.card-sub {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.4;
  flex: 1;
}

.card-arrow {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 12px;
  transition: color 0.15s ease, transform 0.15s ease;
}

.menu-card:hover .card-arrow {
  transform: translateX(2px);
}
/* Video glow */
.video-glow-wrapper {
  width: clamp(470px, 72vw, 660px);
  height: clamp(470px, 72vw, 660px);
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(59, 130, 246, 0.4);
  box-shadow:
    0 0 10px 2px rgba(59, 130, 246, 0.3),
    0 0 24px 6px rgba(99, 160, 255, 0.18),
    0 0 40px 12px rgba(37, 99, 235, 0.1);
  animation: glow-pulse 2.4s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow:
      0 0 6px 2px rgba(59, 130, 246, 0.3),
      0 0 14px 4px rgba(99, 160, 255, 0.18),
      0 0 26px 8px rgba(37, 99, 235, 0.1);
    border-color: rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow:
      0 0 12px 4px rgba(99, 160, 255, 0.42),
      0 0 26px 10px rgba(59, 130, 246, 0.28),
      0 0 40px 14px rgba(37, 99, 235, 0.15);
    border-color: rgba(147, 197, 253, 0.6);
  }
}

.service-card{
  background: linear-gradient(145deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%);
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: white;
  font-weight: 700;
  text-align: left;
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow:
    0 4px 16px rgba(37,99,235,0.35),
    0 1px 4px rgba(37,99,235,0.2);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.service-card:active {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(37,99,235,0.4);
}

.card-icon{
  width: 26px;
  margin-bottom: 12px;
}

.card-title{
  font-size: 20px;
  line-height: 1.55;
}

/* AI button */

.ai-button{
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 60%, #1E3A8A 100%);
  border-radius: 14px;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: white;
  font-weight: 700;
  font-size: 17px;
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow:
    0 4px 16px rgba(37,99,235,0.35),
    0 1px 4px rgba(37,99,235,0.2);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.ai-button:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(37,99,235,0.45);
}

.ai-icon{
  width: 22px;
  filter: brightness(0) invert(1);
}

.arrow{
  margin-left: 6px;
  font-size: 20px;
}

</style>
