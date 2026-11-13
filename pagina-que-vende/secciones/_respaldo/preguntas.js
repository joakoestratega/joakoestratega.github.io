registrarSeccion({
  id: 'preguntas',
  nombre: 'Preguntas frecuentes',
  descripcion: 'Responde las 4 a 6 dudas que frenan la compra (envío, pago, tiempos, garantía, cómo se usa). Respuestas cortas y claras. No inventes datos que el negocio no dio.',
  ejemplo: {
    etiqueta: 'Preguntas',
    titulo: 'Lo que más nos preguntan',
    items: [{ pregunta: '¿Cuánto tarda en llegar?', respuesta: 'Entre 2 y 4 días hábiles.' }],
  },
  fotos: [],
  css: `
.faq-lista{max-width:820px;margin-inline:auto;display:grid;gap:12px}
.faq{border:1px solid var(--borde);border-radius:var(--radio);background:var(--fondo);overflow:hidden}
.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:22px 26px;font-weight:600;font-size:18px}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--superficie-2);color:var(--acento);font-size:20px;transition:transform .2s}
.faq[open] summary::after{transform:rotate(45deg)}
.faq p{padding:0 26px 24px;color:var(--suave)}
`,
  html: h => `<section class="sec alt"><div class="cont">
  <div class="cab centro">${h.txt('etiqueta', 'span', 'etq')}${h.txt('titulo', 'h2', 'tit t2')}</div>
  <div class="faq-lista">${h.lista('items').map((_, i) => `<details class="faq"${i === 0 ? ' open' : ''}><summary>${h.txt(`items.${i}.pregunta`)}</summary>${h.txt(`items.${i}.respuesta`, 'p')}</details>`).join('')}</div>
</div></section>`,
});
