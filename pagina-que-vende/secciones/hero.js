registrarSeccion({
  id: 'hero',
  nombre: 'Portada',
  descripcion: 'Lo primero que se ve. Titular con la promesa o el dolor más fuerte, subtítulo que explica qué es y para quién, un botón y 3 frases cortas de confianza. Siempre va primero (o después de la barra de anuncio).',
  ejemplo: {
    etiqueta: 'Nuevo · Hecho a mano',
    titulo: 'El titular que para el scroll',
    subtitulo: 'Una o dos frases que dicen qué es, para quién es y qué resultado da.',
    boton: 'Quiero el mío',
    confianza: ['Envío gratis', 'Garantía de 30 días', 'Pago seguro'],
  },
  fotos: [{ slot: 'principal', que: 'Foto principal: el producto o el resultado del servicio, que se vea deseable' }],
  css: `
.hero{position:relative;padding:clamp(40px,7vw,96px) 0 clamp(64px,9vw,120px);overflow:hidden}
.hero .cont{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(32px,5vw,72px);align-items:center}
.hero.sin .cont{grid-template-columns:1fr;text-align:center;justify-items:center}
.hero.sin .lead{margin-inline:auto}
.hero-txt{display:grid;gap:26px;justify-items:start}
.hero.sin .hero-txt{justify-items:center}
.hero-conf{display:flex;flex-wrap:wrap;gap:10px 22px;font-size:14px;color:var(--suave)}
.hero-conf span{display:inline-flex;align-items:center;gap:8px}
.hero-conf span::before{content:"✓";display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--acento);color:var(--sobre-acento);font-size:11px;font-weight:800}
.hero-img{aspect-ratio:4/5;box-shadow:var(--sombra)}
.hero-img-wrap{position:relative;isolation:isolate}
.hero-img-wrap::before{content:"";position:absolute;inset:8% -6% -6% 8%;border-radius:var(--radio);background:var(--acento);opacity:.18;z-index:-1}
@media (max-width:860px){.hero .cont{grid-template-columns:1fr}.hero-img{aspect-ratio:1/1}.hero-img-wrap{order:-1}.hero-img-wrap::before{inset:6% -3% -3% 6%}}
`,
  html: h => {
    const conFoto = h.tieneFoto('principal');
    return `<header class="hero${conFoto ? '' : ' sin'}"><div class="cont">
  <div class="hero-txt">
    ${h.txt('etiqueta', 'span', 'etq')}
    ${h.txt('titulo', 'h1', 'tit t1')}
    ${h.txt('subtitulo', 'p', 'lead')}
    ${h.boton()}
    <div class="hero-conf">${h.lista('confianza').map((_, i) => h.txt(`confianza.${i}`)).join('')}</div>
  </div>
  ${conFoto ? `<div class="hero-img-wrap">${h.foto('principal', 'hero-img')}</div>` : ''}
</div></header>`;
  },
});
