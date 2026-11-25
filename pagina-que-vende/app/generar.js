// La IA arma los 3 estilos a partir del informe, y después personaliza el elegido con la marca.

function catalogoSecciones() {
  return Object.values(SECCIONES).map(s => ({
    tipo: s.id, nombre: s.nombre, para_que: s.descripcion, datos: s.ejemplo,
    fotos: (s.fotos || []).map(f => f.slot),
  }));
}

const REGLAS_TEXTO = `REGLAS DE TEXTO:
- Escribe en el idioma en que está descrito el negocio, con palabras sencillas que entiende cualquiera.
- Habla de resultados y de lo que siente el cliente, no de características técnicas.
- Titulares cortos que golpean. Nada de frases de relleno ni de "bienvenido a".
- PROHIBIDO inventar cifras de clientes, ventas, años, premios, testimonios ni reseñas. Si el negocio no dio un dato, escribe sin números.
- Usa solo el precio que dio el negocio. Si no lo dio, deja el precio vacío ("").`;

// Una sola pregunta: compara las páginas reales, saca el informe y arma los 3 estilos.
async function generarEstilos(informe) {
  const r = await IA.json(`Eres el mejor diseñador de páginas de venta del mundo. Tienes una biblioteca de secciones ya diseñadas y los datos reales de ${informe.paginas.length} páginas que venden en este negocio.

NEGOCIO: "${informe.negocio}"

PÁGINAS REALES (titulares, botones, precios y gatillos de cada una):
${JSON.stringify(informe.resumenPaginas)}

GATILLOS CONTADOS (cuántas páginas los usan): ${informe.gatillos.map(g => `${g.nombre} ${g.veces}/${g.de}`).join(', ')}

BIBLIOTECA DE SECCIONES (solo puedes usar estas, con estos campos):
${JSON.stringify(catalogoSecciones())}

PRIMERO analiza qué tienen en común las que más venden (informe).
DESPUÉS crea 3 propuestas de página MUY distintas entre sí:
1. tema "impacto": la que copia lo que más vende en el informe (directa, fuerte, oferta clara).
2. tema "editorial": premium y aspiracional (vende por deseo y confianza).
3. tema "limpio": la que aprovecha "lo que casi nadie hace" para diferenciarse.
Cada propuesta: entre 6 y 9 secciones, empieza con "hero" (o "anuncio" y luego "hero"), incluye "oferta" y termina con "cta-final" y "pie". Escribe los textos completos para este negocio. Elige un color de acento hexadecimal que encaje con el negocio y el tema.

${REGLAS_TEXTO}

JSON:
{"informe":{"resumen":"3 frases: qué hacen las que más venden","estructura":["orden de secciones que más se repite"],"promesas":["5 ganchos de titular que usan"],"estilo_imagen":"qué fotos y videos usan","precios":"rango de precios y cómo los presentan","oportunidad":"qué NO hace casi nadie","buscar_fotos":"2 o 3 palabras genéricas en inglés del tipo de producto o servicio, sin nombres de marca ni datos de la persona"},
 "estilos":[{"tema":"impacto","nombre":"nombre corto","por_que":"una frase basada en el informe","acento":"#hex","secciones":[{"tipo":"hero","datos":{}}]}]}`, { paso: 2 });
  for (const [k, v] of Object.entries(r.informe || {})) if (!["__proto__", "constructor", "prototype"].includes(k)) informe[k] = v;
  return (r.estilos || []).filter(e => e && TEMAS[e.tema]).map(normalizarEstilo).slice(0, 3);
}

const ALIAS_SECCIONES = {
  testimonios: 'confianza', testimonio: 'confianza', resenas: 'confianza', 'reseñas': 'confianza', prueba: 'confianza', garantia: 'confianza',
  beneficio: 'beneficios', ventajas: 'beneficios', caracteristicas: 'beneficios',
  pasos: 'como-funciona', proceso: 'como-funciona', como_funciona: 'como-funciona', 'como funciona': 'como-funciona',
  precio: 'oferta', precios: 'oferta', planes: 'oferta', cta: 'cta-final', cierre: 'cta-final', cta_final: 'cta-final',
  footer: 'pie', portada: 'hero', encabezado: 'hero', dolor: 'problema', urgencia: 'anuncio', barra: 'anuncio',
};
function normalizarEstilo(e) {
  const tipoValido = t => {
    const k = String(t || '').trim().toLowerCase();
    return SECCIONES[k] ? k : (SECCIONES[ALIAS_SECCIONES[k]] ? ALIAS_SECCIONES[k] : null);
  };
  let secs = (Array.isArray(e.secciones) ? e.secciones : [])
    .map(s => (typeof s === 'string' ? { tipo: s, datos: {} } : s))
    .map(s => s && tipoValido(s.tipo) ? { tipo: tipoValido(s.tipo), datos: (s.datos && typeof s.datos === 'object') ? s.datos : {} } : null)
    .filter(Boolean);
  const vistos = new Set(); secs = secs.filter(s => !vistos.has(s.tipo) && vistos.add(s.tipo));
  const ejemplo = t => ({ tipo: t, datos: JSON.parse(JSON.stringify(SECCIONES[t]?.ejemplo || {})) });
  // Una sección sin textos se llena con el ejemplo de la biblioteca; en "Tu marca" se reescribe con los datos reales.
  secs = secs.map(s => (Object.keys(s.datos).length ? s : ejemplo(s.tipo)));
  const tiene = t => secs.some(s => s.tipo === t);
  if (!tiene('hero') && SECCIONES.hero) secs.unshift(ejemplo('hero'));
  ['beneficios', 'oferta', 'cta-final', 'pie'].forEach(t => { if (!tiene(t) && SECCIONES[t]) secs.push(ejemplo(t)); });
  const orden = t => (t === 'anuncio' ? -2 : t === 'hero' ? -1 : t === 'cta-final' ? 98 : t === 'pie' ? 99 : 0);
  secs = secs.map((s, i) => ({ s, i })).sort((a, b) => (orden(a.s.tipo) - orden(b.s.tipo)) || (a.i - b.i)).map(x => x.s);
  return { ...e, secciones: secs };
}

function fotosDelEstilo(estilo) {
  const slots = [];
  estilo.secciones.forEach(s => (SECCIONES[s.tipo]?.fotos || []).forEach(f => slots.push({ clave: `${s.tipo}.${f.slot}`, seccion: SECCIONES[s.tipo].nombre, que: f.que })));
  return slots;
}

// Pone fotos reales de la investigación en los huecos, como referencia.
// Fotos de referencia que de verdad cargan: las de las páginas reales y, si no alcanzan, fotos libres de Wikimedia Commons.
function cargaBien(src, ms = 6000) {
  return new Promise(ok => {
    const img = new Image(); img.referrerPolicy = 'no-referrer';
    const t = setTimeout(() => ok(false), ms);
    // Solo fotos grandes y de proporción normal: los avisos, sellos y franjas son muy anchos o muy chicos.
    img.onload = () => { clearTimeout(t); const w = img.naturalWidth, h = img.naturalHeight, r = w / Math.max(h, 1); ok(w >= 500 && h >= 350 && r >= 0.6 && r <= 2); };
    img.onerror = () => { clearTimeout(t); ok(false); };
    img.src = src;
  });
}
async function fotosLibres(termino, n = 12) {
  try {
    const q = encodeURIComponent('filetype:bitmap ' + String(termino).slice(0, 80));
    const r = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=${n}&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json&origin=*`);
    const d = await r.json();
    return Object.values(d?.query?.pages || {}).map(p => p.imageinfo?.[0]?.thumburl).filter(u => /^https:\/\/(upload|thumb)\.wikimedia\.org\//.test(u || ''))
      .map(src => ({ src, marca: 'Foto libre de referencia' }));
  } catch { return []; }
}
// Imágenes que no son del producto: medios de pago, sellos, logos, banderas, íconos.
const FOTO_BASURA = /afterpay|clearpay|bnpl|installment|cuotas|addi|trustpilot|judge.me|yotpo|stamped|okendo|loox|fbcdn|facebook|doubleclick|gstatic|cookie|promo|klarna|sezzle|affirm|paypal|visa|mastercard|amex|apple-?pay|google-?pay|gpay|shop-?pay|payment|pago|badge|sello|trust|seal|logo|icon|flag|bandera|banner|stars?|rating|review|avatar|sprite|placeholder|\.svg|\.gif/i;
async function prepararFotos(informe) {
  if (Array.isArray(informe.fotosOk) && informe.fotosOk.length >= 6) return informe.fotosOk;
  const candidatas = informe.paginas.flatMap(p => (p.imagenes || []).map(src => ({ src, marca: p.marca })))
    .filter(x => x.src && !FOTO_BASURA.test(x.src)).slice(0, 40);
  const pruebas = await Promise.all(candidatas.map(x => cargaBien(x.src)));
  let ok = candidatas.filter((x, i) => pruebas[i]);
  if (ok.length < 6) {
    for (const termino of [informe.buscar_fotos].filter(Boolean)) {
      const libres = await fotosLibres(termino);
      const bien = await Promise.all(libres.map(x => cargaBien(x.src)));
      ok = ok.concat(libres.filter((x, i) => bien[i]));
      if (ok.length >= 6) break;
    }
  }
  informe.fotosOk = ok;
  return ok;
}

function referenciasIniciales(estilo, informe, n = 0) {
  const imgs = (informe.fotosOk && informe.fotosOk.length ? informe.fotosOk : informe.paginas.flatMap(p => p.imagenes.map(src => ({ src, marca: p.marca })))).filter(x => x.src);
  const fotos = {};
  fotosDelEstilo(estilo).forEach((f, i) => {
    const x = imgs[(i * 3 + n * 5) % Math.max(imgs.length, 1)];
    if (x) fotos[f.clave] = { src: x.src, tipo: 'referencia', marca: x.marca };
  });
  return fotos;
}

async function personalizar(estilo, negocio, informe) {
  const huecos = fotosDelEstilo(estilo);
  const refs = (informe.fotosOk && informe.fotosOk.length ? informe.fotosOk : informe.paginas.flatMap(p => p.imagenes.slice(0, 2).map(src => ({ src, marca: p.marca })))).slice(0, 30);
  const r = await IA.json(`Personaliza esta página de venta para una marca real.

MARCA:
${JSON.stringify(negocio)}

PÁGINA ELEGIDA (tema ${estilo.tema}):
${JSON.stringify(estilo.secciones)}

1. Reescribe TODOS los textos para esta marca: usa su nombre, su producto, su precio y su forma de comprar. Mantén los mismos tipos de sección y los mismos campos. En "pie", pon el nombre de la marca y su contacto (WhatsApp si lo dio).
2. NO INVENTES NADA. Usa solo el precio, la garantía, los envíos y las formas de pago que aparecen en MARCA. Si MARCA no dice envío gratis, pago contra entrega, pago al recibir, descuentos, cifras de clientes, testimonios, años de experiencia ni correos, quita esas frases aunque estén en la página elegida. No pongas un precio distinto ni un "precio antes" que la marca no dio.
3. Para cada foto de esta lista, dile al dueño cómo tomarla con su celular y escribe un prompt en inglés para crearla con IA (Gemini), alta calidad, estilo fotografía profesional de producto/publicidad, sin texto en la imagen, sin rostros de personas famosas. Elige de las referencias la imagen que más se parezca a lo que debe ir (índice).

FOTOS QUE NECESITA:
${JSON.stringify(huecos.map(h => ({ clave: h.clave, para: h.que })))}

REFERENCIAS DISPONIBLES (índice: marca):
${refs.map((x, i) => `${i}: ${x.marca}`).join('\n')}

${REGLAS_TEXTO}

Responde SOLO JSON:
{"secciones":[{"tipo":"...","datos":{...}}],"fotos":[{"clave":"hero.principal","celular":"instrucción sencilla de 1 o 2 frases: qué fotografiar, dónde, con qué luz y desde qué ángulo","prompt":"English prompt...","referencia":0}]}`, { paso: 3 });

  const secciones = Array.isArray(r.secciones) && r.secciones.length ? r.secciones : estilo.secciones;
  secciones.filter(s => s.tipo === 'oferta' && s.datos).forEach(s => {
    s.datos.precio = (negocio.precio || '').trim();
    s.datos.precio_antes = (negocio.precio_antes || '').trim();
  });
  const guia = huecos.map(h => {
    const f = (r.fotos || []).find(x => x.clave === h.clave) || {};
    const ref = refs[f.referencia] || refs[0];
    return { ...h, celular: f.celular || h.que, prompt: f.prompt ? f.prompt.replace(/\s*$/, '') + (/no text/i.test(f.prompt) ? '' : '. No text, no letters, no logos, no watermark.') : '', referencia: ref?.src || null, refMarca: ref?.marca || '' };
  });
  return { estilo: { ...estilo, secciones }, guia };
}

Object.assign(window, { generarEstilos, referenciasIniciales, personalizar, fotosDelEstilo });
