// El recorrido completo: negocio → investigación → 3 estilos → marca → fotos y publicar.

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const PARAMS = new URLSearchParams(location.search);

const E = {
  negocio: '', informe: null, estilos: [], refs: [], elegido: null,
  marca: {}, final: null, guia: [], fotos: {}, demo: false,
};

const EJEMPLOS = [
  'Café de especialidad en bolsas de 500 g',
  'Clínica de odontología estética',
  'Ropa deportiva para mujer',
  'Curso online de inglés para adultos',
];
const DEMOS = []; // ej: ['cafe', 'odontologia'] → archivos demo/cafe.json

// ---------- utilidades ----------
function ir(id, paso) {
  $$('.pant').forEach(p => p.classList.toggle('activa', p.id === id));
  $$('#pasos li').forEach(li => {
    const n = +li.dataset.p;
    li.classList.toggle('hecho', n < paso);
    li.classList.toggle('actual', n === paso);
  });
  scrollTo({ top: 0 });
  try { window.medir && window.medir('paso', { n: paso }); } catch {}
}
function aviso(txt, mal = false) {
  const t = $('#toast');
  t.textContent = txt; t.classList.toggle('mal', mal); t.classList.add('on');
  clearTimeout(aviso._t); aviso._t = setTimeout(() => t.classList.remove('on'), mal ? 6000 : 3000);
}
function cargando(txt) {
  $('#cargando').classList.toggle('on', !!txt);
  if (txt) $('#cargando-txt').textContent = txt;
}
function abrir(id) { $(id).classList.add('abierto'); }
function cerrar(el) { el.closest('.modal').classList.remove('abierto'); }
function escHTML(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function ponerEn(obj, ruta, valor) {
  const k = String(ruta).split('.');
  if (k.some(x => x === '__proto__' || x === 'constructor' || x === 'prototype')) return;
  const ult = k.pop();
  const dest = k.reduce((o, x) => o?.[x], obj);
  if (dest) dest[ult] = valor;
}

async function cargarSecciones() {
  await Promise.all(LISTA_SECCIONES.map(n => new Promise(ok => {
    const s = document.createElement('script');
    s.src = `secciones/${n}.js?v=${Date.now()}`; s.onload = ok;
    s.onerror = () => { console.warn('No cargó la sección', n); ok(); };
    document.head.appendChild(s);
  })));
}

// ---------- 1. inicio ----------
function pintarInicio() {
  $('#ejemplos').innerHTML = EJEMPLOS.map(e => `<button type="button">${e}</button>`).join('');
  $$('#ejemplos button').forEach(b => b.onclick = () => { $('#negocio').value = b.textContent; $('#negocio').focus(); });
  if (DEMOS.length) $('#demos').innerHTML = 'Ver un ejemplo ya hecho:' + DEMOS.map(d => `<a href="?demo=${d}">${d}</a>`).join('');
}

$('#f-negocio').onsubmit = async e => {
  e.preventDefault();
  E.negocio = $('#negocio').value.trim();
  if (E.negocio.length < 8) return aviso('Cuéntanos un poco más de tu negocio.', true);
  if (!REGISTRO.hecho()) return abrir('#m-registro');
  seguirDespuesDeRegistro();
};
function seguirDespuesDeRegistro() {
  if (IA.listo()) return arrancarInvestigacion();
  abrir('#m-conectar');
}

// Registro: cada persona queda en la hoja de Joako Estratega (Leads Generales, producto "Creador de Páginas").
const REGISTRO = {
  URL: 'https://script.google.com/macros/s/AKfycbxc4Gjiidf8EM6OZBXWmQPJqQkKMoWToTtS0y0brxLHPubeaX-pyqoyW4962kSErmzy/exec',
  leer(k) { try { return localStorage.getItem(k); } catch { return null; } },
  poner(k, v) { try { localStorage.setItem(k, v); } catch {} },
  hecho() { return !!REGISTRO.leer('pqv_registro'); },
  visita() {
    let v = REGISTRO.leer('pqv_visita');
    if (!v) { v = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); REGISTRO.poner('pqv_visita', v); }
    return v;
  },
};
// Con el mismo código se encuentra la grabación de esa persona en Clarity (filtro "ID personalizado").
setTimeout(() => { try { window.clarity && window.clarity('identify', REGISTRO.visita()); } catch {} }, 1500);

$('#f-registro').onsubmit = async e => {
  e.preventDefault();
  const datos = {
    producto: 'Creador de Páginas',
    nombre: $('#r-nombre').value.trim().slice(0, 80),
    whatsapp: $('#r-whatsapp').value.trim().slice(0, 25),
    email: $('#r-email').value.trim().slice(0, 120),
    negocio: E.negocio.slice(0, 300),
    acepta_mensajes: $('#r-mensajes').checked ? 'si' : 'no',
    visita: REGISTRO.visita(),
    origen: location.origin + location.pathname,
  };
  if ($('#r-web').value) { $('#m-registro').classList.remove('abierto'); return seguirDespuesDeRegistro(); }
  if (datos.nombre.length < 2) return aviso('Escribe tu nombre.', true);
  if (datos.whatsapp.replace(/\D/g, '').length < 7) return aviso('Revisa tu número de WhatsApp.', true);
  // Se manda por detrás (keepalive) para que la persona siga sin esperar a la hoja.
  try { fetch(REGISTRO.URL, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(datos) }).catch(() => {}); } catch {}
  REGISTRO.poner('pqv_registro', '1');
  try { window.medir && window.medir('registro', { visita: datos.visita }); } catch {}
  try { window.clarity && (window.clarity('identify', datos.visita), window.clarity('set', 'registrado', 'si')); } catch {}
  $('#m-registro').classList.remove('abierto');
  seguirDespuesDeRegistro();
};

$('#b-llave').onclick = async () => {
  const b = $('#b-llave'); b.disabled = true; b.textContent = 'Revisando tu llave…';
  try {
    await IA.usarLlave($('#in-llave').value);
    $('#m-conectar').classList.remove('abierto');
    aviso('Listo. Tu llave quedó guardada en este navegador.');
    try { window.medir && window.medir('modo', { modo: 'llave' }); } catch {}
    arrancarInvestigacion();
  } catch (e) { aviso(e.message, true); }
  b.disabled = false; b.textContent = 'Guardar y empezar';
};

$('#b-chat').onclick = () => {
  IA.usarChat();
  try { window.medir && window.medir('modo', { modo: 'chat' }); } catch {}
  $('#m-conectar').classList.remove('abierto');
  arrancarInvestigacion();
};

// Modo chat: muestra las instrucciones, la persona las pega en su chat y trae la respuesta.
const TITULOS_CHAT = {
  1: ['Paso 1 de 3', 'Pídele a tu chat que busque las páginas', 'Pega, envía y espera. Si tu chat tiene un botón de "Buscar en la web", actívalo.'],
  2: ['Paso 2 de 3', 'Pídele a tu chat que diseñe tus 3 estilos', 'Pega, envía y espera a que termine. Puede tardar un minuto.'],
  3: ['Paso 3 de 3', 'Pídele a tu chat que escriba tu página', 'Pega, envía y espera a que termine. Puede tardar un minuto.'],
};
IA.alChat = (prompt, { paso = 1, json = false } = {}) => new Promise((ok, no) => {
  const [p, t, pegar] = TITULOS_CHAT[paso] || TITULOS_CHAT[1];
  $('#ch-paso').textContent = p; $('#ch-titulo').textContent = t; $('#ch-pegar-txt').textContent = pegar;
  $('#ch-resp').value = ''; $('#ch-error').textContent = '';
  cargando(false);
  abrir('#m-chat');
  $('#ch-copiar').onclick = async () => {
    try { await navigator.clipboard.writeText(prompt); aviso('Instrucciones copiadas. Pégalas en tu chat.'); }
    catch { $('#ch-resp').value = prompt; $('#ch-resp').select(); aviso('Copia el texto del recuadro y pégalo en tu chat.'); }
  };
  $('#ch-portapapeles').onclick = async () => {
    try { $('#ch-resp').value = await navigator.clipboard.readText(); } catch { aviso('Pega con Ctrl + V dentro del recuadro.'); }
  };
  $('#ch-listo').onclick = () => {
    const txt = $('#ch-resp').value.trim();
    if (!txt) return ($('#ch-error').textContent = 'Primero pega la respuesta de tu chat.');
    if (txt === prompt.trim()) return ($('#ch-error').textContent = 'Eso son las instrucciones. Pega la RESPUESTA que te dio el chat.');
    if (json) {
      try { const d = IA.extraerJSON(txt); $('#m-chat').classList.remove('abierto'); return ok(d); }
      catch {
        if (!/[{\[]/.test(txt)) return ($('#ch-error').textContent = 'Tu chat no quiso hacerlo. Pasa a veces. Abre un chat nuevo, pega las instrucciones otra vez y trae la nueva respuesta.');
        return ($('#ch-error').textContent = 'La respuesta llegó incompleta. Espera a que el chat termine y copia todo con su botón Copiar.');
      }
    }
    $('#m-chat').classList.remove('abierto'); ok(txt);
  };
  $('#ch-cambiar').onclick = () => {
    $('#m-chat').classList.remove('abierto');
    IA.olvidar(); abrir('#m-conectar');
    no(new Error('Elige el modo automático y vuelve a intentar.'));
  };
});

// ---------- 2. investigación ----------
async function arrancarInvestigacion() {
  ir('p-investigando', 2);
  $('#inv-fase').classList.add('pulso');
  $$('.error-caja').forEach(c => c.remove());
  $('#inv-grilla').innerHTML = '';
  $('#inv-titulo').textContent = 'Buscando las páginas que más venden en tu negocio…';
  $('#inv-sub').textContent = `"${E.negocio}"`;
  const barra = $('#inv-barra');
  let total = 20, listas = 0;
  barra.style.width = '6%';

  try {
    E.informe = await investigar(E.negocio, ev => {
      if (ev.fase === 'buscar') { $('#inv-fase').textContent = 'Buscando en todo el mundo'; }
      if (ev.fase === 'lista') {
        total = ev.paginas.length;
        $('#inv-fase').textContent = 'Revisando páginas';
        $('#inv-titulo').textContent = `Encontramos ${total} páginas. Las estamos revisando una por una.`;
        $('#inv-grilla').innerHTML = ev.paginas.map((p, k) => `
          <div class="pag" id="pag-${k}" style="animation-delay:${k * 40}ms">
            <div class="pag-cap"></div><span class="pag-estado">En espera</span>
            <div class="pag-info"><strong>${escHTML(p.marca || new URL(p.url).hostname)}</strong><small>${escHTML(p.pais || new URL(p.url).hostname.replace(/^www\./, ''))}</small><div class="chips"></div></div>
          </div>`).join('');
        barra.style.width = '12%';
      }
      if (ev.fase === 'leyendo') {
        const c = $(`#pag-${ev.k}`); c?.classList.add('leyendo');
        c && (c.querySelector('.pag-estado').textContent = 'Leyendo…');
      }
      if (ev.fase === 'leida' || ev.fase === 'fallo') {
        listas++;
        barra.style.width = `${12 + (listas / total) * 70}%`;
        const c = $(`#pag-${ev.k}`); if (!c) return;
        c.classList.remove('leyendo');
        if (ev.fase === 'fallo') { c.classList.add('fallo'); c.querySelector('.pag-estado').textContent = 'No abrió'; return; }
        c.classList.add('leida');
        c.querySelector('.pag-estado').textContent = ev.pagina?.fuente === 'chat' ? '✓ Según tu chat' : '✓ Revisada';
        const p = ev.pagina;
        const img = new Image(); img.referrerPolicy = 'no-referrer';
        img.onload = () => img.classList.add('ok');
        img.onerror = () => { if (p.imagen && img.src !== p.imagen) img.src = p.imagen; };
        img.src = p.captura;
        c.querySelector('.pag-cap').appendChild(img);
        c.querySelector('.chips').innerHTML = p.gatillos.slice(0, 4).map(g => `<span>${g}</span>`).join('');
        $('#inv-titulo').textContent = `Revisando páginas: ${listas} de ${total}`;
      }
      if (ev.fase === 'analizar') {
        $('#inv-fase').textContent = 'Comparando';
        $('#inv-titulo').textContent = ev.msg;
        barra.style.width = '88%';
      }
    });
    barra.style.width = '100%';
    await crearEstilos();
  } catch (e) {
    console.error(e, e.original);
    $('#inv-fase').textContent = 'Se detuvo';
    $('#inv-fase').classList.remove('pulso');
    $('#inv-titulo').textContent = 'La investigación se detuvo';
    mostrarError('#inv-grilla', e, arrancarInvestigacion);
  }
}

// Caja de error visible, con el detalle técnico escondido para quien lo necesite.
function mostrarError(donde, e, reintentar) {
  const caja = document.createElement('div');
  caja.className = 'error-caja';
  const tecnico = e?.original ? (e.original.message || JSON.stringify(e.original)) : (e?.stack || '');
  caja.innerHTML = `<strong>${escHTML(e?.message || 'Algo falló.')}</strong>
    <p>No perdiste nada. Puedes intentarlo otra vez.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="b-prim">Intentar de nuevo</button><button class="b-sec">Cambiar mi negocio</button></div>
    ${tecnico ? `<details><summary>Detalle técnico</summary>${escHTML(String(tecnico).slice(0, 600))}</details>` : ''}`;
  const [b1, b2] = caja.querySelectorAll('button');
  b1.onclick = () => { caja.remove(); reintentar(); };
  b2.onclick = () => ir('p-inicio', 1);
  $(donde).before(caja);
}

// ---------- 3. estilos ----------
async function crearEstilos() {
  ir('p-estilos', 3);
  const paises = new Set(E.informe.paginas.map(p => p.pais).filter(Boolean)).size;
  $('#est-pill').textContent = `Informe listo · ${E.informe.paginas.length} páginas${paises > 1 ? ` de ${paises} países` : ''}`;
  if (!E.estilos.length) {
    $('#estilos').innerHTML = ['Impacto', 'Editorial', 'Limpio'].map(n => `<div class="estilo"><div class="esqueleto">Diseñando estilo ${n}…</div></div>`).join('');
    try {
      E.estilos = await generarEstilos(E.informe);
      if (!E.estilos.length) throw new Error('No pudimos diseñar los estilos.');
    } catch (e) {
      console.error(e, e.original);
      $('#estilos').innerHTML = '';
      mostrarError('#estilos', e, crearEstilos);
      return;
    }
  }
  E.refs = E.estilos.map((es, n) => referenciasIniciales(es, E.informe, n));
  pintarEstilos();
}

function pintarEstilos() {
  $('#estilos').innerHTML = E.estilos.map((es, i) => `
    <article class="estilo">
      <div class="miniatura" data-i="${i}"><iframe loading="lazy" tabindex="-1" sandbox="allow-scripts"></iframe><span class="ver">Ver en grande</span></div>
      <h3>${escHTML(es.nombre || TEMAS[es.tema].nombre)} <small>${TEMAS[es.tema].nombre}</small></h3>
      <p>${escHTML(es.por_que || '')}</p>
      <button class="b-prim" data-elegir="${i}">Usar este estilo</button>
    </article>`).join('');
  $$('.miniatura').forEach(m => {
    const i = +m.dataset.i;
    const f = m.querySelector('iframe');
    f.srcdoc = construirPagina(E.estilos[i], {}, E.refs[i], { modo: 'vista' });
    const ajustar = () => f.style.transform = `scale(${m.clientWidth / 1280})`;
    ajustar(); new ResizeObserver(ajustar).observe(m);
    m.onclick = () => verGrande(i);
  });
  $$('[data-elegir]').forEach(b => b.onclick = () => elegir(+b.dataset.elegir));
}

function verGrande(i) {
  $('#mv-nombre').textContent = E.estilos[i].nombre || TEMAS[E.estilos[i].tema].nombre;
  $('#mv-iframe').srcdoc = construirPagina(E.estilos[i], {}, E.refs[i], { modo: 'vista' });
  $('#mv-elegir').onclick = () => { $('#m-vista').classList.remove('abierto'); elegir(i); };
  abrir('#m-vista');
}

function elegir(i) {
  E.elegido = i;
  const f = $('#f-marca');
  if (!f.que_vende.value) f.que_vende.value = E.negocio;
  ir('p-marca', 4);
}

// ---------- informe ----------
$('#b-informe').onclick = () => {
  const inf = E.informe; if (!inf) return;
  const max = Math.max(...inf.gatillos.map(g => g.veces), 1);
  $('#informe').innerHTML = `
    <div class="inf-cab"><span class="pill">Informe de tu mercado</span><h2>Lo que hacen las ${inf.paginas.length} páginas que revisamos</h2><p class="sub">${escHTML(inf.resumen)}</p></div>
    <div class="inf-grid">
      <div class="inf-bloque"><h4>Lo que más usan para vender</h4>${inf.gatillos.map(g => `<div class="barra-g"><span>${g.nombre}</span><i><b style="width:${(g.veces / max) * 100}%"></b></i><span>${g.veces}/${g.de}</span></div>`).join('')}</div>
      <div class="inf-bloque"><h4>Orden de secciones que más se repite</h4><ol>${(inf.estructura || []).map(s => `<li>${escHTML(s)}</li>`).join('')}</ol></div>
      <div class="inf-bloque"><h4>Ganchos de los titulares</h4><ul>${(inf.promesas || []).map(s => `<li>${escHTML(s)}</li>`).join('')}</ul></div>
      <div class="inf-bloque"><h4>Fotos y videos</h4><p>${escHTML(inf.estilo_imagen)}</p><h4>Precios</h4><p>${escHTML(inf.precios)}</p></div>
      <div class="inf-bloque inf-op" style="grid-column:1/-1"><h4>Lo que casi nadie hace (tu oportunidad)</h4><p>${escHTML(inf.oportunidad)}</p></div>
    </div>
    <div class="grilla-paginas">${inf.paginas.map(p => `
      <a class="pag leida" href="${escHTML(p.url)}" target="_blank" rel="noopener">
        <div class="pag-cap"><img class="ok" src="${escHTML(p.captura)}" referrerpolicy="no-referrer" loading="lazy"></div>
        <div class="pag-info"><strong>${escHTML(p.marca)}</strong><small>${escHTML(p.pais || p.dominio)}${p.precios[0] ? ' · ' + escHTML(p.precios[0]) : ''}</small><div class="chips">${p.gatillos.slice(0, 5).map(g => `<span>${g}</span>`).join('')}</div></div>
      </a>`).join('')}</div>`;
  $$('#informe .pag-cap img').forEach((img, k) => {
    const p = inf.paginas[k];
    img.onerror = () => { if (p?.imagen && /^https?:/.test(p.imagen) && img.src !== p.imagen) img.src = p.imagen; };
  });
  abrir('#m-informe');
};

// ---------- 4. marca ----------
$('#f-marca').onsubmit = async e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  if (d.color === '#000000') delete d.color;
  E.marca = d;
  const estilo = E.estilos[E.elegido];
  cargando('Escribiendo tu página con los datos de tu marca…');
  try {
    if (IA.listo()) {
      const r = await personalizar(estilo, E.marca, E.informe);
      E.final = r.estilo; E.guia = r.guia;
    } else {
      E.final = JSON.parse(JSON.stringify(estilo));
      E.guia = fotosDelEstilo(estilo).map(f => ({ ...f, celular: f.que, prompt: '', referencia: E.refs[E.elegido][f.clave]?.src }));
    }
    E.fotos = { ...E.refs[E.elegido] };
    cargando(false);
    abrirEditor();
    revisarPromesas();
  } catch (err) {
    console.error(err, err.original); cargando(false);
    aviso(err.message || 'No pudimos escribir tu página. Intenta de nuevo.', true);
  }
};

// Promesas que la IA suele inventar: si la persona no las escribió, se le pide revisarlas.
const PROMESAS = [
  ['Envío gratis', /env[ií]os? gratis|env[ií]o sin costo/i],
  ['Pago contra entrega', /contra ?entrega|pag(a|o) al recibir/i],
  ['Descuento', /\d{1,2}\s?%|descuento/i],
  ['Cifras de clientes', /\+?\d[\d.,]*\s?(k|mil)?\s?(clientes|personas|usuarios|pedidos)/i],
  ['Testimonios', /testimoni|rese[ñn]as|opiniones/i],
  ['Años de experiencia', /\d+\s?a[ñn]os de experiencia/i],
];
function revisarPromesas() {
  const pagina = JSON.stringify(E.final?.secciones || []);
  const marca = JSON.stringify(E.marca || {});
  const dudas = PROMESAS.filter(([, re]) => re.test(pagina) && !re.test(marca)).map(([n]) => n);
  const caja = $('#revisar-promesas');
  caja.innerHTML = dudas.length ? `<b>Revisa antes de publicar.</b> Tu página dice esto y tú no lo escribiste: ${dudas.join(', ')}. Si no es cierto, toca ese texto y cámbialo.` : '';
}

// ---------- 5. editor ----------
function htmlVista() { return construirPagina(E.final, E.marca, E.fotos, { modo: 'vista' }); }

function refrescarVista() {
  const f = $('#vista');
  const y = E.scrollVista || 0;
  f.onload = () => { try { f.contentWindow.postMessage({ tipo: 'ir', y }, '*'); } catch {} };
  f.srcdoc = htmlVista();
}

function abrirEditor() {
  ir('p-editor', 5);
  refrescarVista();
  pintarFotos();
}

function pintarFotos() {
  const hechas = E.guia.filter(g => E.fotos[g.clave]?.tipo === 'cliente').length;
  $('#tab-fotos').textContent = `Fotos (${hechas}/${E.guia.length})`;
  $('#barra-der').textContent = E.marca.nombre || '';
  const faltan = E.guia.length - hechas;
  $('#aviso-fotos').textContent = faltan ? `Te faltan ${faltan} foto${faltan > 1 ? 's' : ''}. Puedes publicar igual: esas partes se ajustan solas sin foto. Las fotos de referencia nunca se publican.` : '';
  $('#lista-fotos').innerHTML = E.guia.map((g, i) => {
    const f = E.fotos[g.clave];
    const tuya = f?.tipo === 'cliente';
    return `<div class="foto-c" id="fc-${i}" data-clave="${g.clave}">
      <div class="foto-top"><div class="foto-mini" style="background-image:url('${f?.src || ''}')"></div>
        <div><strong>${escHTML(g.seccion)}</strong><span class="estado ${tuya ? 'ok' : 'ref'}">${tuya ? '✓ Tu foto' : 'Usando foto de referencia'}</span></div></div>
      <p><b>Cómo tomarla:</b> ${escHTML(g.celular)}</p>
      <div class="foto-btns"><button class="b-prim" data-subir="${g.clave}">Subir mi foto</button><button class="b-sec" data-ia="${i}">Crearla con IA</button></div>
      <div class="ia-pasos" id="ia-${i}">
        <ol>
          <li>Abre <a href="https://gemini.google.com/app" target="_blank" rel="noopener">Gemini</a> (es gratis con tu cuenta de Google).</li>
          ${g.referencia ? `<li>Guarda esta <a href="${escHTML(g.referencia)}" target="_blank" rel="noopener">imagen de referencia</a> y adjúntala en Gemini con el botón +.</li>` : ''}
          <li>Copia y pega este texto:</li>
        </ol>
        <div class="prompt">${escHTML(g.prompt || `Professional advertising photo: ${g.que}. ${E.marca.que_vende || E.negocio}. Natural light, high detail, no text.`)}</div>
        <button class="b-sec" data-copiar="${i}">Copiar texto</button>
        <ol start="${g.referencia ? 4 : 3}"><li>Descarga la imagen que te dé y súbela con "Subir mi foto".</li></ol>
      </div>
    </div>`;
  }).join('');
  $$('[data-subir]').forEach(b => b.onclick = () => pedirFoto(b.dataset.subir));
  $$('[data-ia]').forEach(b => b.onclick = () => $(`#ia-${b.dataset.ia}`).classList.toggle('abierto'));
  $$('[data-copiar]').forEach(b => b.onclick = () => {
    navigator.clipboard.writeText($(`#ia-${b.dataset.copiar} .prompt`).textContent);
    aviso('Texto copiado. Pégalo en Gemini.');
  });
}

let claveFoto = null;
function pedirFoto(clave) { claveFoto = clave; $('#subir').value = ''; $('#subir').click(); }

$('#subir').onchange = async e => {
  const archivo = e.target.files[0]; if (!archivo || !claveFoto) return;
  const src = await achicar(archivo);
  E.fotos[claveFoto] = { src, tipo: 'cliente' };
  refrescarVista(); pintarFotos();
  aviso('Foto puesta en tu página.');
};

function achicar(archivo, max = 1600) {
  return new Promise((ok, no) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL('image/jpeg', 0.84));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = no;
    img.src = URL.createObjectURL(archivo);
  });
}

// Mensajes que manda la vista previa (texto editado o clic en una foto).
addEventListener('message', ev => {
  if (![...$$('iframe')].some(f => f.contentWindow === ev.source)) return;
  const m = ev.data || {};
  if (m.tipo === 'scroll' && ev.source === $('#vista').contentWindow) { E.scrollVista = +m.y || 0; return; }
  if (m.tipo === 'texto' && E.final) ponerEn(E.final, m.ruta, m.valor);
  if (m.tipo === 'foto') {
    $$('.tabs button')[0].click();
    const c = $(`.foto-c[data-clave="${m.slot}"]`);
    if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.classList.add('brilla'); setTimeout(() => c.classList.remove('brilla'), 1600); }
  }
});

$$('.tabs button').forEach(b => b.onclick = () => {
  $$('.tabs button').forEach(x => x.classList.toggle('on', x === b));
  $$('.tab').forEach(t => t.classList.toggle('activa', t.id === `t-${b.dataset.tab}`));
});

$$('.seg').forEach(seg => seg.querySelectorAll('button').forEach(b => b.onclick = () => {
  seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  seg.closest('.vista, .modal-caja').querySelector('iframe').style.width = b.dataset.ancho;
}));

// Sin servidor: las fotos van dentro de la página, más livianas para que el código quepa al pegarlo.
function aliviar(src, max = 1200) {
  return new Promise(ok => {
    if (!src.startsWith('data:')) return ok(src);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL('image/jpeg', 0.74));
    };
    img.onerror = () => ok(src);
    img.src = src;
  });
}

async function fotosLivianas() {
  const fotos = {};
  for (const [clave, f] of Object.entries(E.fotos)) {
    if (f.tipo === 'cliente') fotos[clave] = { ...f, src: await aliviar(f.src) };
  }
  return fotos;
}

async function copiar(codigo, msg) {
  $('#pub-res').innerHTML = `<div class="res-link">Este es el código de tu página:<textarea class="prompt" rows="5" readonly onclick="this.select()">${escHTML(codigo)}</textarea></div>`;
  try { await navigator.clipboard.writeText(codigo); aviso(msg); }
  catch { aviso('Selecciona todo el código del recuadro y cópialo.'); }
}

// Publicar gratis en Google Sites: se copia la página completa y se pega como página completa insertada.
$('#b-sites').onclick = async () => {
  const b = $('#b-sites'); const txt = b.textContent; b.disabled = true; b.textContent = 'Preparando…';
  try {
    const codigo = construirPagina(E.final, E.marca, await fotosLivianas(), { modo: 'final' });
    await copiar(codigo, 'Página copiada. Ahora sigue los pasos de Google Sites.');
    $('#pasos-sites').classList.add('abierto');
    try { window.medir && window.medir('publicar', { donde: 'google_sites' }); } catch {}
  } catch (e) { console.error(e); aviso('No pudimos copiar tu página. Intenta de nuevo.', true); }
  b.disabled = false; b.textContent = txt;
};

$('#b-descargar').onclick = async () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([construirPagina(E.final, E.marca, await fotosLivianas(), { modo: 'final' })], { type: 'text/html' }));
  try { window.medir && window.medir('publicar', { donde: 'descarga' }); } catch {}
  a.download = `${(E.marca.nombre || 'mi-pagina').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
  a.click();
};

// Para Shopify y WordPress: versión con estilos aislados para no chocar con el tema.
$('#b-copiar').onclick = async () => {
  const b = $('#b-copiar'); const txt = b.textContent; b.disabled = true; b.textContent = 'Preparando…';
  try {
    const codigo = construirPagina(E.final, E.marca, await fotosLivianas(), { modo: 'fragmento' });
    await copiar(codigo, 'Código copiado. Sigue la guía de tu tienda para pegarlo.');
    try { window.medir && window.medir('publicar', { donde: 'tienda' }); } catch {}
  } catch (e) { console.error(e); aviso('No pudimos preparar el código. Intenta de nuevo.', true); }
  b.disabled = false; b.textContent = txt;
};

$$('[data-cerrar]').forEach(b => b.onclick = () => cerrar(b));
$$('.modal').forEach(m => m.onclick = e => { if (e.target === m) m.classList.remove('abierto'); });

// ---------- demo y guardado ----------
// ?demo=nombre carga demo/nombre.json (investigación + estilos ya hechos).
// &estilo=N salta directo al editor con ese estilo y la marca guardada en el demo.
// ?admin muestra el botón para guardar la investigación actual como demo.
async function cargarDemo(nombre) {
  const r = await fetch(`demo/${nombre}.json`);
  const d = await r.json();
  Object.assign(E, { negocio: d.informe.negocio, informe: d.informe, estilos: d.estilos, demo: true });
  $('#negocio').value = E.negocio;
  await crearEstilos();
  if (PARAMS.has('estilo')) {
    elegir(+PARAMS.get('estilo') || 0);
    const f = $('#f-marca');
    Object.entries(d.marca || {}).forEach(([k, v]) => { if (f[k]) f[k].value = v; });
    if (d.marca) f.requestSubmit();
  }
}

if (PARAMS.has('admin')) {
  const b = document.createElement('button');
  b.className = 'b-sec'; b.textContent = 'Guardar demo';
  b.onclick = () => {
    if (!E.informe || !E.estilos.length) return aviso('Primero corre una investigación.', true);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ informe: E.informe, estilos: E.estilos, marca: E.marca }, null, 1)], { type: 'application/json' }));
    a.download = 'demo.json'; a.click();
  };
  $('#barra-der').after(b);
}

// ---------- arranque ----------
(async () => {
  await cargarSecciones();
  pintarInicio();
  if (PARAMS.get('demo')) {
    try { await cargarDemo(PARAMS.get('demo')); } catch (e) { console.error(e); aviso('No encontramos ese ejemplo.', true); }
  }
})();

window.aviso = aviso;
