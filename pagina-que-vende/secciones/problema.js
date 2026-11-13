registrarSeccion({
  id: 'problema',
  nombre: 'El problema',
  descripcion: 'Nombra el dolor o la frustración del cliente con sus propias palabras. Un titular que duela, un texto corto y 3 o 4 síntomas que el cliente reconoce de inmediato.',
  ejemplo: {
    etiqueta: '¿Te pasa esto?',
    titulo: 'El dolor dicho como lo diría tu cliente',
    texto: 'Un párrafo corto que muestra que entiendes su situación.',
    dolores: ['Síntoma uno', 'Síntoma dos', 'Síntoma tres'],
  },
  fotos: [],
  css: `
.prob .cont{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,6vw,88px);align-items:start}
.prob-lista{display:grid;gap:14px}
.prob-it{display:flex;gap:16px;align-items:flex-start;padding:22px 24px;background:var(--fondo);border:1px solid var(--borde);border-radius:var(--radio);font-weight:500;font-size:18px}
.prob-it::before{content:"✕";flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:rgba(220,60,60,.14);color:#e0483e;font-size:13px;font-weight:800}
@media (max-width:860px){.prob .cont{grid-template-columns:1fr}}
`,
  html: h => `<section class="sec alt prob"><div class="cont">
  <div class="cab" style="margin:0">${h.txt('etiqueta', 'span', 'etq')}${h.txt('titulo', 'h2', 'tit t2')}${h.txt('texto', 'p', 'lead')}</div>
  <div class="prob-lista">${h.lista('dolores').map((_, i) => h.txt(`dolores.${i}`, 'div', 'prob-it')).join('')}</div>
</div></section>`,
});
