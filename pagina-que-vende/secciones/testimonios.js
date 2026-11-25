// Testimonios: SOLO mensajes reales que la persona pega en "Tu marca". Nunca los escribe la IA.
// Sin mensajes reales, en la página publicada la sección no sale.
function testimoniosReales(texto) {
  return String(texto || '').split(/\n+/).map(l => l.trim()).filter(l => l.length > 3).slice(0, 6).map(l => {
    const m = l.match(/^(.*?)\s+[—–-]\s+([^—–-]{2,60})$/);
    return m ? { texto: m[1].replace(/^["“]|["”]$/g, ''), nombre: m[2] } : { texto: l.replace(/^["“]|["”]$/g, ''), nombre: '' };
  });
}

registrarSeccion({
  id: 'testimonios',
  nombre: 'Lo que dicen los clientes',
  descripcion: 'Prueba social: mensajes reales de clientes. La IA solo escribe el titular y deja items vacío ([]); los mensajes los pega el dueño. Va antes de la oferta.',
  ejemplo: { etiqueta: 'Clientes reales', titulo: 'Lo que dicen quienes ya lo tienen', items: [] },
  fotos: [],
  css: `
.tes .cont{display:grid;gap:36px}
.tes-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
.tes-it{background:var(--superficie);border:1px solid var(--borde);border-radius:var(--radio);padding:26px;display:grid;gap:14px;align-content:start}
.tes-est{color:var(--acento);font-family:Georgia,serif;font-size:54px;line-height:.6;height:22px}
.tes-it p{font-size:17px;line-height:1.55}
.tes-it b{font-size:14px;color:var(--suave)}
.tes-vacio{border-style:dashed;color:var(--suave);text-align:center;place-content:center;min-height:150px}
`,
  html: h => {
    const reales = testimoniosReales(h.negocio.testimonios);
    if (h.modo !== 'vista' && !reales.length) return '';
    const tarjetas = reales.length
      ? reales.map(t => `<div class="tes-it"><span class="tes-est">“</span><p>${h.e(t.texto)}</p>${t.nombre ? `<b>${h.e(t.nombre)}</b>` : ''}</div>`).join('')
      : [1, 2, 3].map(() => `<div class="tes-it tes-vacio"><p>Aquí va un mensaje real de un cliente.<br>Pégalo en "Tu marca".</p></div>`).join('');
    return `<section class="sec alt tes"><div class="cont">
  <div class="cab centro">${h.txt('etiqueta', 'span', 'etq')}${h.txt('titulo', 'h2', 'tit t2')}</div>
  <div class="tes-grid">${tarjetas}</div>
</div></section>`;
  },
});
