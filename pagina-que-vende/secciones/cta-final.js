registrarSeccion({
  id: 'cta-final',
  nombre: 'Cierre',
  descripcion: 'Último empujón antes del pie de página. Titular que recuerda el resultado o la consecuencia de no actuar, una frase y el botón. Va al final.',
  ejemplo: { titulo: 'Tu próximo cliente ya está buscando esto', texto: 'Una frase que empuja a decidir hoy.', boton: 'Quiero empezar' },
  fotos: [{ slot: 'fondo', que: 'Foto de ambiente o del resultado, sirve de fondo oscurecido detrás del texto' }],
  css: `
.cier{position:relative;overflow:hidden;background:var(--texto);color:var(--fondo)}
.cier>.hueco{position:absolute;inset:0;border-radius:0}
.cier>.hueco .foto{border-radius:0}
.cier.foto-on::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.8));pointer-events:none;z-index:1}
.cier.foto-on{color:#fff}
.cier .cont{position:relative;z-index:2;display:grid;gap:26px;justify-items:center;text-align:center;padding:clamp(88px,12vw,150px) 0}
.cier .lead{color:inherit;opacity:.8;margin-inline:auto}
`,
  html: h => {
    const conFoto = h.tieneFoto('fondo');
    return `<section class="cier${conFoto ? ' foto-on' : ''}">${conFoto ? h.foto('fondo') : ''}<div class="cont">
  ${h.txt('titulo', 'h2', 'tit t2')}${h.txt('texto', 'p', 'lead')}${h.boton()}
</div></section>`;
  },
});
