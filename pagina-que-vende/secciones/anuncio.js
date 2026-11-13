registrarSeccion({
  id: 'anuncio',
  nombre: 'Barra de anuncio',
  descripcion: 'Franja delgada arriba de todo con la oferta o el beneficio más fuerte (envío, garantía, descuento). Una sola frase corta.',
  ejemplo: { texto: 'Envío gratis a todo el país · Paga al recibir' },
  fotos: [],
  css: `.anun{background:var(--acento);color:var(--sobre-acento);text-align:center;font-size:14px;font-weight:600;padding:11px 16px;letter-spacing:.01em}`,
  html: h => `<div class="anun">${h.txt('texto')}</div>`,
});
