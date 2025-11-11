<template>
  <footer class="footer-root relative z-20 w-full">
    <div class="inner flex flex-col items-center justify-center gap-1">
      <span class="copy">
        © {{ year }}&nbsp;
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          class="brand-themis"
          aria-label="Instagram SaveTube"
          title="Instagram"
        >
          SaveTube
        </a>
        . {{ t('footer.made') }}
      </span>
    </div>
  </footer>
</template>

<script setup>
import { t } from '../i18n'
const year = new Date().getFullYear()
</script>

<style scoped>
/* Barra com as mesmas características de vidro do header */
.footer-root {
  padding: 8px 14px;                 /* um pouco mais alto para o blur aparecer */
  background: rgba(255,255,255, .08);/* leve opacidade no claro */
  border-top: 1px solid rgba(148,163,184,.35);
  text-align: center;
  position: relative;
  margin-top: auto;
  backdrop-filter: saturate(140%) blur(10px);
  -webkit-backdrop-filter: saturate(140%) blur(10px);
}
.dark .footer-root{
  background: rgba(2,6,23, .35);     /* película escura translúcida */
  border-top-color: rgba(30,41,59,.55);
}

.inner { gap: 2px; }

.copy {
  font-size: 11.5px;
  line-height: 1.2;
  color: rgba(248,250,252,.9);
  letter-spacing: 0.2px;
  white-space: nowrap;
}
.dark .copy{ color: #d1d5db; }

/* Marca com gradiente */
.brand-themis {
  font-weight: 600;
  background: linear-gradient(90deg, #1c3d86 0%, #2e4cee 50%, #1e2bb5 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-decoration: none;
}
.brand-themis:hover { text-decoration: underline; }
</style>

