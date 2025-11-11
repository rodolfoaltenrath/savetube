<script setup>
import { i18n, setLang } from '../i18n'
import { ref } from 'vue'

const open = ref(false)
const options = [
  { code: 'pt', label: 'Português (BR)', flag: 'https://flagcdn.com/w20/br.png' },
  { code: 'en', label: 'English (US)', flag: 'https://flagcdn.com/w20/us.png' },
]

function current() {
  return options.find(o => o.code === i18n.lang) || options[0]
}
function choose(code) { setLang(code); open.value = false }
</script>

<template>
  <div class="relative inline-block">
    <button type="button" class="btn-ghost-icon" @click="open = !open" aria-label="Language">
      <img :src="current().flag" alt="lang" class="w-5 h-auto rounded-sm" />
    </button>
    <div v-show="open" class="absolute right-0 mt-2 w-40 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-lg z-[1000]">
      <button v-for="opt in options" :key="opt.code" class="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-sm"
              @click="choose(opt.code)">
        <img :src="opt.flag" :alt="opt.label" class="w-4 h-auto rounded-sm" />
        <span class="truncate">{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
