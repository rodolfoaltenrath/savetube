import { createApp } from 'vue'
import App from './App.vue'
import './tailwind.css'

console.log('[SaveTube] main.js carregado');

(function () {
  if (window.__savetubeBehaviorsInstalled) return;
  window.__savetubeBehaviorsInstalled = true;

  const API_BASE = '/api/main';
  const api = (p = '') => `${API_BASE}${p}`;

  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function smoothScrollTo(targetY, duration = 300, offset = 0) {
    const startY = window.scrollY || window.pageYOffset;
    const distance = (targetY - offset) - startY;
    const startTime = performance.now();
    function easeInOutQuad(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }
    function step(now) {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);
      const eased = easeInOutQuad(p);
      window.scrollTo(0, startY + distance * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function throttle(fn, wait = 50) {
    let last = 0;
    let timer = null;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn(...args);
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
          last = Date.now();
          fn(...args);
        }, wait - (now - last));
      }
    };
  }

  const SECTION_IDS = ['section_1', 'section_2', 'section_3', 'section_4', 'section_5'];
  const TOP_OFFSET = 75;

  const navbar = qs('.navbar');
  function updateSticky() {
    if (!navbar) return;
    if ((window.scrollY || window.pageYOffset) > 0) {
      navbar.classList.add('is-sticky');
    } else {
      navbar.classList.remove('is-sticky');
    }
  }
  updateSticky();
  window.addEventListener('scroll', throttle(updateSticky, 50), { passive: true });

  const toggler = qs('.navbar-toggler');
  const navCollapse = qs('#navbarNav');
  if (toggler && navCollapse) {
    const toggleMenu = () => navCollapse.classList.toggle('hidden');
    toggler.addEventListener('click', toggleMenu);
    navCollapse.addEventListener('click', (e) => {
      const el = e.target.closest('a');
      if (!el) return;
      if (!navCollapse.classList.contains('hidden')) {
        navCollapse.classList.add('hidden');
      }
    });
  }

  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      const id = href && href.startsWith('#') ? href.slice(1) : null;
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset;
      smoothScrollTo(top, 300, TOP_OFFSET);
    });
  });

  const clickScrollLinks = qsa('.click-scroll');
  function setActiveNav(index) {
    clickScrollLinks.forEach((link, i) => {
      if (i === index) {
        link.classList.add('active');
        link.classList.remove('inactive');
      } else {
        link.classList.remove('active');
        link.classList.add('inactive');
      }
    });
  }
  if (clickScrollLinks.length) {
    clickScrollLinks.forEach(l => l.classList.add('inactive'));
    clickScrollLinks[0].classList.remove('inactive');
    clickScrollLinks[0].classList.add('active');
  }
  clickScrollLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      const id = SECTION_IDS[index];
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset;
      smoothScrollTo(top, 300, TOP_OFFSET);
    });
  });
  function refreshActiveByScroll() {
    let currentIndex = 0;
    SECTION_IDS.forEach((id, idx) => {
      const el = id && document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.pageYOffset - TOP_OFFSET;
      if ((window.scrollY || window.pageYOffset) + 1 >= top) currentIndex = idx;
    });
    setActiveNav(currentIndex);
  }
  refreshActiveByScroll();
  window.addEventListener('scroll', throttle(refreshActiveByScroll, 50), { passive: true });

  const revealElems = qsa('#vertical-scrollable-timeline li');
  if (revealElems.length) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          entry.target.classList.remove('active');
        }
      }
      const cont = qs('#vertical-scrollable-timeline');
      if (cont) {
        const rect = cont.getBoundingClientRect();
        const halfHeight = window.innerHeight * 0.5;
        const bottom = rect.bottom - halfHeight;
        const inner = qs('#vertical-scrollable-timeline .inner');
        if (inner) inner.style.height = `${Math.max(0, bottom)}px`;
      }
    }, { root: null, threshold: 0.5 });
    revealElems.forEach(el => io.observe(el));
  }

  let es = null;
  function openProgressSSE() {
    if (es) {
      try { es.close(); } catch (_) {}
      es = null;
    }
    const bar = qs('#progressBar') || qs('[data-progress="bar"]');
    const txt = qs('#progressPct') || qs('[data-progress="label"]');
    const wrap = qs('#progressWrap') || qs('[data-progress="wrap"]');
    if (wrap) wrap.classList.remove('hidden');
    if (bar)  bar.style.width = '0%';
    if (txt)  txt.textContent = '0%';
    es = new EventSource(api('/download-progress'));
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data || '{}');
        const p = typeof data.progress === 'number' ? data.progress : 0;
        if (bar) bar.style.width = `${Math.max(0, Math.min(100, p))}%`;
        if (txt) txt.textContent = `${Math.max(0, Math.min(100, Math.floor(p)))}%`;
        if (p >= 100 || p < 0) {
          es.close();
          es = null;
          if (p < 0) {
            const msg = (data && data.error) ? String(data.error) : 'Falha no download.';
            showMessage(msg, true);
          }
        }
      } catch (e) {
        console.warn('SSE parse error:', e);
      }
    };
    es.onerror = () => {};
  }

  function closeProgressSSE() {
    if (es) {
      try { es.close(); } catch (_) {}
      es = null;
    }
  }

  function readFilenameFromContentDisposition(header) {
    if (!header) return null;
    const m = header.match(/filename\*=UTF-8''([^;]+)|filename="?([^\";]+)"?/i);
    const raw = (m && (m[1] || m[2])) ? (m[1] || m[2]) : null;
    try { return raw ? decodeURIComponent(raw) : null; } catch { return raw; }
  }

  function showMessage(msg, isError = false) {
    const box = qs('#message') || qs('[data-message]');
    if (!box) {
      if (isError) console.error(msg); else console.log(msg);
      return;
    }
    box.textContent = msg || '';
    box.classList.remove('hidden');
    box.classList.toggle('text-red-600', !!isError);
    box.classList.toggle('text-emerald-600', !isError);
  }

  async function startDownload(urlValue, fileTypeValue = 'mp4') {
    if (!urlValue || !String(urlValue).trim()) {
      showMessage('Informe uma URL válida.', true);
      throw new Error('URL vazia');
    }
    const file_type = (fileTypeValue || 'mp4').toLowerCase().trim();
    openProgressSSE();
    try {
      const res = await fetch(api('/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'fetch',
          'Accept': 'application/octet-stream,application/json;q=0.9,*/*;q=0.8'
        },
        body: JSON.stringify({ url: urlValue.trim(), file_type })
      });
      if (!res.ok) {
        let errMsg = 'Falha ao iniciar download.';
        try {
          const j = await res.clone().json();
          errMsg = j?.error || errMsg;
        } catch {}
        showMessage(errMsg, true);
        throw new Error(errMsg);
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const suggested = readFilenameFromContentDisposition(cd) || `download.${file_type === 'mp3' ? 'mp3' : 'mp4'}`;
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObj;
      a.download = suggested;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlObj);
      showMessage('Download concluído.');
    } catch (err) {
      console.error(err);
      if (!qs('#message') && !qs('[data-message]')) {
        console.error('Erro no download:', err);
      }
      throw err;
    } finally {
      setTimeout(() => {
        closeProgressSSE();
        const wrap = qs('#progressWrap') || qs('[data-progress="wrap"]');
        if (wrap) wrap.classList.remove('hidden');
      }, 600);
    }
  }

  const form = qs('#downloadForm') || qs('form[data-role="download"]') || qs('form[action="/"]');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const urlInput = qs('#url', form) || qs('input[name="url"]', form);
      const typeSelect = qs('#file_type', form) || qs('select[name="file_type"]', form);
      const typeRadio  = qs('input[name="file_type"]:checked', form);
      const urlVal = urlInput ? urlInput.value : '';
      const typeVal = (typeRadio && typeRadio.value) || (typeSelect && typeSelect.value) || 'mp4';
      try {
        await startDownload(urlVal, typeVal);
      } catch (_) {}
    });
  }

  window.SaveTube = { startDownload };
  window.SaveTubeBehaviors = { refreshActiveByScroll, updateSticky };
})();

try {
  const mountEl = document.getElementById('app');
  if (mountEl) {
    createApp(App).mount('#app');
  } else {
    console.warn('Container #app não encontrado no HTML.');
  }
} catch (err) {
  console.error('Falha ao inicializar a aplicação Vue:', err);
}
