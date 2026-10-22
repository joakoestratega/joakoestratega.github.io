/* medir.js — medición de las páginas de regalo (taller, campañas con IA).
 * Mismos IDs públicos que la portada (GA4, pixel de Meta, Clarity). Ningún secreto.
 * Solo cuenta clics y páginas: nunca manda nombres, teléfonos ni correos.
 * Uso: <script src="/assets/medir.js" data-pagina="taller" defer></script>
 *      window.medir('registro', {...}) para eventos propios.
 */
(function () {
  'use strict';
  var GA4 = 'G-FZZB8HHQ03', PIXEL = '1788355601952516', CLARITY = 'wrih01ohra';
  var yo = document.currentScript;
  var pagina = (yo && yo.dataset.pagina) || location.pathname.split('/')[1] || 'inicio';

  var s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA4, { send_page_view: true, regalo: pagina });

  !function (f, b, e, v, n, t, x) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
    x = b.getElementsByTagName(e)[0]; x.parentNode.insertBefore(t, x);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('set', 'autoConfig', false, PIXEL); fbq('init', PIXEL); fbq('track', 'PageView'); fbq('trackCustom', 'VioRegalo', { regalo: pagina });

  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY);
  try { clarity('set', 'regalo', pagina); } catch (e) {}

  window.medir = function (evento, datos) {
    datos = Object.assign({ regalo: pagina }, datos || {});
    try { gtag('event', evento, datos); } catch (e) {}
    try { fbq('trackCustom', evento, datos); } catch (e) {}
  };

  // Clics que dicen si el regalo se usó: descargas, botones de copiar, WhatsApp y enlaces internos.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    var b = e.target.closest && e.target.closest('button');
    if (a) {
      var href = a.getAttribute('href') || '';
      if (a.hasAttribute('download')) return window.medir('descarga', { archivo: href.split('/').pop() });
      if (/wa\.me/.test(href)) return window.medir('clic_whatsapp', { texto: (a.textContent || '').trim().slice(0, 40) });
      if (/\.html$/.test(href)) return window.medir('abrio', { pagina_destino: href.split('/').pop() });
      return;
    }
    if (b && /copiar/i.test(b.textContent || '')) {
      // Nunca el texto copiado (puede llevar lo que la persona escribió): solo qué botón fue.
      var caja = b.closest('.copiar, .prompt');
      var todos = Array.prototype.slice.call(document.querySelectorAll('.copiar, .prompt'));
      window.medir('copio', { boton: (caja && caja.dataset.medir) || ('boton-' + (todos.indexOf(caja) + 1)) });
    }
  }, true);
})();
