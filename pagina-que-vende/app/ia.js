// Motor de IA. Dos formas, las dos gratis y sin servidor nuestro:
//  · 'gemini': automático, con la llave gratis de Google AI Studio del propio usuario
//    (se guarda solo en su navegador).
//  · 'chat': la persona copia las instrucciones en su chat gratis (ChatGPT, Gemini o Claude)
//    y pega la respuesta. No necesita cuenta ni llave nueva.
// Leer páginas: Jina Reader (gratis, sin cuenta). Publicar: Google Sites, con la cuenta de Google de la persona.

const GEMINI = 'https://generativelanguage.googleapis.com/v1beta';
const guardado = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} },
};

// Corrige los errores de escritura que comete el chat en el JSON (probado con respuestas reales de Gemini Flash-Lite).
function repararJSON(s) {
  // Comillas tipográficas y comas sobrantes antes de cerrar.
  s = s.replace(/[“”]/g, '"').replace(/,\s*([}\]])/g, '$1');
  for (let vuelta = 0; vuelta < 60; vuelta++) {
    try { return JSON.parse(s); } catch (e) {
      const m = /position (\d+)/.exec(e.message || '');
      if (!m) throw e;
      const p = +m[1];
      const resto = s.slice(p);
      let arreglo = null;
      // "clave","valor"  →  "clave":"valor"
      if (/Expected ':'/.test(e.message) && s[p] === ',') arreglo = s.slice(0, p) + ':' + s.slice(p + 1);
      // clave sin comillas  →  "clave"
      else if (/^[A-Za-z_][\w-]*\s*:/.test(resto)) arreglo = s.slice(0, p) + resto.replace(/^([A-Za-z_][\w-]*)/, '"$1"');
      // coma que falta entre dos elementos
      else if (/Expected ',' or/.test(e.message) && /^\s*["{\[]/.test(resto)) arreglo = s.slice(0, p) + ',' + resto;
      // coma sobrante antes de cerrar
      else if (/^\s*[}\]]/.test(resto) && /,\s*$/.test(s.slice(0, p))) arreglo = s.slice(0, p).replace(/,\s*$/, '') + resto;
      if (!arreglo) throw e;
      s = arreglo;
    }
  }
  return JSON.parse(s);
}

const IA = {
  PREFERIDOS: ['gemini-flash-lite-latest', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'],
  modelos: null,
  motor: guardado.get('pqv_motor'),     // 'gemini' | 'chat' | null
  llave: guardado.get('pqv_llave'),
  alChat: null,                             // lo pone app.js: (prompt, {buscar, paso}) => texto pegado

  listo() { return IA.motor === 'chat' || (IA.motor === 'gemini' && !!IA.llave); },

  usarChat() { IA.motor = 'chat'; guardado.set('pqv_motor', 'chat'); },

  olvidar() { IA.motor = null; IA.llave = null; IA.modelos = null; guardado.set('pqv_motor', null); guardado.set('pqv_llave', null); },

  // Revisa la llave y deja los modelos gratis que esa llave tiene hoy.
  async usarLlave(llave) {
    llave = (llave || '').trim();
    if (!/^AIza[\w-]{20,}$/.test(llave)) throw new Error('Esa no parece una llave de Google. Debe empezar por "AIza".');
    const r = await fetch(`${GEMINI}/models?pageSize=200&key=${encodeURIComponent(llave)}`);
    if (!r.ok) throw new Error(r.status === 400 || r.status === 403 ? 'Google dice que esa llave no sirve. Cópiala de nuevo completa.' : 'No pudimos revisar la llave. Revisa tu internet.');
    const lista = ((await r.json()).models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
    const buenos = IA.PREFERIDOS.filter(m => lista.includes(m));
    const otros = lista.filter(m => /flash/.test(m) && !/image|tts|audio|live|thinking|exp|preview|embed/.test(m));
    IA.modelos = buenos.length ? buenos : otros.slice(0, 3);
    if (!IA.modelos.length) throw new Error('Tu llave no tiene modelos gratis disponibles.');
    IA.llave = llave; IA.motor = 'gemini';
    guardado.set('pqv_llave', llave); guardado.set('pqv_motor', 'gemini');
    return IA.modelos;
  },

  extraerJSON(txt) {
    const limpio = String(txt).replace(/```json|```/gi, '');
    const ini = Math.min(...['{', '['].map(c => { const i = limpio.indexOf(c); return i < 0 ? Infinity : i; }));
    const fin = Math.max(limpio.lastIndexOf('}'), limpio.lastIndexOf(']'));
    if (ini === Infinity || fin < ini) throw new Error('La respuesta no trae los datos completos.');
    return repararJSON(limpio.slice(ini, fin + 1));
  },

  conTiempo(promesa, ms, msg) {
    let t;
    return Promise.race([promesa, new Promise((_, no) => { t = setTimeout(() => no(new Error(msg)), ms); })])
      .finally(() => clearTimeout(t));
  },

  async gemini(prompt, { buscar = false } = {}) {
    if (!IA.modelos) await IA.usarLlave(IA.llave);
    let ultimo;
    for (const m of IA.modelos) {
      for (const conBusqueda of buscar ? [true, false] : [false]) {
        try {
          const cuerpo = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8 } };
          if (conBusqueda) cuerpo.tools = [{ google_search: {} }];
          const r = await IA.conTiempo(fetch(`${GEMINI}/models/${m}:generateContent?key=${encodeURIComponent(IA.llave)}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo),
          }), 150000, 'tardó mucho');
          const d = await r.json();
          if (!r.ok) {
            const e = new Error(d.error?.message || 'error ' + r.status); e.status = r.status; throw e;
          }
          const t = (d.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
          if (t.trim()) return t;
          ultimo = new Error('respuesta vacía');
        } catch (e) { ultimo = e; console.warn('Gemini falló:', m, conBusqueda ? 'con búsqueda' : '', e); }
      }
    }
    const s = ultimo?.status, msg = (ultimo?.message || '').toLowerCase();
    const err = new Error(
      s === 429 || /quota|exhaust|rate/.test(msg) ? 'Llegaste al límite gratis de Google por ahora. Espera un minuto e intenta de nuevo, o usa "Con tu chat".'
      : s === 400 || s === 403 ? 'Google rechazó tu llave. Revísala o usa "Con tu chat".'
      : 'La inteligencia artificial no respondió. Intenta de nuevo.');
    err.original = ultimo;
    throw err;
  },

  async chat(prompt, cfg = {}) {
    if (IA.motor === 'gemini') return IA.gemini(prompt, cfg);
    if (IA.motor === 'chat' && IA.alChat) return IA.alChat(prompt, cfg);
    throw new Error('Primero elige cómo quieres usar la inteligencia artificial.');
  },

  // Pide JSON. Con Gemini reintenta sola; con el chat, la ventana le pide a la persona pegar de nuevo.
  async json(prompt, cfg = {}) {
    const pedido = prompt + '\n\nResponde SOLO con el JSON, dentro de un bloque de código, sin texto antes ni después.';
    if (IA.motor === 'chat') return IA.alChat(pedido, { ...cfg, json: true });
    const t = await IA.chat(pedido, cfg);
    try { return IA.extraerJSON(t); }
    catch { return IA.extraerJSON(await IA.chat(pedido + '\nTu respuesta anterior no era JSON válido.', cfg)); }
  },

  // Lee una página con Jina Reader (gratis, sin cuenta, sin bloqueos del navegador).
  async leerPagina(url, ms = 30000) {
    const r = await IA.conTiempo(fetch('https://r.jina.ai/' + url, { headers: { 'X-Return-Format': 'html' } }), ms, 'tardó mucho');
    if (!r.ok) throw new Error('no abrió (' + r.status + ')');
    return r.text();
  },
};

window.IA = IA;
