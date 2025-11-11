<script setup>
import { ref, onBeforeUnmount } from 'vue'
import ProgressBar from './ProgressBar.vue'
import QualityPickerModal from './QualityPickerModal.vue'
import { t } from '../i18n'

const url = ref('')
const accepted = ref(false)
const isDownloading = ref(false)
const progress = ref(0)

// modal
const modalOpen = ref(false)

let es = null
let ctrl = null

function closeSSE() { if (es) { try { es.close() } catch {} es = null } }
function startSSE() {
  closeSSE()
  es = new EventSource('/download-progress')
  es.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data || '{}')
      if (typeof data.progress === 'number') {
        if (data.progress < 0) {
          isDownloading.value = false
          progress.value = 0
          closeSSE()
          alert(data.error || 'Falha no download.')
        } else {
          progress.value = Math.max(0, Math.min(100, data.progress))
          if (data.progress >= 100) closeSSE()
        }
      }
    } catch {}
  }
  es.onerror = () => closeSSE()
}

function readFilenameFromContentDisposition(header) {
  if (!header) return null
  const m = header.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\\\";]+)\"?/i)
  const raw = (m && (m[1] || m[2])) ? (m[1] || m[2]) : null
  try { return raw ? decodeURIComponent(raw) : null } catch { return raw }
}
function sanitizeFilename(name) {
  return String(name).replace(/[\/\\:*?\"<>|]+/g, '_').trim() || 'download'
}

async function doDownload(selection) {
  isDownloading.value = true
  progress.value = 0
  startSSE()

  ctrl?.abort?.()
  ctrl = new AbortController()

  try {
    const fd = new FormData()
    fd.append('url', url.value.trim())
    fd.append('file_type', selection.file_type)
    if (selection.audio_bitrate != null) fd.append('audio_bitrate', String(selection.audio_bitrate))
    if (selection.video_quality != null) fd.append('video_quality', String(selection.video_quality))

    const res = await fetch('/', {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/octet-stream,application/json;q=0.9,*/*;q=0.8' },
      signal: ctrl.signal,
    })

    if (!res.ok) {
      let errMsg = 'Falha ao iniciar download.'
      try { const j = await res.clone().json(); errMsg = j?.error || errMsg } catch {}
      throw new Error(errMsg)
    }

    const blob = await res.blob()
    const cd = res.headers.get('Content-Disposition') || ''
    const suggested = readFilenameFromContentDisposition(cd)
    const fallbackExt = selection.file_type === 'mp3' ? '.mp3' : '.mp4'
    const filename = sanitizeFilename(suggested || `download${fallbackExt}`)

    const urlObj = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = urlObj
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(urlObj)
  } catch (err) {
    console.error(err)
    alert(err instanceof Error ? err.message : 'Erro ao processar sua solicitação.')
  } finally {
    isDownloading.value = false
    setTimeout(() => (progress.value = 0), 1200)
    closeSSE()
    ctrl = null
  }
}

function submit(e) {
  e.preventDefault()
  if (!accepted.value) return
  if (!url.value || !url.value.trim()) {
    alert('Informe uma URL válida.')
    return
  }
  modalOpen.value = true
}

function onPick(selection) {
  modalOpen.value = false
  doDownload(selection)
}

onBeforeUnmount(() => { closeSSE(); ctrl?.abort?.(); ctrl = null })
</script>

<template>
  <form @submit="submit" class="mt-6 glass-card p-5">
    <div class="flex flex-col md:flex-row gap-3">
      <input
        v-model="url"
        type="text"
        required
        :placeholder="t('form.placeholder')"
        class="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0a25ad]"
      />

      <button
        type="submit"
        :disabled="!accepted || isDownloading"
        class="px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 font-semibold text-white"
      >
        {{ isDownloading ? t('form.downloading') : t('form.search') }}
      </button>
    </div>

    <label class="flex items-center gap-2 mt-4 text-sm text-slate-300 select-none">
      <input type="checkbox" v-model="accepted" class="accent-[#0a25ad]" />
      {{ t('form.acceptPrefix') }}
      <a href="#termos-e-condicoes" @click.stop class="text-brand-save underline">{{ t('form.termsLink') }}</a>
    </label>

    <div v-if="isDownloading || progress > 0" class="mt-4">
      <ProgressBar :progress="progress" />
    </div>
  </form>

  <QualityPickerModal
    :open="modalOpen"
    :url="url"
    @close="modalOpen=false"
    @pick="onPick"
  />
</template>

<style scoped></style>

