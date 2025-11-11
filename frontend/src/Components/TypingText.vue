<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

// Componente de digitação com 2 modos:
// - Modo padrão: digita o `fullText`, espera e apaga (loop)
// - Modo mobile (opcional): percorre `sequence` item a item, apagando entre eles,
//   com pausa maior no último, em loop infinito
const props = defineProps({
  fullText: { type: String, default: 'Explore. Obtenha. Desfrute!' },
  typeSpeed: { type: Number, default: 70 },
  deleteSpeed: { type: Number, default: 45 },
  holdDelay: { type: Number, default: 5000 },
  startDelay: { type: Number, default: 300 },
  loop: { type: Boolean, default: true },

  // Sequência para mobile
  sequence: { type: Array, default: () => null },
  betweenDelay: { type: Number, default: 600 },     // pausa entre itens (não último)
  finalHold: { type: Number, default: 5000 },       // pausa após último
  mobileQuery: { type: String, default: '(max-width: 640px)' },
  enableSequenceOnMobile: { type: Boolean, default: true },
})

const text = ref('')
let char = 0
let deleting = false
let timer = null
let seqIndex = 0
const isMobile = ref(false)

function computeIsMobile() {
  if (typeof window === 'undefined') return false
  try {
    return window.matchMedia?.(props.mobileQuery)?.matches ?? false
  } catch { return false }
}

function getMode() {
  return props.enableSequenceOnMobile && Array.isArray(props.sequence) && props.sequence.length > 0 && isMobile.value
    ? 'sequence'
    : 'single'
}

function resetState() {
  clearTimeout(timer)
  text.value = ''
  char = 0
  deleting = false
  seqIndex = 0
}

function tick() {
  const mode = getMode()

  if (mode === 'sequence') {
    const current = props.sequence[seqIndex] ?? ''
    if (!deleting) {
      text.value = current.slice(0, char + 1)
      char++
      if (char === current.length) {
        // terminou de digitar o item atual
        deleting = true
        const isLast = seqIndex === props.sequence.length - 1
        schedule(isLast ? props.finalHold : props.betweenDelay)
        return
      }
      schedule(props.typeSpeed)
    } else {
      text.value = current.slice(0, char - 1)
      char--
      if (char === 0) {
        // troca para o próximo item
        deleting = false
        seqIndex = (seqIndex + 1) % props.sequence.length
        schedule(props.startDelay)
        return
      }
      schedule(props.deleteSpeed)
    }
    return
  }

  // modo single padrão
  const current = props.fullText
  if (!deleting) {
    text.value = current.slice(0, char + 1)
    char++
    if (char === current.length) {
      if (props.loop) {
        deleting = true
        schedule(props.holdDelay)
        return
      }
    }
    schedule(props.typeSpeed)
  } else {
    text.value = current.slice(0, char - 1)
    char--
    if (char === 0) {
      deleting = false
      schedule(props.startDelay)
      return
    }
    schedule(props.deleteSpeed)
  }
}

function schedule(ms) {
  clearTimeout(timer)
  timer = setTimeout(tick, ms)
}

onMounted(() => {
  isMobile.value = computeIsMobile()
  // ouvir mudanças de viewport
  let mql = null
  try { mql = window.matchMedia?.(props.mobileQuery) || null } catch {}
  if (mql && typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', (e) => {
      isMobile.value = !!e.matches
    })
  } else if (mql && typeof mql.addListener === 'function') {
    // fallback
    mql.addListener((e) => { isMobile.value = !!e.matches })
  }
  schedule(props.startDelay)
})

watch(isMobile, () => {
  // alternou entre mobile/desktop: reinicia
  resetState()
  schedule(props.startDelay)
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <span class="typing">{{ text }}</span>
  <span class="sr-only">{{ fullText }}</span>
</template>

<style scoped>
.typing {
  display: inline-block;
  white-space: nowrap;
  border-right: 2px solid currentColor;
  padding-right: 2px;
  animation: caretBlink 1s step-end infinite;
}

@keyframes caretBlink {
  0%, 100% { border-color: transparent; }
  50% { border-color: currentColor; }
}
</style>

