/* =====================================================
   main.js — Joako Estratega · landings v2
   Tracking + formularios + UX. Sin dependencias externas.
   Los hrefs van directo en el HTML. El JS solo trackea.
   ===================================================== */

(function () {
  'use strict';

  window.JOAKO = window.JOAKO || {};
  const CONFIG = Object.assign({
    APPS_SCRIPT_URL: 'PEGA_AQUI_EL_URL_DE_TU_APPS_SCRIPT',
    GA4_ID: '',
    META_PIXEL_ID: '',
    CLARITY_ID: '',
    DEBUG: false
  }, window.JOAKO);
  window.JOAKO = CONFIG;

  const log = (...a) => CONFIG.DEBUG && console.log('[joako]', ...a);

  // ── ANALYTICS LOADERS (opcionales) ─────────────────
  function loadGA4() {
    if (!CONFIG.GA4_ID) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA4_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', CONFIG.GA4_ID, { send_page_view: true });
  }
  function loadMetaPixel() {
    if (!CONFIG.META_PIXEL_ID) return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', CONFIG.META_PIXEL_ID); fbq('track', 'PageView');
  }
  function loadClarity() {
    if (!CONFIG.CLARITY_ID) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CONFIG.CLARITY_ID);
  }

  function track(name, params) {
    params = params || {};
    if (window.gtag) gtag('event', name, params);
    if (window.fbq) {
      const std = ['Lead', 'CompleteRegistration', 'Contact', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'];
      if (std.includes(params.meta_event_name)) fbq('track', params.meta_event_name, params);
      else fbq('trackCustom', name, params);
    }
    if (window.clarity) clarity('event', name);
    log(name, params);
  }
  CONFIG.track = track;

  // ── SCROLL DEPTH ───────────────────────────────────
  function initScrollTracking() {
    const hits = { 25: false, 50: false, 75: false, 100: false };
    let ticking = false;
    function check() {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (total <= 0) return;
      const pct = (h.scrollTop / total) * 100;
      [25, 50, 75, 100].forEach(t => {
        if (!hits[t] && pct >= t) {
          hits[t] = true;
          track('scroll_depth', { percent: t, page: location.pathname });
        }
      });
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { check(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }

  function initTimeTracking() {
    [30, 60, 180].forEach(s => setTimeout(() => {
      if (!document.hidden) track('time_on_page', { seconds: s, page: location.pathname });
    }, s * 1000));
  }

  // ── CTA TRACKING (cualquier elemento con data-cta) ─
  function initCtaTracking() {
    document.addEventListener('click', e => {
      const cta = e.target.closest('[data-cta]');
      if (!cta) return;
      track('cta_click', {
        cta_id: cta.dataset.cta,
        cta_text: (cta.textContent || '').trim().slice(0, 80),
        page: location.pathname
      });
    });
  }

  // ── FORMULARIOS ────────────────────────────────────
  function initForms() {
    document.querySelectorAll('form[data-form]').forEach(form => {
      const producto = form.dataset.form;
      const successUrl = form.dataset.success || '';
      const partial = { sent: false };

      form.addEventListener('focusin', () => {
        if (!form.dataset.startTracked) {
          form.dataset.startTracked = '1';
          track('form_start', { producto });
        }
      });

      form.addEventListener('focusout', () => {
        if (partial.sent) return;
        const fd = new FormData(form);
        const nombre = (fd.get('nombre') || '').toString().trim();
        const whatsapp = (fd.get('whatsapp') || '').toString().trim();
        const email = (fd.get('email') || '').toString().trim();
        if (nombre && (whatsapp || email)) {
          partial.sent = true;
          enviarApps(buildPayload(form, producto, 'Lead parcial'));
        }
      });

      form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const txt = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

        const ok = await enviarApps(buildPayload(form, producto, 'Aplicó'));
        if (ok) {
          form.dataset.completedTracked = '1';
          track('form_complete', { producto, meta_event_name: 'Lead' });
          if (successUrl) location.href = successUrl;
          else mostrarOk(form);
        } else {
          if (btn) { btn.disabled = false; btn.textContent = txt; }
          alert('No pudimos enviar. Intenta de nuevo o escríbeme por WhatsApp.');
        }
      });
    });
  }

  function buildPayload(form, producto, estado) {
    const fd = new FormData(form);
    const data = { producto, estado, origen: location.href };
    fd.forEach((v, k) => { data[k] = (typeof v === 'string') ? v.trim() : v; });
    return data;
  }

  async function enviarApps(payload) {
    if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.startsWith('PEGA')) {
      console.warn('[joako] APPS_SCRIPT_URL no configurado');
      return true;
    }
    try {
      await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return true;
    } catch (err) { console.error('[joako] error envío:', err); return false; }
  }

  function mostrarOk(form) {
    const div = document.createElement('div');
    div.className = 'form-ok';
    div.innerHTML = '<strong>¡Listo!</strong> Te contacto pronto por WhatsApp.';
    form.replaceWith(div);
  }

  // ── ABANDONO ───────────────────────────────────────
  function initAbandonTracking() {
    window.addEventListener('beforeunload', () => {
      document.querySelectorAll('form[data-form]').forEach(f => {
        if (f.dataset.startTracked === '1' && !f.dataset.completedTracked) {
          track('form_abandon', { producto: f.dataset.form });
        }
      });
    });
  }

  // ── FAQ TOGGLE TRACKING ────────────────────────────
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(item => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          const q = item.querySelector('summary');
          track('faq_open', { pregunta: q ? q.textContent.trim().slice(0, 80) : '' });
        }
      });
    });
  }

  // ── REVEAL ON SCROLL ───────────────────────────────
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
  }

  function initVideoTracking() {
    document.querySelectorAll('video[data-video]').forEach(v => {
      const id = v.dataset.video;
      const hits = { 50: false, 100: false };
      v.addEventListener('play', () => track('video_play', { video: id }), { once: true });
      v.addEventListener('timeupdate', () => {
        if (!v.duration) return;
        const pct = (v.currentTime / v.duration) * 100;
        if (!hits[50] && pct >= 50) { hits[50] = true; track('video_50', { video: id }); }
        if (!hits[100] && pct >= 95) { hits[100] = true; track('video_complete', { video: id }); }
      });
    });
  }

  function boot() {
    loadGA4(); loadMetaPixel(); loadClarity();
    initCtaTracking(); initScrollTracking(); initTimeTracking();
    initForms(); initAbandonTracking(); initFaq(); initReveal(); initVideoTracking();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();