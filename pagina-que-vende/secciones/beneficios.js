registrarSeccion({
  id: 'beneficios',
  nombre: 'Beneficios',
  descripcion: 'Lo que gana el cliente (resultados, no características). Titular + 4 a 6 beneficios, cada uno con título corto y una frase.',
  ejemplo: {
    etiqueta: 'Por qué elegirnos',
    titulo: 'Lo que cambia cuando lo tienes',
    items: [{ titulo: 'Beneficio claro', texto: 'Una frase que lo explica con un ejemplo concreto.' }],
  },
  fotos: [{ slot: 'lateral', que: 'Foto del producto en uso o del cliente disfrutando el resultado' }],
  css: `
.ben .cont{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(32px,6vw,80px);align-items:center}
.ben.sin .cont{grid-template-columns:1fr}
.ben-img{aspect-ratio:3/4;box-shadow:var(--sombra)}
.ben-grid{display:grid;grid-template-columns:1fr 1fr;gap:34px 30px;margin-top:40px}
.ben.sin .ben-grid{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.ben-it{display:grid;gap:8px;align-content:start}
.ben-n{font-family:var(--f-texto);font-size:14px;font-weight:700;color:var(--acento);letter-spacing:.08em}
.ben-it p{color:var(--suave);font-size:16px}
@media (max-width:860px){.ben .cont{grid-template-columns:1fr}.ben-grid{grid-template-columns:1fr}.ben-img{aspect-ratio:4/3}}
`,
  html: h => {
    const conFoto = h.tieneFoto('lateral');
    return `<section class="sec ben${conFoto ? '' : ' sin'}"><div class="cont">
  ${conFoto ? h.foto('lateral', 'ben-img') : ''}
  <div>
    <div class="cab" style="margin:0">${h.txt('etiqueta', 'span', 'etq')}${h.txt('titulo', 'h2', 'tit t2')}</div>
    <div class="ben-grid">${h.lista('items').map((_, i) => `<div class="ben-it"><span class="ben-n">${String(i + 1).padStart(2, '0')}</span>${h.txt(`items.${i}.titulo`, 'h3', 'tit t3')}${h.txt(`items.${i}.texto`, 'p')}</div>`).join('')}</div>
  </div>
</div></section>`;
  },
});
