registrarSeccion({
  id: 'confianza',
  nombre: 'Franja de confianza',
  descripcion: 'Franja con 3 o 4 razones rápidas para confiar (ej: "Hecho en Colombia", "Envío 48 h", "Garantía 30 días"). NUNCA inventes cifras de clientes o ventas: usa solo números que el negocio haya dado; si no hay, usa frases sin números.',
  ejemplo: { items: [{ titulo: 'Envío en 48 h', texto: 'A todo el país' }, { titulo: 'Garantía', texto: '30 días para probarlo' }, { titulo: 'Pago seguro', texto: 'Tarjeta o contra entrega' }] },
  fotos: [],
  css: `
.conf{border-block:1px solid var(--borde);padding:34px 0}
.conf .cont{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px}
.conf-it{display:grid;gap:4px;padding-left:18px;border-left:3px solid var(--acento)}
.conf-it strong{font-family:var(--f-titulo);font-weight:var(--peso-titulo);text-transform:var(--mayus);font-size:22px;line-height:1.15;letter-spacing:var(--letra-titulo)}
.conf-it span{font-size:15px;color:var(--suave)}
`,
  html: h => `<section class="conf"><div class="cont">${h.lista('items').map((_, i) => `<div class="conf-it">${h.txt(`items.${i}.titulo`, 'strong')}${h.txt(`items.${i}.texto`)}</div>`).join('')}</div></section>`,
});
