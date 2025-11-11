<script setup>
import { ref, watch, computed, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  defaultType: { type: String, default: 'mp4' }, // 'mp3' | 'mp4'
})

const emit = defineEmits(['close', 'confirm'])

// estado
const tab = ref(props.defaultType === 'mp3' ? 'mp3' : 'mp4')
const mp3Kbps = ref(192) // default
const mp4Res = ref(720)  // default

watch(() => props.open, (v) => {
  if (v) {
    tab.value = (props.defaultType === 'mp3' ? 'mp3' : 'mp4')
  }
})

const mp3Options = [320, 256, 192, 128, 96, 64]
const mp4Options = [2160, 1440, 1080, 720, 480, 360]

const title = computed(() => (tab.value === 'mp3' ? 'Baixar como MP3' : 'Baixar como MP4'))

function doConfirm() {
  if (tab.value === 'mp3') {
    emit('confirm', { file_type: 'mp3', audio_bitrate: mp3Kbps.value, video_quality: null })
  } else {
    emit('confirm', { file_type: 'mp4', audio_bitrate: null, video_quality: mp4Res.value })
  }
}

// A11y + scroll lock
const modalRoot = ref(null)
let abortCtrl = null
let prevOverflow = ''

const getFocusable = () => {
  const root = modalRoot.value
  if (!root) return []
  return Array.from(
    root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'))
}

const onKeydown = (e) => {
  if (!modalRoot.value) return

  if (e?.key === 'Escape') {
    e.stopPropagation()
    emit('close')
    return
  }

  if (e?.key === 'Tab') {
    const focusable = getFocusable()
    if (!focusable.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = typeof document !== 'undefined' ? document.activeElement : null

    if (!modalRoot.value.contains(active)) {
      e.preventDefault()
      first.focus()
      return
    }

    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

const lockScrollAndBindKeys = async () => {
  await nextTick()
  modalRoot.value?.focus?.()
  if (typeof document !== 'undefined') {
    prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    abortCtrl = new AbortController()
    const opts = { signal: abortCtrl.signal }
    document.addEventListener('keydown', onKeydown, opts)
  }
}

const unlockScrollAndUnbindKeys = () => {
  abortCtrl?.abort()
  if (typeof document !== 'undefined') {
    document.documentElement.style.overflow = prevOverflow || ''
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen) lockScrollAndBindKeys()
  else unlockScrollAndUnbindKeys()
})

onBeforeUnmount(() => {
  unlockScrollAndUnbindKeys()
})
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      ref="modalRoot"
      tabindex="-1"
      class="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <!-- Backdrop com blur escuro -->
      <div
        class="absolute inset-0 bg-slate-900/30"
        :style="{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }"
        aria-hidden="true"
        @click="$emit('close')"
      />

      <!-- card -->
      <div class="relative w-full max-w-lg mx-4 rounded-2xl border border-white/10 bg-slate-900 shadow-xl" @click.stop>
        <div class="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 class="text-xl font-semibold">{{ title }}</h3>
          <button class="p-2 rounded hover:bg-white/5" @click="$emit('close')" aria-label="Fechar" type="button">×</button>
        </div>

        <!-- tabs -->
        <div class="px-5 pt-4">
          <div class="inline-flex rounded-xl border border-white/10 overflow-hidden text-sm">
            <button
              class="px-4 py-2"
              :class="tab==='mp3' ? 'bg-brand-save text-slate-900 font-semibold' : 'bg-white/5 hover:bg-white/10'"
              @click="tab='mp3'"
            >MP3</button>
            <button
              class="px-4 py-2"
              :class="tab==='mp4' ? 'bg-brand-save text-slate-900 font-semibold' : 'bg-white/5 hover:bg-white/10'"
              @click="tab='mp4'"
            >MP4</button>
          </div>
        </div>

        <!-- body -->
        <div class="p-5">
          <div v-if="tab==='mp3'">
            <p class="text-slate-300 text-sm mb-3">Escolha a qualidade do áudio (kbps):</p>
            <div class="grid grid-cols-3 gap-2">
              <label
                v-for="kb in mp3Options" :key="kb"
                class="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                <input type="radio" name="mp3kbps" :value="kb" v-model="mp3Kbps" class="accent-sky-500">
                <span>{{ kb }} kbps</span>
              </label>
            </div>
          </div>

          <div v-else>
            <p class="text-slate-300 text-sm mb-3">Escolha a resolução máxima do vídeo:</p>
            <div class="grid grid-cols-3 gap-2">
              <label
                v-for="res in mp4Options" :key="res"
                class="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                <input type="radio" name="mp4res" :value="res" v-model="mp4Res" class="accent-sky-500">
                <span>{{ res }}p</span>
              </label>
            </div>
            <p class="text-xs text-slate-400 mt-3">Usaremos o melhor vídeo até a resolução escolhida + melhor áudio.</p>
          </div>
        </div>

        <!-- footer -->
        <div class="p-5 border-t border-white/10 flex items-center justify-end gap-3">
          <button class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-base" @click="$emit('close')">Cancelar</button>
          <button class="px-6 py-3 rounded-xl bg-brand-save hover:bg-sky-400 text-slate-900 font-semibold text-base" @click="doConfirm">Baixar</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped></style>
