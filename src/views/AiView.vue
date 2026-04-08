<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageShell from '@/components/shared/PageShell.vue'

const { t } = useI18n()

interface Message { role: 'user' | 'ai'; text: string }

const messages = ref<Message[]>([{ role: 'ai', text: t('ai.greeting') }])
const input = ref('')
const thinking = ref(false)
const listEl = ref<HTMLElement>()

function getAiResponse(q: string): string {
  const lq = q.toLowerCase()
  if (lq.includes('терапевт') || lq.includes('therapist'))
    return 'Терапевт Жумабаева Дина принимает пн–пт с 8:00 до 14:00 в кабинете 102 (1 этаж). Для записи выберите «Запись на приём» в главном меню и введите ИИН.'
  if (lq.includes('осмс') || lq.includes('мамс') || lq.includes('страх'))
    return 'ОСМС покрывает консультации специалистов, базовые анализы и вакцинацию. Статус можно проверить в разделе ОСМС на этом терминале.'
  if (lq.includes('регистрат') || lq.includes('прикреп'))
    return 'Регистратура — кабинет 101, 1 этаж. Режим работы пн–пт. Возьмите удостоверение личности.'
  if (lq.includes('анализ') || lq.includes('лаборат'))
    return 'Лаборатория — кабинет 115, 1 этаж. Забор анализов до 11:00. По направлению врача.'
  if (lq.includes('кардиолог'))
    return 'Кардиолог Байжанов Марат принимает пн, вт, чт с 9:00 до 17:00 в кабинете 310 (3 этаж).'
  if (lq.includes('хирург'))
    return 'Хирург Нурланов Ерлан принимает пн, ср, пт с 8:00 до 16:00 в кабинете 412 (4 этаж).'
  if (lq.includes('аптек'))
    return 'Аптека находится в фойе на 1 этаже, работает с 8:00 до 20:00.'
  if (lq.includes('рентген') || lq.includes('узи'))
    return 'Рентген и УЗИ — цокольный этаж, кабинеты 001–005. Приём по направлению врача.'
  if (lq.includes('запись') || lq.includes('записат'))
    return 'Нажмите «Запись на приём» в главном меню. Введите ИИН, выберите специальность, врача и время.'
  if (lq.includes('очередь') || lq.includes('талон'))
    return 'Электронную очередь можно взять в разделе «Электронная очередь». Доступны: Регистратура, Лаборатория, Аптека и Доврачебный кабинет.'
  return 'Я помогу с любым вопросом о поликлинике — расписание врачей, ОСМС, навигация, запись на приём. Уточните ваш вопрос.'
}

async function send() {
  const text = input.value.trim()
  if (!text || thinking.value) return
  messages.value.push({ role: 'user', text })
  input.value = ''
  thinking.value = true
  await nextTick()
  listEl.value?.scrollTo({ top: listEl.value.scrollHeight, behavior: 'smooth' })
  setTimeout(() => {
    messages.value.push({ role: 'ai', text: getAiResponse(text) })
    thinking.value = false
    nextTick(() => listEl.value?.scrollTo({ top: listEl.value.scrollHeight, behavior: 'smooth' }))
  }, 800 + Math.random() * 600)
}

const quickQuestions = computed(() => [
  t('ai.q1'), t('ai.q2'), t('ai.q3'), t('ai.q4'),
])
</script>

<template>
  <PageShell :show-back="true" :show-home="true" bg="#F8F9FF">
    <!-- Chat header -->
    <div class="flex items-center gap-3 px-5 py-4 border-b bg-white" style="border-color:#e4e6f8;">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style="background: linear-gradient(135deg,#7C3AED,#A855F7);">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
        </svg>
      </div>
      <div>
        <div class="font-extrabold text-base" style="color:#0d1240">{{ t('ai.title') }}</div>
        <div class="text-xs text-gray-400">{{ t('ai.sub') }}</div>
      </div>
      <div class="ml-auto w-2.5 h-2.5 rounded-full" style="background:#1565C0; animation: pulse-scale 2s ease-in-out infinite;" />
    </div>

    <!-- Messages -->
    <div ref="listEl" class="px-4 py-4 flex flex-col gap-3" style="min-height: 300px;">
      <!-- Quick questions -->
      <div v-if="messages.length === 1" class="flex flex-wrap gap-2 mb-2">
        <button v-for="q in quickQuestions" :key="q"
          @click="input = q; send()"
          class="kb text-xs font-semibold px-4 py-2 rounded-full cursor-pointer border transition-all hover:shadow-sm"
          style="background:#EDE9FE; color:#7C3AED; border-color:rgba(124,58,237,.2);">
          {{ q }}
        </button>
      </div>

      <div v-for="(msg, i) in messages" :key="i"
        class="animate-fade-in flex gap-2.5"
        :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
        :style="{ animationDelay: `${i * 30}ms` }">
        <div v-if="msg.role === 'ai'"
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-end"
          style="background: linear-gradient(135deg,#7C3AED,#A855F7);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
        </div>
        <div class="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
          :class="msg.role === 'ai' ? 'rounded-bl-[4px]' : 'rounded-br-[4px]'"
          :style="{
            background: msg.role === 'ai' ? '#fff' : 'linear-gradient(135deg,#111FA2,#5478FF)',
            color: msg.role === 'ai' ? '#0d1240' : '#fff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
          }">
          {{ msg.text }}
        </div>
      </div>

      <!-- Thinking -->
      <div v-if="thinking" class="animate-fade-in flex gap-2.5 items-end">
        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style="background: linear-gradient(135deg,#7C3AED,#A855F7);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
        </div>
        <div class="px-4 py-3 rounded-2xl rounded-bl-[4px] bg-white flex items-center gap-1.5"
          style="box-shadow: 0 2px 10px rgba(0,0,0,0.07);">
          <div v-for="j in 3" :key="j"
            class="w-2 h-2 rounded-full"
            style="background:#7C3AED; opacity:.6;"
            :style="{ animation: `pulse-scale 1.4s ease-in-out ${(j-1)*0.2}s infinite` }" />
        </div>
      </div>
    </div>

    <!-- Input bar (sticky inside scroll) -->
    <div class="sticky bottom-0 flex items-center gap-3 px-4 py-3 border-t bg-white" style="border-color:#e4e6f8;">
      <input v-model="input"
        @keydown.enter="send"
        :placeholder="t('ai.placeholder')"
        class="flex-1 px-4 py-3 rounded-2xl border text-sm text-gray-800 font-medium outline-none"
        style="background:#F8F9FF; border-color:#c8ccee; font-family:'Nunito Sans',sans-serif;" />
      <button @click="send"
        class="kb w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer flex-shrink-0 transition-all"
        :style="{ background: input.trim() ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : '#EDE9FE' }">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          :stroke="input.trim() ? '#fff' : '#7C3AED'"
          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 19-7z"/>
        </svg>
      </button>
    </div>
  </PageShell>
</template>
