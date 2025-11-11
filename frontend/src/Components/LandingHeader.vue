<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import FooterBar from './FooterBar.vue'
import LangSwitcher from './LangSwitcher.vue'

/**
 * Props opcionais para adaptar ao seu app:
 * - brand: texto do logotipo (ex.: "SaveTube")
 * - links: itens do menu (label + href)
 * - isAuthenticated: controla botões Home/Sair vs Login
 * - homeHref, loginHref, logoutHref: URLs dos botões
 */
const props = defineProps({
  brand: { type: String, default: 'Themis' },
  links: {
    type: Array,
    default: () => ([
      { label: 'Sobre', href: '/sobre' },
      { label: 'Recursos', href: '/recursos' },
      { label: 'Planos', href: '/planos' },
      { label: 'Blog', href: '/blog' },
    ])
  },
  isAuthenticated: { type: Boolean, default: false },
  homeHref: { type: String, default: '/' },
  loginHref: { type: String, default: '/login' },
  logoutHref: { type: String, default: '/logout' },
})

/* ---------------- estado e helpers ---------------- */
const darkMode = ref(true)             // escuro padrão
const mobileOpen = ref(false)
const YEAR = new Date().getFullYear()

const docEl = () => document.documentElement
const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------- morph/header ---------------- */
let scrollHandler = null
let rafId = null
const PILL_EASE = 0.10
const PILL_DIST = 130
const OFFSET = 0

function installHeaderMorph() {
  const shell = document.getElementById('rofHeader')
  if (!shell) return

  const updateTopClass = () => {
    shell.classList.toggle('rof--at-top', window.scrollY <= (OFFSET + 1))
  }

  let target = 0
  let current = 0

  const computeTarget = () => {
    const y = window.scrollY - OFFSET
    target = clamp(y / PILL_DIST, 0, 1)
    updateTopClass()
  }

  if (prefersReducedMotion()) {
    computeTarget()
    shell.style.setProperty('--pill', target.toFixed(3))
    scrollHandler = () => computeTarget()
    window.addEventListener('scroll', scrollHandler, { passive: true })
  } else {
    const tick = () => {
      current += (target - current) * PILL_EASE
      shell.style.setProperty('--pill', current.toFixed(3))
      rafId = requestAnimationFrame(tick)
    }
    computeTarget()
    tick()
    scrollHandler = () => computeTarget()
    window.addEventListener('scroll', scrollHandler, { passive: true })
  }
}

/* ---------------- mobile panel ---------------- */
function lockScroll(lock) {
  docEl().style.overflow = lock ? 'hidden' : ''
  document.body.style.overscrollBehavior = lock ? 'contain' : ''
}
function setMobileOpen(open) {
  mobileOpen.value = open
  const panel = document.getElementById('mobilePanel')
  const toggle = document.getElementById('navToggle')
  if (!panel || !toggle) return
  panel.style.height = open ? '100vh' : '0px'
  panel.style.opacity = open ? '1' : '0'
  panel.style.pointerEvents = open ? 'auto' : 'none'
  panel.setAttribute('aria-hidden', (!open).toString())
  toggle.setAttribute('aria-expanded', open.toString())
  lockScroll(open)
}

/* ---------------- dark mode ---------------- */
const LS_KEY = 'app:dark'
function applyDarkClass() {
  docEl().classList.toggle('dark', darkMode.value)
}
function toggleDark() { /* tema fixo dark */ }

/* ---------------- lifecycle ---------------- */
onMounted(() => {

  try { localStorage.setItem(LS_KEY, '1') } catch {}
  darkMode.value = true
  applyDarkClass()
  installHeaderMorph()

  // ESC fecha mobile
  window.addEventListener('keydown', onKeyDown, { passive: true })

  // Clique em links do painel mobile fecha painel
  const mobile = document.getElementById('mobilePanel')
  if (mobile) {
    mobile.addEventListener('click', (e) => {
      const a = e.target.closest('a')
      if (a) setMobileOpen(false)
    })
  }
})

onBeforeUnmount(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('keydown', onKeyDown)
  lockScroll(false)
})

function onKeyDown(e) {
  if (e.key === 'Escape' && mobileOpen.value) setMobileOpen(false)
}
</script>

<template>
  <div class="min-h-screen bg-transparent text-slate-100 font-sans relative overflow-x-hidden">
    <!-- 🔵/🟦 BACKGROUND GLOWS (azul no claro, azul/indigo no escuro) -->
    <div aria-hidden="true" class="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <!-- Base gradient background -->
      <div class="bg-hero-grad"></div>
      <!-- Tema CLARO (alinhado à paleta sky/brand.save) -->
      <div class="block dark:hidden">
        <div class="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[#38bdf8]/40 blur-[120px] mix-blend-screen glow-blob glow-1"></div>
        <div class="absolute -top-48 -right-24 w-[460px] h-[460px] rounded-full bg-[#7dd3fc]/40 blur-[120px] mix-blend-screen glow-blob glow-2"></div>
        <div class="absolute top-[420px] left-1/2 -translate-x-1/2 w-[1100px] h-[240px] rounded-full bg-[#38bdf8]/25 blur-[110px] mix-blend-screen glow-blob glow-3"></div>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[220px] rounded-[999px] bg-[#7dd3fc]/20 blur-[120px] mix-blend-screen glow-blob glow-4"></div>
      </div>
      <!-- Tema ESCURO (azul/índigo) -->
      <div class="hidden dark:block">
        <div class="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-blue-500/40 blur-[120px] mix-blend-screen glow-blob glow-1"></div>
        <div class="absolute -top-48 -right-24 w-[460px] h-[460px] rounded-full bg-indigo-500/40 blur-[120px] mix-blend-screen glow-blob glow-2"></div>
        <div class="absolute top-[420px] left-1/2 -translate-x-1/2 w-[1100px] h-[240px] rounded-full bg-blue-600/30 blur-[110px] mix-blend-screen glow-blob glow-3"></div>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[220px] rounded-[999px] bg-indigo-700/20 blur-[120px] mix-blend-screen glow-blob glow-4"></div>
      </div>
    </div>

    <!-- ================= NAVBAR (rof-header) ================= -->
      <header class="fixed top-0 left-0 right-0 z-[99]">
        <div class="mx-auto max-w-5xl px-4">
          <div id="rofHeader" class="rof-header">
          <div class="flex flex-row justify-between items-center px-3 md:px-5 py-2 md:py-3">
            <!-- logo -->
            <div class="flex w-full z-[2] items-start justify-start ml-4 md:ml-6">
              <a class="group relative w-auto flex justify-start items-center gap-2" href="/">
                <h1 class="text-2xl md:text-4xl transition-colors duration-300 brand-font text-sky-400 dark:text-white">
                  {{ brand }}
                </h1>
              </a>
            </div>

            <!-- nav desktop -->
              <nav class="lg:flex hidden relative z-[2] justify-center gap-6 items-center w-full">
                <a v-for="(item, i) in links" :key="i" :href="item.href" class="navlink">
                  <span>{{ item.label }}</span><span>{{ item.label }}</span>
                </a>
              </nav>

            <!-- CTAs (desktop): language switcher -->
            <div class="lg:flex hidden w-full items-center justify-end pr-4 md:pr-6 relative z-[2] gap-2">
              <LangSwitcher />
            </div>
            <!-- hamburger (mobile) -->
            <div class="lg:hidden flex items-center pr-2">
              <label class="hamburger relative z-[3]" role="button" aria-controls="mobilePanel" :aria-expanded="mobileOpen" aria-label="Abrir menu">
                <input id="navToggle" class="hidden" type="checkbox" :checked="mobileOpen" @change="setMobileOpen($event.target.checked)">
                <div class="flex flex-col gap-1.5 w-10 h-10 justify-center items-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10">
                  <span class="w-6 h-0.5 bg-black dark:bg-white transition-all duration-300"></span>
                  <span class="w-6 h-0.5 bg-black dark:bg-white transition-all duration-300"></span>
                  <span class="w-6 h-0.5 bg-black dark:bg-white transition-all duration-300"></span>
                </div>
              </label>
            </div>
          </div>

          <!-- painel mobile -->
          <div
            id="mobilePanel"
            class="fixed left-0 right-0 top-0 h-0 opacity-0 pointer-events-none bg-neutral-900 text-white
                   transition-[height,opacity] duration-500 ease-out"
            aria-hidden="true"
          >
            <div class="mt-20 w-full px-6">
              <a v-for="(item, i) in links" :key="i" :href="item.href" class="mobile-link">{{ item.label }}</a>

              <div class="mt-6 flex justify-center gap-3">
                <LangSwitcher />
              </div>


              </div>
            </div>
          </div>
          <!-- /painel mobile -->
        </div>
    </header>

    <!-- Espaço para o conteúdo da página do seu app -->
    <main class="pt-28 sm:pt-36">
      <slot />
    </main>

    <!-- Footer -->
    <FooterBar />
  </div>
</template>

<style>
/* Fonte do logotipo via CDN (definida em templates/index.html) */
.brand-font { font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; }
/* =================== FONTE OPCIONAL (mesmo nome usado no blade) =================== */
/* Ajuste o path se quiser ativar a fonte custom "Themis" */
@font-face {
  font-family: 'Themis';
  src: url('/fonts/themis.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

/* Paleta base para efeitos de vidro/gradientes (claro/escuro) */
:root{
  --glass-bg-light: 255,255,255;
  --glass-bg-dark: 2,6,23;
  --glass-bd: 148,163,184;
  --glass-bd-dark: 30,41,59;
  --brand-500: #38bdf8; /* azul claro (CLARO) */
}

/* ============== Header real/oficial (transparente no topo + morph) ============== */
.rof-header{
  position: relative;
  --pill: 0;
  --radius: calc(0px + 28px * var(--pill));
  --mt:     calc(0px + 12px * var(--pill));
  --shadow: calc(.00 + .28 * var(--pill));
  --bdA:    calc(0 + .50 * var(--pill));
  --bgA:    calc(0 + .72 * var(--pill));
  --blur:   calc(0px + 12px * var(--pill));
  margin-top: var(--mt);
  border-radius: var(--radius);
  border: 1px solid rgba(56,189,248, var(--bdA)); /* azul claro no CLARO */
  box-shadow: 0 18px 40px -20px rgba(0,0,0, var(--shadow));
  background: transparent;
  backdrop-filter: saturate(calc(100% + 40% * var(--pill))) blur(var(--blur));
  -webkit-backdrop-filter: saturate(calc(100% + 40% * var(--pill))) blur(var(--blur));
  overflow: visible;
}
.dark .rof-header{
  border-color: rgba(30,41,59, calc(.45 * var(--pill)));
}
.rof-header.rof--at-top{
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}
/* película interna (CLARO = tons azuis; ESCURO = tons slate) */
.rof-header::before{
  content: "";
  position: absolute; inset: 0; border-radius: inherit; z-index: 0;
  background: linear-gradient(135deg,
    rgba(255,255,255, var(--bgA)) 0%,
    rgba(224,242,254, calc(.40 * var(--bgA))) 38%,
    rgba(186,230,253, calc(.45 * var(--bgA))) 100%
  );
}
.dark .rof-header::before{
  background: linear-gradient(135deg,
    rgba(2,6,23,  calc(.70 * var(--bgA))) 0%,
    rgba(15,23,42, calc(.55 * var(--bgA))) 40%,
    rgba(30,41,59, calc(.60 * var(--bgA))) 100%
  );
}
/* linha inferior quando não está no topo */
.rof-header::after{
  content:"";
  position:absolute; left:0; right:0; bottom:0; height:1px;
  background: rgba(148,163,184,.35);
  opacity: var(--pill);
  pointer-events: none;
}
.dark .rof-header::after{ background: rgba(30,41,59,.55); }

/* ============== Links desktop com slide-up 1:1 ============== */
\.navlink{ position:relative; display:inline-block; overflow: hidden; height:1.25rem; padding:0 .3rem; white-space:nowrap; }
.navlink span{
  display:block; line-height:1.25rem; color:#38bdf8; font-weight:500; /* azul claro no CLARO */
  transition: transform .7s cubic-bezier(1,-0.01,.75,.11);
}
.dark .navlink span{ color:#ffffff; }
.navlink span:nth-child(1){ transform: translateY(0%); }
.navlink span:nth-child(2){ position:absolute; left:0; top:0; transform: translateY(110%); }
.navlink:hover span:nth-child(1){ transform: translateY(-90%); }
.navlink:hover span:nth-child(2){ transform: translateY(0%); }

/* ============== Mobile links 1:1 ============== */
.mobile-link{
  display:block; border-bottom:2px solid #404040;
  padding:1rem 0; font-size:2rem; font-weight:700; color:#a3a3a3;
  transition: color .3s ease, border-color .3s ease;
}
.mobile-link:hover{ color:#fff; border-color:#fff; }

/* ============== Botões ============== */
.btn-primary{
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #1d4ed8;
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: .875rem;
  border-radius: .5rem;
  text-align: center;
  transition: background-color .2s ease, box-shadow .2s ease, transform .1s ease;
  box-shadow: 0 0 0 0 rgba(59,130,246,0);
}
.btn-primary:hover{ background-color: #1e40af; }
.btn-primary:focus{ outline: none; box-shadow: 0 0 0 4px rgba(147,197,253,.6); }
.dark .btn-primary{ background-color: #2563eb; }
.dark .btn-primary:hover{ background-color: #1d4ed8; }
.dark .btn-primary:focus{ box-shadow: 0 0 0 4px rgba(30,64,175,.6); }

.btn-ghost-icon{
  height: 40px; width: 40px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: .6rem; transition: background .2s, transform .05s;
}
.btn-ghost-icon:hover{ background: rgba(0,0,0,.06); }
.dark .btn-ghost-icon:hover{ background: rgba(255,255,255,.06); }

/* ============== Hamburger animação (se usar input:checked) ============== */
.hamburger input:checked + div span:nth-child(1){ transform: translateY(6px) rotate(45deg); }
.hamburger input:checked + div span:nth-child(2){ opacity: 0; }
.hamburger input:checked + div span:nth-child(3){ transform: translateY(-6px) rotate(-45deg); }

/* ============== Animação dos glows de fundo ============== */
.glow-blob { animation: glowFloat 14s ease-in-out infinite; will-change: transform; }
.glow-1 { animation-duration: 16s; }
.glow-2 { animation-duration: 18s; animation-delay: -2s; }
.glow-3 { animation-duration: 20s; animation-delay: -4s; }
.glow-4 { animation-duration: 22s; animation-delay: -6s; }

@keyframes glowFloat {
  0%, 100% { transform: scale(1) translate(0, 0); }
  50%      { transform: scale(1.12) translate(8px, -10px); }
}

/* ============== Base gradient (azul #0c47dc) ============== */
.bg-hero-grad{
  position:absolute; inset:0; z-index:-1;
  /* Suave à esquerda e continuidade para a direita */
  background:
    radial-gradient(900px 700px at -10% -10%, rgba(12,71,220,0.85) 0%, rgba(12,71,220,0.35) 35%, rgba(3,10,23,0.00) 70%),
    radial-gradient(700px 600px at 110% -10%, rgba(44,110,255,0.35) 0%, rgba(44,110,255,0.12) 45%, rgba(3,10,23,0.00) 70%),
    linear-gradient(180deg, #06132e 0%, #020a17 100%);
}
.dark .bg-hero-grad{
  background:
    radial-gradient(900px 700px at -10% -10%, rgba(12,71,220,0.80) 0%, rgba(12,71,220,0.30) 35%, rgba(2,6,23,0.00) 70%),
    radial-gradient(700px 600px at 110% -10%, rgba(44,110,255,0.30) 0%, rgba(44,110,255,0.10) 45%, rgba(2,6,23,0.00) 70%),
    linear-gradient(180deg, #020a17 0%, #00040b 100%);
}
</style>













