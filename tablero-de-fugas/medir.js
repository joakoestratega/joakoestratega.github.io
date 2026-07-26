/* =====================================================================
   medir.js — Reproductor VSL con medición propia · Joako Estratega
   Reemplaza a VTurb. Sin dependencias, sin librerías, sin costo mensual.

   COMPORTAMIENTO (igual al de VTurb):
     1. Al entrar, el video arranca solo y EN SILENCIO.
     2. Encima aparece: "Tu video ya ha comenzado · Haz clic para escuchar".
     3. Al hacer clic, vuelve al segundo 0 y arranca con sonido.
     4. No se puede adelantar, retroceder ni reiniciar. Solo pausar y seguir.
     5. La barra avanza rápido al principio y lento al final.

   QUÉ MIDE:
     inicio_silencio · activa_sonido · avance (cada 5 s reales) · pausa
     reanuda · intento_saltar · oculta_pestana · desbloqueo · clic_compra
     fin · salida

   Por qué sendBeacon: es la única forma de que el evento llegue aunque
   la persona cierre la pestaña de golpe. Con fetch se pierden justo los
   abandonos, que son el dato que más importa para la curva de retención.

   Configuración: window.TABLERO (ver el HTML).
   ===================================================================== */

(function () {
  'use strict';

  var CFG = Object.assign({
    ENDPOINT: '',
    VIDEO_ID: 'vsl-tablero',
    SEGUNDO_OFERTA: null,     // segundo del pitch. null = al terminar
    INTERVALO_AVANCE: 5,
    CURVA_BARRA: 0.5,         // 1 = barra honesta · 0.5 = rápida al inicio
                              // (más bajo = más exagerada)
    DEBUG: false
  }, window.TABLERO || {});

  var video = document.getElementById('vsl');
  if (!video) return;

  var capa = document.getElementById('capa-sonido');
  var bloqueOferta = document.getElementById('bloque-oferta');
  var avisoOferta = document.getElementById('aviso-oferta');
  var relleno = document.getElementById('relleno-progreso');
  var btnPausa = document.getElementById('btn-pausa');

  var SESION = (function () {
    try {
      var k = 'joako_vsl_sesion';
      var v = sessionStorage.getItem(k);
      if (!v) {
        v = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem(k, v);
      }
      return v;
    } catch (e) { return 's-sin-almacenamiento'; }
  })();

  var maxVisto = 0;
  var ultimoReporte = 0;
  var conSonido = false;
  var ofertaMostrada = false;
  var precioMostrado = false;
  var yaArranco = false;

  // ── Envío de eventos ───────────────────────────────────────────
  function reportar(tipo, extra) {
    var evento = Object.assign({
      sesion: SESION,
      video: CFG.VIDEO_ID,
      tipo: tipo,
      segundo: Math.round(video.currentTime || 0),
      maxSegundo: Math.round(maxVisto),
      duracion: Math.round(video.duration || 0),
      conSonido: conSonido,
      ruta: location.pathname,
      referido: document.referrer || '',
      ts: new Date().toISOString()
    }, extra || {});

    if (CFG.DEBUG) console.log('[medir]', tipo, evento);

    if (window.gtag) window.gtag('event', 'vsl_' + tipo, { segundo: evento.segundo, video: evento.video });
    if (window.clarity) window.clarity('event', 'vsl_' + tipo);

    if (!CFG.ENDPOINT) return;
    var cuerpo = JSON.stringify(evento);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(CFG.ENDPOINT, new Blob([cuerpo], { type: 'text/plain;charset=utf-8' }));
    } else {
      fetch(CFG.ENDPOINT, { method: 'POST', body: cuerpo, keepalive: true, mode: 'no-cors' }).catch(function () {});
    }
  }

  // ── Arranque en silencio ───────────────────────────────────────
  video.muted = true;
  video.setAttribute('playsinline', '');
  video.controls = false;

  function arrancarSilencioso() {
    var p = video.play();
    if (p && p.catch) {
      p.catch(function () {
        // Si el navegador bloquea incluso el silencio, la capa se vuelve
        // el botón de play y el flujo sigue igual con un solo clic.
        if (capa) capa.setAttribute('data-bloqueado', '1');
      });
    }
  }

  if (video.readyState >= 2) arrancarSilencioso();
  else video.addEventListener('loadeddata', arrancarSilencioso, { once: true });

  // ── Activar sonido: vuelve a empezar ───────────────────────────
  function activarSonido() {
    if (conSonido) return;
    conSonido = true;
    maxVisto = 0;
    ultimoReporte = 0;
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    video.play();
    if (capa) capa.hidden = true;
    document.body.classList.add('con-sonido');
    reportar('activa_sonido');
  }

  if (capa) capa.addEventListener('click', activarSonido);

  // ── Pausar y seguir. Nada más ──────────────────────────────────
  function alternarPausa() {
    if (!conSonido) { activarSonido(); return; }
    if (video.paused) video.play(); else video.pause();
  }

  video.addEventListener('click', alternarPausa);
  if (btnPausa) btnPausa.addEventListener('click', alternarPausa);

  video.addEventListener('play', function () {
    document.body.classList.add('reproduciendo');
    if (btnPausa) btnPausa.textContent = '❚❚';
    if (conSonido) {
      reportar(yaArranco ? 'reanuda' : 'inicio_con_sonido');
      yaArranco = true;
    } else if (!yaArranco) {
      reportar('inicio_silencio');
    }
  });

  video.addEventListener('pause', function () {
    document.body.classList.remove('reproduciendo');
    if (btnPausa) btnPausa.textContent = '▶';
    if (!video.ended && conSonido) reportar('pausa');
  });

  video.addEventListener('ended', function () {
    reportar('fin');
    mostrarOferta('fin_del_video');
    mostrarPrecio('fin_del_video');
  });

  // ── Candado: no se salta ni para adelante ni para atrás ────────
  // Cualquier intento devuelve el video al punto real alcanzado.
  video.addEventListener('seeking', function () {
    var t = video.currentTime;
    if (Math.abs(t - maxVisto) > 0.6) {
      reportar('intento_saltar', { intentoA: Math.round(t) });
      video.currentTime = maxVisto;
    }
  });

  // Teclado: flechas, barra espaciadora y atajos de salto
  document.addEventListener('keydown', function (e) {
    var teclas = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
                  '0','1','2','3','4','5','6','7','8','9','j','l','J','L'];
    if (teclas.indexOf(e.key) !== -1) {
      e.preventDefault();
      reportar('intento_saltar', { via: 'teclado', tecla: e.key });
    }
  });

  // Clic derecho: quita "guardar video como" y el menú nativo
  video.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // ── Avance y barra ─────────────────────────────────────────────
  video.addEventListener('timeupdate', function () {
    var t = video.currentTime;
    if (t > maxVisto) maxVisto = t;

    if (conSonido && maxVisto - ultimoReporte >= CFG.INTERVALO_AVANCE) {
      ultimoReporte = maxVisto;
      reportar('avance');
    }

    if (CFG.SEGUNDO_OFERTA !== null && conSonido && maxVisto >= CFG.SEGUNDO_OFERTA) {
      mostrarOferta('segundo_' + CFG.SEGUNDO_OFERTA);
    }

    // El precio y los botones salen cuando el video dice el precio, no antes.
    if (CFG.SEGUNDO_PRECIO != null && conSonido && maxVisto >= CFG.SEGUNDO_PRECIO) {
      mostrarPrecio('segundo_' + CFG.SEGUNDO_PRECIO);
    }

    pintarBarra();
  });

  // La barra NO es lineal: avanza rápido al principio y lento al final.
  // CURVA_BARRA = 1 la deja honesta (avance real).
  // A propósito no se muestra ningún número de tiempo: un reloj a la vista
  // delataría que la barra no va al ritmo real del video.
  function pintarBarra() {
    if (!video.duration || !relleno) return;
    var real = Math.min(1, video.currentTime / video.duration);
    relleno.style.width = (Math.pow(real, CFG.CURVA_BARRA) * 100) + '%';
  }

  // ── Precio y botones ───────────────────────────────────────────
  // Segundo momento: la persona ya vio que es el Tablero y que hace. Aqui el
  // video dice cuanto vale, y recien ahi aparecen el precio y los dos botones:
  // uno pegado al video, para el que ya decidio, y el de la oferta mas abajo.
  function mostrarPrecio(motivo) {
    if (precioMostrado) return;
    precioMostrado = true;
    document.body.classList.remove('sin-precio');
    reportar('precio_visible', { motivo: motivo });
  }

  // ── Oferta ─────────────────────────────────────────────────────
  function mostrarOferta(motivo) {
    if (ofertaMostrada) return;
    ofertaMostrada = true;
    if (bloqueOferta) {
      bloqueOferta.hidden = false;
      bloqueOferta.classList.add('aparece');
      bloqueOferta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (avisoOferta) avisoOferta.remove();
    // Aqui la pagina deja de ser solo la clase y se abre completa: lo que es
    // el Tablero, como se ve, la garantia y las preguntas.
    document.body.classList.remove('solo-clase');
    reportar('desbloqueo', { motivo: motivo });
  }

  // ── Abandono ───────────────────────────────────────────────────
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !video.paused) reportar('oculta_pestana');
  });

  window.addEventListener('pagehide', function () {
    if (yaArranco) reportar('salida');
  });

  // ── Clic de compra ─────────────────────────────────────────────
  Array.prototype.forEach.call(document.querySelectorAll('[data-compra]'), function (b) {
    b.addEventListener('click', function () {
      reportar('clic_compra', { origen: b.getAttribute('data-compra') });
      if (window.fbq) window.fbq('track', 'InitiateCheckout', { value: 19, currency: 'USD' });
    });
  });

  if (CFG.DEBUG) console.log('[medir] listo · sesión', SESION, '· curva', CFG.CURVA_BARRA);
})();
