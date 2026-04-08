<template>
  <div class="relative w-full m-0 p-0">
    <!-- QR-кнопка -->
   

    <!-- Основной футер -->
    <div
      class="fixed bottom-0 left-0 h-16 sm:h-18 lg:h-20 fhd:h-36 4k:h-40 4k-plus:h-44 flex items-center justify-between w-full z-20"
      :style="{ background: props.bg, borderTop: '1.5px solid #D5E9F7', boxShadow: '0 -2px 12px rgba(21,101,192,0.07)' }"
    >
      <!-- Левая часть -->
      <div class="flex items-center flex-1">
        <!-- Поиск -->
        <div v-if="props.showSearch" class="w-64 sm:w-72 lg:w-80 fhd:w-96 4k:w-[28rem] 4k-plus:w-[32rem] ml-4 fhd:ml-6 4k:ml-8 4k-plus:ml-10 my-4 fhd:my-5 4k:my-6">
          <div class="relative">
            <input
              type="text"
              :placeholder="$t('search_placeholder')"
              @click="goToSearch"
              class="w-full px-3 sm:px-4 fhd:px-5 py-1.5 sm:py-2 fhd:py-3 text-sm sm:text-base fhd:text-lg border-2 rounded-xl focus:outline-none cursor-pointer placeholder-gray-500 search-input"
              style="border-color: #42A5F5; background: white;"
              readonly
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 fhd:h-6 fhd:w-6" fill="none" stroke="#1565C0" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Назад -->
        <div
          v-if="props.showBackButton"
          @click="goBack"
          class="flex items-center justify-center text-white px-4 fhd:px-7 4k:px-9 py-2.5 fhd:py-4 4k:py-5 rounded-full ml-4 fhd:ml-8 4k:ml-10 transition-all duration-300 transform hover:scale-105 shadow-md cursor-pointer"
          style="background: linear-gradient(135deg, #1565C0, #42A5F5); border: none;"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="size-5 fhd:size-7 4k:size-9">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
          </svg>
          <span class="ml-2 font-semibold text-sm sm:text-base lg:text-lg fhd:text-xl 4k:text-2xl">{{ $t("back_button") }}</span>
        </div>

        <!-- Главная -->
        <div
          v-if="props.showHomeButton"
          @click="goHome"
          class="flex items-center ml-6 fhd:ml-10 4k:ml-12 justify-center px-4 fhd:px-7 4k:px-9 py-2.5 fhd:py-4 4k:py-5 rounded-full cursor-pointer font-semibold text-sm sm:text-base lg:text-lg fhd:text-xl 4k:text-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          style="background: white; color: #1565C0; border: 2px solid #42A5F5;"
        >
          {{ $t("home_button") }}
        </div>

        <!-- Чат -->
        <div
          v-if="props.showChat"
          @click="goToChat"
          class="flex items-center ml-6 fhd:ml-10 4k:ml-12 justify-center px-4 fhd:px-7 4k:px-9 py-2.5 fhd:py-4 4k:py-5 rounded-full cursor-pointer font-semibold text-sm sm:text-base lg:text-lg fhd:text-xl 4k:text-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          style="background: white; color: #1565C0; border: 2px solid #42A5F5;"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fhd:w-7 fhd:h-7 4k:w-8 4k:h-8 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {{ $t("ask_aigerim") }}
        </div>

        <!-- О продукте -->
        <!-- <div
          @click="showInfoModal = true"
          class="flex items-center justify-center text-white px-4 4k:px-6 py-2.5 4k:py-3 rounded-full ml-6 4k:ml-8 transition-all duration-300 transform hover:scale-105 shadow-md cursor-pointer"
          style="background: linear-gradient(135deg, #1565C0, #42A5F5); border: none;"
        >
          <span class="font-semibold text-sm sm:text-base lg:text-lg">{{ $t('about_product') }}</span>
        </div> -->
      </div>

      <!-- Правая часть -->
      <div
        class="w-auto min-w-[130px] fhd:min-w-[260px] 4k:min-w-[320px] h-full rounded-tl-[22px] flex items-center justify-center gap-3 sm:gap-4 fhd:gap-6 4k:gap-7 px-5 sm:px-7 fhd:px-12 4k:px-14"
        style="background: linear-gradient(135deg, #1565C0, #42A5F5);"
      >
        <!-- Язык -->
        <div
          v-if="props.showLanguageButton"
          class="w-12 h-12 fhd:w-16 fhd:h-16 4k:w-20 4k:h-20 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105"
          @click="toggleLanguage"
        >
          <span class="text-base fhd:text-2xl 4k:text-3xl font-bold" style="color: #1565C0;">
            {{ currentLanguage === "kk" ? $t("language_rus") : $t("language_kaz") }}
          </span>
        </div>

        <!-- Звук -->
        <div
          class="w-12 h-12 fhd:w-16 fhd:h-16 4k:w-20 4k:h-20 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105"
          @click="toggleSound"
        >
          <svg v-if="isSoundEnabled" class="w-6 h-6 fhd:w-8 fhd:h-8 4k:w-10 4k:h-10" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/>
          </svg>
          <svg v-else class="w-6 h-6 fhd:w-8 fhd:h-8 4k:w-10 4k:h-10 opacity-50" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Модалка StaticAd -->
    <StaticAd v-if="showStaticAd" :isVisible="showStaticAd" @close="closeStaticAd" />

    <!-- Модалка О продукте -->
    <Transition name="info-modal">
      <div
        v-if="showInfoModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md bg-black/60"
        @click="showInfoModal = false"
      >
        <div
          class="relative rounded-3xl p-8 w-[88vw] max-w-sm flex flex-col items-center shadow-2xl"
          style="background: linear-gradient(135deg, #1565C0, #42A5F5);"
          @click.stop
        >
          <!-- Закрыть -->
          <div
            class="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all duration-300 z-10"
            @click="showInfoModal = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#1565C0" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <!-- Контент -->
          <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <h2 class="text-white text-xl font-extrabold mb-2 text-center">{{ $t('about_product') }}</h2>
          <p class="text-white/80 text-sm text-center leading-relaxed">
            {{ $t('about_product_desc') }}
          </p>
          <div class="mt-6 w-full text-center text-white/50 text-xs">v1.0.0</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSoundControl } from "../composables/useSoundControl";
import StaticAd from "./StaticAd.vue";
import { useAppStore } from "../stores/app";

interface Props {
  showHomeButton?: boolean;
  showQR?: boolean;
  showChat?: boolean;
  showSearch?: boolean;
  showBackButton?: boolean;
  showLanguageButton?: boolean;
  bg?: string;
  onBack?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  showHomeButton: false,
  showQR: true,
  showChat: false,
  showSearch: false,
  showBackButton: true,
  showLanguageButton: true,
  bg: '#ffffff',
});

const router = useRouter();
const { locale } = useI18n();
const { toggleSound, isSoundEnabled } = useSoundControl();
const appStore = useAppStore();

const showStaticAd = ref(false);
const showInfoModal = ref(false);

const currentLanguage = computed(() => locale.value);

onMounted(() => {
  const savedLanguage = localStorage.getItem("currentLang");
  if (savedLanguage === "ru" || savedLanguage === "kk") {
    locale.value = savedLanguage;
    appStore.setLang(savedLanguage as 'ru' | 'kk');
  }
});

const goBack = () => {
  if (props.onBack) {
    props.onBack()
    return
  }
  try {
    if (
      router.currentRoute.value.name === "ServiceView" ||
      router.currentRoute.value.name === "SearchPage" ||
      router.currentRoute.value.name === "InfoService"
    ) {
      sessionStorage.setItem("shouldReturnAnimate", "true");
      router.push("/home").then(() => {
        setTimeout(() => {
          if ((window as any).startReturnAnimation) {
            (window as any).startReturnAnimation();
          }
        }, 200);
      }).catch(() => {});
    } else {
      router.back();
    }
  } catch {}
};

const goHome = () => { try { router.push("/home"); } catch {} };
const goToChat = () => { router.push("/chat"); };
const goToSearch = () => {
  (window as any).startVideoTransition?.();
  setTimeout(() => { router.push("/search"); }, 100);
};

const toggleLanguage = () => {
  try {
    const newLocale = currentLanguage.value === "ru" ? "kk" : "ru";
    localStorage.setItem("currentLang", newLocale);
    locale.value = newLocale;
    appStore.setLang(newLocale as 'ru' | 'kk');
  } catch {}
};

const handleQRClick = () => { showStaticAd.value = true; };
const closeStaticAd = () => { showStaticAd.value = false; };
</script>

<style scoped>
@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(84,120,255,0.9); }
  70% { transform: scale(1.05); box-shadow: 0 0 18px 6px rgba(84,120,255,0.6); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(84,120,255,0); }
}
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
  60% { transform: translateY(-2px); }
}
.qr-animate {
  animation: pulse 2s infinite, bounce 3s infinite;
  border-radius: 35% 35% 0 0;
}
.info-modal-enter-active { transition: background-color 0.3s ease; }
.info-modal-leave-active { transition: background-color 0.25s ease; }
.info-modal-enter-from { background-color: transparent; }
.info-modal-leave-to { background-color: transparent; }

.search-input::placeholder { color: #6B7280 !important; opacity: 1 !important; }
</style>
