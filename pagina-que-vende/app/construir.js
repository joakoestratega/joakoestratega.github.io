// Arma la página final a partir de los datos (estilo + negocio + fotos).
// Funciona igual en el navegador y en Node (para pruebas).

const _G = typeof window !== 'undefined' ? window : globalThis;
_G.SECCIONES = _G.SECCIONES || {};
_G.registrarSeccion = def => { _G.SECCIONES[def.id] = def; };

const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{background:var(--fondo);color:var(--texto);font-family:var(--f-texto);font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{display:block;max-width:100%}
a{color:inherit}
.cont{width:min(1160px,100% - 48px);margin-inline:auto}
.sec{padding:clamp(72px,10vw,128px) 0}
.sec.alt{background:var(--superficie)}
.tit{font-family:var(--f-titulo);font-weight:var(--peso-titulo);text-transform:var(--mayus);letter-spacing:var(--letra-titulo);line-height:var(--alto-titulo);text-wrap:balance}
.t1{font-size:clamp(42px,6.4vw,84px)}
.t2{font-size:clamp(32px,4.4vw,56px)}
.t3{font-size:clamp(20px,2vw,24px);line-height:1.2}
.lead{font-size:clamp(18px,1.6vw,21px);color:var(--suave);max-width:60ch;text-wrap:pretty}
.etq{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--acento)}
.etq::before{content:"";width:22px;height:2px;background:currentColor}
.cab{max-width:760px;margin-bottom:clamp(40px,6vw,64px);display:grid;gap:18px}
.cab.centro{margin-inline:auto;text-align:center;justify-items:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--acento);color:var(--sobre-acento);font-weight:700;font-size:17px;padding:19px 34px;border-radius:var(--radio-btn);text-decoration:none;transition:transform .2s,box-shadow .2s;box-shadow:0 10px 30px -10px var(--acento)}
.btn:hover{transform:translateY(-2px);box-shadow:0 18px 40px -12px var(--acento)}
.btn::after{content:"→";font-weight:400}
.nota{font-size:14px;color:var(--suave)}
.foto{width:100%;height:100%;object-fit:cover;border-radius:var(--radio);background:var(--superficie-2)}
.hueco{position:relative;border-radius:var(--radio);background:var(--superficie-2);overflow:hidden}
.hueco .foto{position:absolute;inset:0}
.ref{position:absolute;top:12px;left:12px;z-index:2;background:rgba(0,0,0,.72);color:#fff;font:600 11px/1 var(--f-texto);letter-spacing:.08em;text-transform:uppercase;padding:7px 10px;border-radius:99px}
.vacio{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px;color:var(--suave);font-size:14px;border:2px dashed var(--borde);border-radius:var(--radio)}
@media (max-width:820px){body{font-size:16px}.btn{width:100%}}
`;

const EDITOR_JS = `
document.addEventListener('input',e=>{const el=e.target.closest('[data-ruta]');if(el)parent.postMessage({tipo:'texto',ruta:el.dataset.ruta,valor:el.innerText},'*')});
document.addEventListener('click',e=>{const a=e.target.closest('a');if(a)e.preventDefault();const f=e.target.closest('[data-slot]');if(f&&!e.target.closest('[data-ruta]'))parent.postMessage({tipo:'foto',slot:f.dataset.slot},'*')});
addEventListener('scroll',()=>parent.postMessage({tipo:'scroll',y:scrollY},'*'),{passive:true});
addEventListener('message',e=>{if(e.source===parent&&e.data&&e.data.tipo==='ir')scrollTo(0,+e.data.y||0)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('[data-ruta]')&&!e.shiftKey){e.preventDefault();e.target.blur()}});
`;

const EDITOR_CSS = `
[data-ruta]{outline:none;border-radius:4px;transition:box-shadow .15s;cursor:text}
[data-ruta]:hover{box-shadow:0 0 0 2px rgba(80,140,255,.55)}
[data-ruta]:focus{box-shadow:0 0 0 2px #508cff;background:rgba(80,140,255,.06)}
[data-slot]{cursor:pointer}
[data-slot]:hover::after{content:"Cambiar foto";position:absolute;inset:auto 12px 12px auto;z-index:3;background:#508cff;color:#fff;font:600 12px/1 system-ui;padding:8px 12px;border-radius:99px}
`;

// Pone ".vtr " delante de cada selector (también dentro de @media).
function aislarCSS(css, pre) {
  let out = '', i = 0;
  while (i < css.length) {
    const abre = css.indexOf('{', i);
    if (abre < 0) break;
    const sel = css.slice(i, abre).trim();
    if (sel.startsWith('@media') || sel.startsWith('@supports')) {
      let nivel = 1, j = abre + 1;
      while (j < css.length && nivel) { if (css[j] === '{') nivel++; else if (css[j] === '}') nivel--; j++; }
      out += `${sel}{${aislarCSS(css.slice(abre + 1, j - 1), pre)}}`;
      i = j; continue;
    }
    const cierra = css.indexOf('}', abre);
    const cuerpo = css.slice(abre + 1, cierra);
    if (sel.startsWith('@')) out += `${sel}{${cuerpo}}`;
    else out += sel.split(',').map(s => {
      s = s.trim();
      if (s === ':root' || s === pre) return pre;
      return s.startsWith(pre) ? s : `${pre} ${s}`;
    }).join(',') + `{${cuerpo}}`;
    i = cierra + 1;
  }
  return out;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function leer(obj, ruta) {
  return ruta.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function linkAccion(n) {
  if (n.link_compra) return n.link_compra;
  const num = String(n.whatsapp || '').replace(/\D/g, '');
  if (num) return `https://wa.me/${num}?text=${encodeURIComponent(`Hola, quiero ${n.nombre ? 'info de ' + n.nombre : 'más información'}`)}`;
  return '#comprar';
}

// opciones.modo: 'vista' (con huecos, referencias y edición) | 'final' (solo lo del cliente)
//                | 'fragmento' (como 'final', pero para pegar dentro de Shopify o WordPress)
function construirPagina(estilo, negocio = {}, fotos = {}, opciones = {}) {
  const modo = opciones.modo || 'vista';
  const tema = _G.TEMAS[estilo.tema] || _G.TEMAS.limpio;
  const vars = { ...tema.vars };
  const acento = negocio.color || estilo.acento;
  if (acento && /^#[0-9a-f]{6}$/i.test(acento)) {
    vars['--acento'] = acento;
    vars['--sobre-acento'] = _G.contraste(acento) || vars['--sobre-acento'];
  }
  const link = linkAccion(negocio);
  const cssUsado = new Set();
  const cuerpo = (estilo.secciones || []).map((s, i) => {
    const def = _G.SECCIONES[s.tipo];
    if (!def) return '';
    cssUsado.add(def.id);
    const d = s.datos || {};
    const base = `secciones.${i}.datos`;
    const h = {
      modo, negocio, link, datos: d,
      e: esc,
      txt(campo, tag = 'span', clase = '') {
        const v = leer(d, campo);
        if (v == null || v === '') return '';
        const edit = modo === 'vista' ? ` contenteditable="plaintext-only" spellcheck="false" data-ruta="${base}.${campo}"` : '';
        return `<${tag}${clase ? ` class="${clase}"` : ''}${edit}>${esc(v)}</${tag}>`;
      },
      lista(campo) { const v = leer(d, campo); return Array.isArray(v) ? v : []; },
      boton(campo = 'boton', clase = 'btn') {
        const v = leer(d, campo) || 'Quiero el mío';
        const edit = modo === 'vista' ? ` contenteditable="plaintext-only" spellcheck="false" data-ruta="${base}.${campo}"` : '';
        const fuera = modo !== 'vista' && /^https?:/.test(link) ? ' target="_blank" rel="noopener"' : '';
        return `<a class="${clase}" href="${esc(link)}"${fuera}${edit}>${esc(v)}</a>`;
      },
      tieneFoto(slot) {
        const f = fotos[`${s.tipo}.${slot}`];
        return modo === 'vista' || (f && f.tipo === 'cliente');
      },
      // Devuelve el hueco con la foto. En modo final, si no hay foto del cliente, no devuelve nada.
      foto(slot, clase = '', alt = '') {
        const clave = `${s.tipo}.${slot}`;
        const f = fotos[clave];
        if (modo !== 'vista' && !(f && f.tipo === 'cliente')) return '';
        const marca = modo === 'vista' ? ` data-slot="${clave}"` : '';
        const img = f?.src ? `<img class="foto" src="${esc(f.src)}" alt="${esc(alt || negocio.nombre || '')}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : '';
        const ref = modo === 'vista' && f?.tipo === 'referencia' ? `<span class="ref">Referencia</span>` : '';
        const vacio = modo === 'vista' && !f?.src ? `<span class="vacio">Aquí va tu foto</span>` : '';
        return `<div class="hueco ${clase}"${marca}>${vacio}${img}${ref}</div>`;
      },
    };
    try { return def.html(h); } catch (e) { console.error('Sección', s.tipo, e); return ''; }
  }).join('\n');

  const css = BASE_CSS + [...cssUsado].map(id => _G.SECCIONES[id].css || '').join('\n') + (modo === 'vista' ? EDITOR_CSS : '');
  const raiz = Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';');
  const titulo = negocio.nombre ? `${negocio.nombre}${negocio.frase ? ' · ' + negocio.frase : ''}` : (estilo.nombre || 'Mi página');
  const desc = (estilo.secciones?.find(s => s.tipo === 'hero')?.datos?.subtitulo) || '';

  // Versión para pegar dentro de Shopify o WordPress: estilos aislados para no chocar con el tema.
  if (modo === 'fragmento') {
    const aislado = aislarCSS(css.replace(/(^|})\s*html\s*\{[^}]*\}/g, '$1').replace(/(^|[},])\s*body\s*\{/g, '$1 .vtr{'), '.vtr')
      .replace(/\.vtr \.vtr/g, '.vtr')
      // Prefijo en cada clase para que ninguna clase del tema (.btn, .hero…) la toque.
      .replace(/\.(?!vtr\b)([a-zA-Z][\w-]*)/g, '.v-$1');
    const htmlPref = cuerpo.replace(/class="([^"]*)"/g, (_, c) => `class="${c.split(/\s+/).filter(Boolean).map(x => 'v-' + x).join(' ')}"`);
    return `<link href="https://fonts.googleapis.com/css2?${tema.fuentes}&display=swap" rel="stylesheet">
<style>.vtr{${raiz}}${aislado}</style>
<div class="vtr">
${htmlPref}
</div>`;
  }

  return `<!doctype html>
<html lang="${esc(opciones.idioma || 'es')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${tema.fuentes}&display=swap" rel="stylesheet">
<style>:root{${raiz}}${css}</style>
</head>
<body>
${cuerpo}
${modo === 'vista' ? `<script>${EDITOR_JS}<\/script>` : ''}
</body>
</html>`;
}

if (typeof module !== 'undefined') module.exports = { construirPagina, linkAccion, esc };
else Object.assign(window, { construirPagina, linkAccion });
