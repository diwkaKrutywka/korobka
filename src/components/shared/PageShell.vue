<!-- Wraps every page: TopNav + scrollable content + FooterNav -->
<script setup lang="ts">
import AppStatusBar from './AppStatusBar.vue'
import AppAvatar from './AppAvatar.vue'
import FooterNav from '@/components/FooterNav.vue'

defineProps<{
  showBack?: boolean
  showHome?: boolean
  bg?: string
  headerBg?: string
  footerBg?: string
  subtitle?: string
  videoSrc?: string
  onBack?: () => void
}>()
</script>

<template>
  <div class="flex flex-col h-full relative" :style="{ background: bg ?? '#ffffff' }">
    <AppStatusBar :bg="headerBg" />
    <AppAvatar :mini="true" :subtitle="subtitle" :video-src="videoSrc" />

    <!-- Scrollable slot -->
    <div class="flex-1 overflow-y-auto pb-[72px] fhd:pb-[144px]">
      <div class="max-w-5xl fhd:max-w-9xl mx-auto w-full">
        <slot />
      </div>
    </div>

    <FooterNav :show-back-button="showBack" :show-home-button="showHome" :bg="footerBg" :on-back="onBack" />
  </div>
</template>
