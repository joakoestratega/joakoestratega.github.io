registrarSeccion({
  id: 'oferta',
  nombre: 'Oferta y precio',
  descripcion: 'La caja de compra: nombre del producto o servicio, precio (y precio antes si hay descuento), lista de lo que incluye, botón y una nota de garantía o seguridad. Usa SOLO el precio que dio el negocio; si no lo dio, deja "precio" y "precio_antes" vacíos.',
  ejemplo: {
    etiqueta: 'Oferta de lanzamiento',
    titulo: 'Llévalo hoy',
    producto: 'Nombre del producto',
    precio: '$99.000',
    precio_antes: '$129.000',
    incluye: ['Lo que incluye uno', 'Lo que incluye dos', 'Envío gratis'],
    boton: 'Comprar ahora',
    nota: 'Garantía de 30 días. Si no te gusta, te devolvemos tu dinero.',
  },
  fotos: [{ slot: 'producto', que: 'Foto del producto solo, limpia, bien iluminada (o del paquete del servicio)' }],
  css: `
.of-caja{display:grid;grid-template-columns:1fr 1fr;background:var(--fondo);border:1px solid var(--borde);border-radius:calc(var(--radio) + 6px);overflow:hidden;box-shadow:var(--sombra);max-width:1040px;margin-inline:auto}
.of.sin .of-caja{grid-template-columns:1fr;max-width:620px}
.of-img{min-height:100%;border-radius:0}
.of-img .foto{border-radius:0}
.of-info{display:grid;gap:20px;padding:clamp(32px,5vw,56px);align-content:center}
.of-precio{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.of-precio strong{font-family:var(--f-titulo);font-weight:var(--peso-titulo);font-size:clamp(40px,5vw,60px);line-height:1;letter-spacing:var(--letra-titulo)}
.of-precio s{color:var(--suave);font-size:20px}
.of-inc{list-style:none;display:grid;gap:12px;padding:22px 0;border-block:1px solid var(--borde)}
.of-inc li{display:flex;gap:12px;font-weight:500}
.of-inc li::before{content:"✓";color:var(--acento);font-weight:800}
.of-info .btn{width:100%}
.of-nota{font-size:14px;color:var(--suave);text-align:center}
@media (max-width:860px){.of-caja{grid-template-columns:1fr}.of-img{aspect-ratio:4/3}}
`,
  html: h => {
    const conFoto = h.tieneFoto('producto');
    return `<section class="sec alt of${conFoto ? '' : ' sin'}" id="comprar"><div class="cont">
  <div class="cab centro">${h.txt('etiqueta', 'span', 'etq')}${h.txt('titulo', 'h2', 'tit t2')}</div>
  <div class="of-caja">
    ${conFoto ? h.foto('producto', 'of-img') : ''}
    <div class="of-info">
      ${h.txt('producto', 'h3', 'tit t3')}
      <div class="of-precio">${h.txt('precio', 'strong')}${h.txt('precio_antes', 's')}</div>
      <ul class="of-inc">${h.lista('incluye').map((_, i) => h.txt(`incluye.${i}`, 'li')).join('')}</ul>
      ${h.boton()}
      ${h.txt('nota', 'p', 'of-nota')}
    </div>
  </div>
</div></section>`;
  },
});
