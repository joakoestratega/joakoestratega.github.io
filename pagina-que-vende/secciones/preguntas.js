registrarSeccion({
  id: 'preguntas',
  nombre: 'Preguntas frecuentes',
  descripcion: 'Resuelve las dudas que frenan la compra (envío, pago, garantía, tiempos, cómo se usa). 4 a 6 preguntas con respuesta corta. Responde SOLO con datos que dio el negocio; si no hay dato para una pregunta, no la pongas. Va después de la oferta.',
  ejemplo: {
    titulo: 'Preguntas frecuentes',
    items: [
      { pregunta: '¿Cómo hago mi pedido?', respuesta: 'Tocas el botón, nos escribes y te confirmamos en minutos.' },
      { pregunta: '¿Cómo puedo pagar?', respuesta: 'Te contamos las formas de pago cuando nos escribas.' },
      { pregunta: '¿Cuánto tarda en llegar?', respuesta: 'Te damos la fecha exacta al confirmar tu pedido.' },
    ],
  },
  fotos: [],
  css: `
.faq .cont{display:grid;gap:30px;max-width:820px}
.faq details{border-bottom:1px solid var(--borde);padding:18px 0}
.faq summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px;font-weight:700;font-size:18px}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";color:var(--acento);font-size:24px;line-height:1}
.faq details[open] summary::after{content:"−"}
.faq details p{color:var(--suave);margin-top:10px}
`,
  html: h => {
    const items = h.lista('items');
    if (!items.length) return '';
    return `<section class="sec faq"><div class="cont">
  <div class="cab centro">${h.txt('titulo', 'h2', 'tit t2')}</div>
  <div>${items.map((_, i) => `<details${i === 0 ? ' open' : ''}><summary>${h.txt(`items.${i}.pregunta`, 'span')}</summary>${h.txt(`items.${i}.respuesta`, 'p')}</details>`).join('')}</div>
  <div style="text-align:center">${h.boton()}</div>
</div></section>`;
  },
});
