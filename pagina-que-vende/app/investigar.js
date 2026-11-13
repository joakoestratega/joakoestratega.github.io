// Investigación: busca las páginas que más venden en el nicho, las lee una por una
// y saca lo que usan. Los conteos salen de las páginas reales, no de la IA.

const GATILLOS = {
  'Garantía': /garant[ií]a|guarantee|money.?back|devoluci[oó]n|reembolso|refund/i,
  'Envío gratis': /env[ií]o gratis|free shipping|env[ií]o sin costo/i,
  'Testimonios': /testimoni|reseñas|rese[ñn]a|opiniones|reviews?|★|⭐|clientes felices|happy customers/i,
  'Urgencia': /solo hoy|últimas unidades|ultimas unidades|limited|oferta termina|ends (soon|today)|quedan|countdown|stock limitado/i,
  'Descuento': /\d{1,2}\s?% ?(off|dto|de descuento)|descuento|sale|ahorra|save \d/i,
  'Preguntas frecuentes': /preguntas frecuentes|faq|frequently asked/i,
  'Cifras de clientes': /\+?\d[\d.,]*\s?(k|mil|\+)?\s?(clientes|customers|personas|usuarios|pacientes|alumnos|students)/i,
  'Medios / prensa': /as seen (in|on)|visto en|aparecimos en|featured in|press/i,
  'Pago seguro': /pago seguro|secure (checkout|payment)|ssl|compra segura/i,
  'Pago contra entrega': /contra ?entrega|cash on delivery|paga al recibir/i,
  'WhatsApp': /wa\.me|whatsapp/i,
  'Video': /<video|youtube\.com\/embed|player\.vimeo|wistia|vturb|vimeo\.com/i,
};

const PRECIO_RE = /(?:US\$|USD|COP|MXN|€|£|\$)\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s?(?:USD|EUR|€|COP|MXN)/g;

function absoluta(src, base) {
  try { return new URL(src, base).href; } catch { return null; }
}

function analizarHTML(html, url) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const txt = (doc.body?.innerText || doc.body?.textContent || '').replace(/\s+/g, ' ');
  const meta = n => doc.querySelector(`meta[property="${n}"],meta[name="${n}"]`)?.content || '';
  const titulos = [...doc.querySelectorAll('h1,h2,h3')].map(h => h.textContent.trim().replace(/\s+/g, ' '))
    .filter(t => t.length > 2 && t.length < 140).slice(0, 25);
  const ctas = [...new Set([...doc.querySelectorAll('a,button')].map(b => b.textContent.trim().replace(/\s+/g, ' '))
    .filter(t => t.length > 2 && t.length < 40 && /compr|buy|shop|agend|reserv|empez|start|quiero|obt[eé]n|get|pide|ordena|order|suscr|prueba|try|cotiz|contact|agrega|add to/i.test(t)))].slice(0, 6);
  const imgs = [...doc.querySelectorAll('img')]
    .map(i => i.getAttribute('src') || i.getAttribute('data-src') || '')
    .filter(s => s && !/svg|icon|logo|sprite|pixel|1x1|data:/i.test(s))
    .map(s => absoluta(s, url)).filter(Boolean);
  const ogImg = absoluta(meta('og:image'), url);
  // Lo que ve el cliente se busca en el texto visible; video y WhatsApp, en el código.
  const enCodigo = new Set(['Video', 'WhatsApp']);
  const gatillos = Object.entries(GATILLOS).filter(([k, re]) => re.test(enCodigo.has(k) ? html : txt)).map(([k]) => k);
  const precios = [...new Set(txt.match(PRECIO_RE) || [])].slice(0, 5);
  return {
    url,
    dominio: new URL(url).hostname.replace(/^www\./, ''),
    titulo: (doc.title || '').trim().slice(0, 120),
    descripcion: (meta('og:description') || meta('description')).slice(0, 200),
    titulos, ctas, precios, gatillos,
    imagen: ogImg || imgs[0] || null,
    imagenes: [...new Set([ogImg, ...imgs].filter(Boolean))].slice(0, 6),
    numImagenes: imgs.length,
    tieneVideo: gatillos.includes('Video'),
    captura: `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=900`,
  };
}

async function enParalelo(items, max, fn) {
  const res = []; let i = 0;
  const trabajadores = Array.from({ length: max }, async () => {
    while (i < items.length) { const k = i++; res[k] = await fn(items[k], k); }
  });
  await Promise.all(trabajadores);
  return res;
}

async function investigar(negocio, avisar = () => {}) {
  avisar({ fase: 'buscar', msg: 'Buscando en todo el mundo las páginas que más venden en tu negocio…' });

  const encontradas = await IA.json(`Busca en internet, en cualquier país e idioma, las 12 mejores páginas de venta (landing pages o páginas de producto/servicio) de este negocio:
"${negocio}"

Prioriza marcas que venden mucho, con páginas cuidadas, de varios países (Estados Unidos, España, Latinoamérica, Europa). Evita Amazon, MercadoLibre, Wikipedia, blogs, directorios y redes sociales.
Usa la página principal o la página de venta de cada marca (que abra sin iniciar sesión).
Solo marcas que venden este mismo producto o servicio.
De cada página escribe su titular principal, 3 a 6 títulos de sus secciones, el texto de sus botones, sus precios y cuáles de estas cosas usa: Garantía, Envío gratis, Testimonios, Urgencia, Descuento, Preguntas frecuentes, Pago seguro, Pago contra entrega, WhatsApp, Video.
JSON: {"paginas":[{"url":"https://...","marca":"...","pais":"...","titular":"...","titulos":["..."],"botones":["..."],"precios":["..."],"usa":["Garantía","..."]}]}`, { buscar: true, paso: 1 });

  const lista = (encontradas.paginas || encontradas || [])
    .filter(p => p && /^https?:\/\//.test(p.url))
    .filter((p, i, a) => a.findIndex(q => new URL(q.url).hostname === new URL(p.url).hostname) === i)
    .slice(0, 12);
  if (!lista.length) throw new Error('No encontramos páginas para ese negocio. Prueba describiéndolo con otras palabras.');

  avisar({ fase: 'lista', paginas: lista });

  // Respaldo: lo que el chat vio en la página, por si no se deja leer.
  const lista_str = v => (Array.isArray(v) ? v : []).map(x => String(x).trim()).filter(Boolean);
  const desdeChat = p => {
    const titulos = lista_str(p.titulos); if (p.titular) titulos.unshift(String(p.titular));
    if (!titulos.length) return null;
    const dominio = new URL(p.url).hostname.replace(/^www\./, '');
    const gatillos = lista_str(p.usa).filter(g => g in GATILLOS);
    return { url: p.url, dominio, titulo: String(p.titular || p.marca || dominio).slice(0, 120), descripcion: '',
      titulos: titulos.slice(0, 12), ctas: lista_str(p.botones).slice(0, 6), precios: lista_str(p.precios).slice(0, 5), gatillos,
      imagen: null, imagenes: [], numImagenes: 0, tieneVideo: gatillos.includes('Video'), fuente: 'chat',
      captura: `https://api.microlink.io/?url=${encodeURIComponent(p.url)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=900`,
      marca: p.marca || dominio, pais: p.pais || '' };
  };
  let lecturaCaida = false;

  const analizadas = (await enParalelo(lista, 4, async (p, k) => {
    avisar({ fase: 'leyendo', k, url: p.url });
    try {
      if (lecturaCaida) throw new Error('lectura sin cupo');
      const html = await IA.leerPagina(p.url);
      const a = analizarHTML(html, p.url);
      if (!a.titulos.length) throw new Error('página bloqueada o vacía');
      if (/for sale|buy this domain|domain is for sale|este dominio est[aá] a la venta|parked/i.test(a.titulo + ' ' + a.titulos.join(' '))) throw new Error('dominio en venta');
      const r = { ...a, marca: p.marca || a.dominio, pais: p.pais || '' };
      avisar({ fase: 'leida', k, pagina: r });
      return r;
    } catch (e) {
      if (/\(429\)/.test(e.message || '')) lecturaCaida = true;
      const r = /dominio en venta/.test(e.message || '') ? null : desdeChat(p);
      if (r) { avisar({ fase: 'leida', k, pagina: r }); return r; }
      avisar({ fase: 'fallo', k, url: p.url });
      return null;
    }
  })).filter(p => p && p.titulos.length);

  if (analizadas.length < 2) throw new Error('Pudimos leer muy pocas páginas (algunas marcas bloquean las visitas automáticas). Intenta de nuevo o describe tu negocio con otras palabras.');

  // Conteo real de gatillos.
  const conteo = {};
  analizadas.forEach(p => p.gatillos.forEach(g => conteo[g] = (conteo[g] || 0) + 1));
  const gatillos = Object.entries(conteo).sort((a, b) => b[1] - a[1])
    .map(([nombre, veces]) => ({ nombre, veces, de: analizadas.length }));

  // La comparación y los 3 estilos salen juntos en generar.js (una sola pregunta a la IA).
  const resumen = analizadas.map(p => ({
    marca: p.marca, pais: p.pais, titulo: p.titulo, titulos: p.titulos.slice(0, 12),
    ctas: p.ctas, precios: p.precios, gatillos: p.gatillos, video: p.tieneVideo,
  }));
  return { negocio, fecha: new Date().toISOString(), paginas: analizadas, gatillos, resumenPaginas: resumen };
}

window.investigar = investigar;
