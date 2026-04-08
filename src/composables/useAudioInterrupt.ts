import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// Глобальные переменные для управления аудио
let globalCurrentAudio: HTMLAudioElement | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let globalAudioQueue: Blob[] = [];

export function useAudioInterrupt() {
  const router = useRouter();

  // Функция для остановки всех аудио
  const stopAllAudio = () => {
    // Останавливаем текущее аудио
    if (globalCurrentAudio) {
      globalCurrentAudio.pause();
      globalCurrentAudio = null;
    }
    
    // Очищаем очередь аудио
    globalAudioQueue.length = 0;
  };

  // Функция для регистрации аудио элементов
  const registerAudioElements = (
    currentAudio: HTMLAudioElement | null,
    audioQueue: Blob[]
  ) => {
    globalCurrentAudio = currentAudio;
    globalAudioQueue = audioQueue;
  };

  // Обработчик beforeunload для остановки аудио при закрытии страницы
  const handleBeforeUnload = () => {
    stopAllAudio();
  };

  // Обработчик изменения маршрута
  const handleRouteChange = () => {
    stopAllAudio();
  };

  onMounted(() => {
    // Добавляем обработчик beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Добавляем обработчик изменения маршрута
    router.afterEach(() => {
      handleRouteChange();
    });
  });

  onUnmounted(() => {
    // Убираем обработчики
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  return {
    stopAllAudio,
    registerAudioElements
  };
}
