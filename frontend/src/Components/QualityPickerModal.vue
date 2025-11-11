<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { t } from '../i18n'

const props = defineProps({
  open: { type: Boolean, default: false },
  url: { type: String, default: '' },
})
const emit = defineEmits(['close', 'pick'])

const tab = ref('audio')
const mp3Options = [320, 256, 192, 128, 96, 64]
const mp4Options = [2160, 1440, 1080, 720, 480, 360]

const loadingMeta = ref(false)
const meta = ref({ title: '', thumbnail: '' })

async function fetchMeta() {
  if (!props.url) return
  loadingMeta.value = true
  try {
    const res = await fetch('/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: props.url })
    })
    if (res.ok) {
      const j = await res.json()
      meta.value = {
        title: String(j?.title || ''),
        thumbnail: String(j?.thumbnail || ''),
      }
    } else {
      meta.value = { title: '', thumbnail: '' }
    }
  } catch {
    meta.value = { title: '', thumbnail: '' }
  } finally {
    loadingMeta.value = false
  }
}

watch(() => props.open, (v) => { if (v) fetchMeta() })
watch(() => props.url, () => { if (props.open) fetchMeta() })

function pickMp3(kbps) {
  emit('pick', { file_type: 'mp3', audio_bitrate: kbps, video_quality: null })
}
function pickMp4(res) {
  emit('pick', { file_type: 'mp4', audio_bitrate: null, video_quality: res })
}

function lockBackground(lock) {
  try {
    const html = document.documentElement
    const body = document.body
    if (lock) {
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
      body.style.overscrollBehavior = 'contain'
      body.style.touchAction = 'none'
    } else {
      html.style.overflow = ''
      body.style.overflow = ''
      body.style.overscrollBehavior = ''
      body.style.touchAction = ''
    }
  } catch {}
}
watch(() => props.open, (isOpen) => { lockBackground(!!isOpen) })
onBeforeUnmount(() => lockBackground(false))
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />

      <!-- card -->
      <div class="relative w-full max-w-[1100px] rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-xl h-[78vh] flex flex-col overflow-hidden quality-modal">
        <!-- header -->
        <div class="relative p-4 sm:p-5 border-b border-white/10 flex items-center justify-center sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm">
          <h3 class="text-lg sm:text-xl font-semibold text-center">{{ t('modal.title') }}</h3>
          <button class="p-2 rounded hover:bg-white/5 absolute right-2 sm:right-4 top-1/2 -translate-y-1/2" @click="$emit('close')" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-slate-300">
              <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- body -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1">
          <div class="grid sm:grid-cols-3 gap-3 sm:gap-4">
            <!-- coluna esquerda: preview -->
            <div class="sm:col-span-1">
              <div class="left-preview aspect-video w-full rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <template v-if="meta.thumbnail && !loadingMeta">
                  <img :src="meta.thumbnail" alt="preview" class="w-full h-full object-cover" />
                </template>
                <template v-else>
                  <div class="w-full h-full flex items-center justify-center text-slate-400 text-sm">{{ t('modal.preview') }}</div>
                </template>
              </div>
              <p class="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2">
                {{ loadingMeta ? '...' : (meta.title || 'Video') }}
              </p>
            </div>

            <!-- coluna direita: PAINEL com abas centralizadas + tabela -->
            <div class="sm:col-span-2">
              <div class="rounded-xl border border-white/10 overflow-hidden qm-panel">
                <!-- header do painel com as abas centralizadas -->
                <div class="bg-white/5 px-3 py-3 flex justify-center qm-tabs-bar">
                  <div class="inline-flex rounded-xl border border-white/10 overflow-hidden text-xs sm:text-sm tab-group">
                    <button class="px-3 py-2 sm:px-4" :class="tab==='audio' ? 'bg-brand-save text-white font-semibold' : 'bg-white/5 hover:bg-white/10'" @click="tab='audio'">{{ t('modal.audioTab') }}</button>
                    <button class="px-3 py-2 sm:px-4" :class="tab==='video' ? 'bg-brand-save text-white font-semibold' : 'bg-white/5 hover:bg-white/10'" @click="tab='video'">{{ t('modal.videoTab') }}</button>
                  </div>
                </div>

                <!-- tabela de Áudio -->
                <div v-if="tab==='audio'">
                  <table class="w-full table-fixed text-xs sm:text-sm">
                    <thead class="bg-white/5">
                      <tr>
                        <th class="text-left px-3 py-1.5 sm:px-4 sm:py-2">{{ t('modal.col.type') }}</th>
                        <th class="text-left px-3 py-1.5 sm:px-4 sm:py-2">{{ t('modal.col.format') }}</th>
                        <th class="text-left px-3 py-1.5 sm:px-4 sm:py-2">{{ t('modal.col.action') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="kb in mp3Options" :key="kb" class="border-t border-white/10">
                        <td class="px-3 py-1.5 sm:px-4 sm:py-2">MP3 — {{ kb }}kbps</td>
                        <td class="px-3 py-1.5 sm:px-4 sm:py-2">Auto</td>
                        <td class="px-3 py-1.5 sm:px-4 sm:py-2 w-[220px] sm:w-[260px] action">
                          <button class="block w-full text-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-brand-save hover:bg-sky-400 text-white font-bold text-base sm:text-lg download-btn" @click="pickMp3(kb)">
                            {{ t('action.download') }}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- tabela de Vídeo -->
                <div v-else>
                  <table class="w-full table-fixed text-xs sm:text-sm">
                    <thead class="bg-white/5">
                      <tr>
                        <th class="text-left px-3 py-1.5 sm:px-4 sm:py-2">{{ t('modal.col.type') === 'File type' ? 'Resolution' : 'Resolução' }}</th>
                        <th class="text-left px-3 py-1.5 sm:px-4 sm:py-2">{{ t('modal.col.format') }}</th>
                        <th class="text-left px-3 py-1.5 sm:px-4 sm:py-2">{{ t('modal.col.action') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="res in mp4Options" :key="res" class="border-t border-white/10">
                        <td class="px-3 py-1.5 sm:px-4 sm:py-2">{{ res }}p</td>
                        <td class="px-3 py-1.5 sm:px-4 sm:py-2">Auto</td>
                        <td class="px-3 py-1.5 sm:px-4 sm:py-2 w-[220px] sm:w-[260px] action">
                          <button class="block w-full text-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-brand-save hover:bg-sky-400 text-white font-bold text-base sm:text-lg download-btn" @click="pickMp4(res)">
                            {{ t('action.download') }}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p v-if="tab==='video'" class="text-xs text-slate-400 mt-3">{{ t('modal.footnote') }}</p>
            </div>
          </div>
        </div>

        <!-- footer -->
        <div class="p-4 border-t border-white/10 flex items-center justify-end sticky bottom-0 bg-slate-900/95 backdrop-blur-sm">
          <button class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20" @click="$emit('close')">{{ t('action.close') }}</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<!-- sem scoped para evitar conflito, escopo via classe .quality-modal -->
<style>
/* Centraliza o grupo de abas no painel da tabela */
.quality-modal .qm-tabs-bar { display:flex; justify-content:center; align-items:center; }
.quality-modal .qm-tabs-bar .tab-group { margin:0 auto; }

/* Botões de Baixar preenchem a coluna */
.quality-modal td.action { width: 16rem; }
.quality-modal .download-btn {
  width: 100%;
  padding: 0.5rem 1rem;
  line-height: 1.15;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 0.75rem;
}
@media (min-width: 640px) {
  .quality-modal td.action { width: 18rem; }
  .quality-modal .download-btn { font-size: 1.0625rem; padding-top: .55rem; padding-bottom: .55rem; }
}

.quality-modal table { table-layout: fixed; }
.quality-modal .left-preview { max-height: 180px; }
.quality-modal .left-preview img, .quality-modal .left-preview > div { height: 100%; }
</style>

