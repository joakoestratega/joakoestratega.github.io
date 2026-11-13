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
{"informe":{"resumen":"3 frases: qué hacen las que más venden","estructura":["orden de secciones que más se repite"],"promesas":["5 ganchos de titular que usan"],"estilo_imagen":"qué fotos y videos usan","precios":"rango de precios y cómo los presentan","oportunidad":"qué NO hace casi nadie"},
 "estilos":[{"tema":"impacto","nombre":"nombre corto","por_que":"una frase basada en el informe","acento":"#hex","secciones":[{"tipo":"hero","datos":{}}]}]}`, { paso: 2 });
  for (const [k, v] of Object.entries(r.informe || {})) if (!["__proto__", "constructor", "prototype"].includes(k)) informe[k] = v;
  return (r.estilos || []).filter(e => TEMAS[e.tema] && Array.isArray(e.secciones)).slice(0, 3);
}

function fotosDelEstilo(estilo) {
  const slots = [];
  estilo.secciones.forEach(s => (SECCIONES[s.tipo]?.fotos || []).forEach(f => slots.push({ clave: `${s.tipo}.${f.slot}`, seccion: SECCIONES[s.tipo].nombre, que: f.que })));
  return slots;
}

// Pone fotos reales de la investigación en los huecos, como referencia.
function referenciasIniciales(estilo, informe, n = 0) {
  const imgs = informe.paginas.flatMap(p => p.imagenes.map(src => ({ src, marca: p.marca }))).filter(x => x.src);
  const fotos = {};
  fotosDelEstilo(estilo).forEach((f, i) => {
    const x = imgs[(i * 3 + n * 5) % Math.max(imgs.length, 1)];
    if (x) fotos[f.clave] = { src: x.src, tipo: 'referencia', marca: x.marca };
  });
  return fotos;
}

async function personalizar(estilo, negocio, informe) {
  const huecos = fotosDelEstilo(estilo);
  const refs = informe.paginas.flatMap(p => p.imagenes.slice(0, 2).map(src => ({ src, marca: p.marca }))).slice(0, 30);
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
