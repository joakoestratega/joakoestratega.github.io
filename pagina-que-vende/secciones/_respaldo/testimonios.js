registrarSeccion({
  id: 'testimonios',
  nombre: 'Testimonios',
  descripcion: 'Lo que dicen clientes reales. NUNCA inventes testimonios: escribe en "texto" exactamente "Escribe aquí lo que te dijo un cliente real" y en "nombre" "Nombre del cliente". El dueño los cambia por los reales.',
  ejemplo: {
    etiqueta: 'Lo que dicen',
    titulo: 'Clientes que ya lo probaron',
    items: [
      { texto: 'Escribe aquí lo que te dijo un cliente real', nombre: 'Nombre del cliente', detalle: 'Ciudad' },
      { texto: 'Escribe aquí lo que te dijo un cliente real', nombre: 'Nombre del cliente', detalle: 'Ciudad' },
      { texto: 'Escribe aquí lo que te dijo un cliente real', nombre: 'Nombre del cliente', detalle: 'Ciudad' },
    ],
  },
  fotos: [],
  css: `
.tes-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.tes{display:grid;gap:20px;align-content:space-between;padding:32px;background:var(--superficie);border:1px solid var(--borde);border-radius:var(--radio)}
.tes-est{color:var(--acento);letter-spacing:3px;font-size:16px}
.tes blockquote{font-size:18px;line-height:1.55}
.tes-quien{display:grid;gap:2px;font-size:14px}
.tes-quien strong{font-weight:700}
.tes-quien span{color:var(--suave)}
`,
  html: h => `<section class="sec"><div class="cont">
  <div class="cab centro">${h.txt('etiqueta', 'span', 'etq')}${h.txt('titulo', 'h2', 'tit t2')}</div>
  <div class="tes-grid">${h.lista('items').map((_, i) => `<figure class="tes"><span class="tes-est">★★★★★</span>${h.txt(`items.${i}.texto`, 'blockquote')}<figcaption class="tes-quien">${h.txt(`items.${i}.nombre`, 'strong')}${h.txt(`items.${i}.detalle`)}</figcaption></figure>`).join('')}</div>
</div></section>`,
});
