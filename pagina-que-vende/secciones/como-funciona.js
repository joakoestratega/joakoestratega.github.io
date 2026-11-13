registrarSeccion({
  id: 'como-funciona',
  nombre: 'Cómo funciona',
  descripcion: 'Los 3 o 4 pasos para comprar o recibir el servicio. Hace que se vea fácil. Títulos cortos con verbo.',
  ejemplo: {
    etiqueta: 'Así de fácil',
    titulo: 'Tenerlo te toma 3 pasos',
    pasos: [{ titulo: 'Pide', texto: 'Escríbenos o compra en un clic.' }, { titulo: 'Recibe', texto: 'Llega a tu puerta en 48 horas.' }, { titulo: 'Disfruta', texto: 'Y si no te gusta, te devolvemos tu dinero.' }],
  },
  fotos: [],
  css: `
.pasos{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;counter-reset:p}
.paso{position:relative;display:grid;gap:12px;align-content:start;padding:34px 30px;background:var(--superficie);border:1px solid var(--borde);border-radius:var(--radio)}
.paso::before{counter-increment:p;content:counter(p);display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--acento);color:var(--sobre-acento);font:700 19px/1 var(--f-texto);margin-bottom:8px}
.paso p{color:var(--suave);font-size:16px}
`,
  html: h => `<section class="sec"><div class="cont">
  <div class="cab centro">${h.txt('etiqueta', 'span', 'etq')}${h.txt('titulo', 'h2', 'tit t2')}</div>
  <div class="pasos">${h.lista('pasos').map((_, i) => `<div class="paso">${h.txt(`pasos.${i}.titulo`, 'h3', 'tit t3')}${h.txt(`pasos.${i}.texto`, 'p')}</div>`).join('')}</div>
</div></section>`,
});
