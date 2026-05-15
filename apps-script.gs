// =====================================================
// CAPTURA + AGENDAMIENTO — JOAKO ESTRATEGA v3
// =====================================================
// Maneja:
//  · Captura de leads (formularios de las 4 landings)
//  · Sistema de agendamiento de Asesoría MPV
//      - Verificación de pago en Wompi
//      - Slots disponibles con regla de 3h + simulación de ocupación
//      - Creación automática de evento Calendar + Meet
//      - Alertas a Joako (email + Telegram)
// =====================================================

// ─── CONFIGURACIÓN ──────────────────────────────────
const SHEET_ID = '1pntzHPFutw6ZM7E9iUECW767mXRoxRUZHJgmX5rwWB8';
const EMAIL_NOTIFICACION = 'joakoestratega@gmail.com';
const CALENDAR_ID = 'joakoestratega@gmail.com';
const TELEGRAM_BOT_TOKEN = '8989852821:AAHs56lmK79xyS5_8e1L1nym5maEXwZlask';
const TELEGRAM_CHAT_ID = '815920612';
const WOMPI_PUBLIC_KEY = 'pub_test_M1mFEVzC2NXa2r5E69WdNm6ddHjq76Xx';
const WOMPI_INTEGRITY_KEY = 'test_integrity_5IDf7ZMVxDJw8KfnHjLU1Nlquc6Y38P8';
const WOMPI_API = 'https://sandbox.wompi.co/v1';  // cambiar a https://production.wompi.co/v1 cuando vaya live
const TZ = 'America/Bogota';
const ASESORIA_AMOUNT_CENTS = 20000000;  // $200.000 COP fijo
const ASESORIA_CURRENCY = 'COP';

// Horario de la Asesoría
const ASESORIA_HORAS = ['15:00', '17:00', '18:30'];  // 3pm, 5pm, 6:30pm
const ASESORIA_DURACION_MIN = 90;
const DIAS_LABORALES = [1, 2, 3, 4, 5];  // lunes a viernes
const DIAS_A_MOSTRAR = 3;
const MIN_HORAS_ANTICIPACION = 3;

// Hojas por producto
const HOJAS_POR_PRODUCTO = {
  'Asesoría MPV': 'Leads Asesoría MPV',
  'Implementación MPV': 'Leads Implementación MPV',
  'Acompañamiento MPV': 'Leads Acompañamiento MPV',
  'Comunidad WhatsApp': 'Leads Comunidad',
  'Newsletter Método MPV': 'Leads Método MPV',
  'Contacto Home': 'Contactos Home',
  'default': 'Leads Generales'
};

// Hoja interna de reservas (para anti-doble-booking)
const HOJA_RESERVAS = 'Reservas Asesoría';

// =====================================================
// ROUTERS — doGet y doPost
// =====================================================

function doGet(e) {
  const action = (e && e.parameter) ? e.parameter.action : null;

  if (action === 'slots') {
    return jsonResponse(obtenerSlots());
  }

  if (action === 'verifyPayment') {
    return jsonResponse(verificarPago(e.parameter.ref, e.parameter.id));
  }

  if (action === 'signature') {
    return jsonResponse(generarFirmaWompi(e.parameter.ref));
  }

  if (action === 'verifyCortesia') {
    return jsonResponse(verificarCodigoCortesia(e.parameter.codigo));
  }

  return ContentService
    .createTextOutput('Apps Script Joako Estratega · v3.4 · cortesia + slots fix')
    .setMimeType(ContentService.MimeType.TEXT);
}

function generarFirmaWompi(referencia) {
  if (!referencia) return { success: false, error: 'Sin referencia' };
  // Wompi requiere: SHA256(referencia + amountInCents + currency + integrityKey)
  const concat = referencia + ASESORIA_AMOUNT_CENTS + ASESORIA_CURRENCY + WOMPI_INTEGRITY_KEY;
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, concat);
  const hex = bytes.map(function (b) {
    const v = (b < 0) ? b + 256 : b;
    return ('0' + v.toString(16)).slice(-2);
  }).join('');
  return {
    success: true,
    signature: hex,
    amountInCents: ASESORIA_AMOUNT_CENTS,
    currency: ASESORIA_CURRENCY
  };
}

function doPost(e) {
  try {
    let data = {};
    try { data = JSON.parse(e.postData.contents); } catch (err) { data = {}; }

    const action = data.action || '';

    if (action === 'book') {
      return jsonResponse(crearReserva(data));
    }

    if (action === 'bookCortesia') {
      return jsonResponse(crearReservaCortesia(data));
    }

    if (data.event === 'transaction.updated') {
      return jsonResponse(procesarWebhookWompi(data));
    }

    return guardarLead(data);

  } catch (error) {
    Logger.log('Error doPost: ' + error.toString());
    notificarError(error, e);
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// =====================================================
// CAPTURA DE LEADS (lo que ya funcionaba)
// =====================================================

function guardarLead(data) {
  const producto = data.producto || 'default';
  const nombreHoja = HOJAS_POR_PRODUCTO[producto] || HOJAS_POR_PRODUCTO['default'];
  const estadoLead = data.estado || 'Aplicó';
  const esParcial = estadoLead === 'Lead parcial';

  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(nombreHoja);

  if (!sheet) {
    sheet = ss.insertSheet(nombreHoja);
    const headers = ['Fecha', ...Object.keys(data).filter(k => k !== 'estado'), 'Estado'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#21209C').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const fila = headers.map(header => {
    if (header === 'Fecha') return new Date();
    if (header === 'Estado') return estadoLead;
    return data[header] !== undefined ? data[header] : '';
  });

  const headersSet = new Set(headers);
  const camposNuevos = Object.keys(data).filter(k => k !== 'estado' && !headersSet.has(k));
  if (camposNuevos.length > 0) {
    camposNuevos.forEach(campo => {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(campo)
        .setBackground('#21209C').setFontColor('#FFFFFF').setFontWeight('bold');
    });
    camposNuevos.forEach(campo => fila.push(data[campo]));
  }

  sheet.appendRow(fila);

  if (esParcial) {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).setBackground('#FFF4CC');
  }

  if (!esParcial) {
    const asunto = '🔥 Nuevo lead: ' + producto;
    GmailApp.sendEmail(EMAIL_NOTIFICACION, asunto, construirCuerpoEmailLead(data, producto));
  }

  return jsonResponse({ success: true, message: 'Lead guardado en ' + nombreHoja });
}

function construirCuerpoEmailLead(data, producto) {
  let cuerpo = 'Tienes un nuevo lead.\n\n';
  cuerpo += 'PRODUCTO: ' + producto + '\n';
  cuerpo += 'FECHA: ' + new Date().toLocaleString('es-CO', { timeZone: TZ }) + '\n';
  cuerpo += '─────────────────────\n\n';

  const ordenComun = ['nombre', 'whatsapp', 'email', 'instagram', 'negocio'];
  ordenComun.forEach(campo => {
    if (data[campo]) {
      const label = campo.charAt(0).toUpperCase() + campo.slice(1);
      cuerpo += label + ': ' + data[campo] + '\n';
    }
  });

  cuerpo += '\n─────────────────────\nDETALLES ADICIONALES\n─────────────────────\n';
  Object.keys(data).forEach(campo => {
    if (ordenComun.includes(campo)) return;
    if (['producto', 'origen', 'action'].indexOf(campo) >= 0) return;
    const label = campo.charAt(0).toUpperCase() + campo.slice(1).replace(/_/g, ' ');
    cuerpo += label + ': ' + data[campo] + '\n';
  });

  if (data.origen) cuerpo += '\n─────────────────────\nURL DE ORIGEN: ' + data.origen + '\n';
  cuerpo += '\nAcción siguiente: revisa la hoja "' + (HOJAS_POR_PRODUCTO[producto] || HOJAS_POR_PRODUCTO['default']) + '" en Google Sheets.';
  return cuerpo;
}

// =====================================================
// AGENDAMIENTO — SLOTS DISPONIBLES
// =====================================================

function obtenerSlots() {
  const ahora = new Date();
  const desde = new Date(ahora.getTime() + MIN_HORAS_ANTICIPACION * 60 * 60 * 1000);

  const cal = CalendarApp.getCalendarById(CALENDAR_ID);
  const dias = [];
  const cursor = new Date(desde);
  cursor.setHours(0, 0, 0, 0);

  // Buscar hasta 14 días adelante para asegurar 3 días hábiles con slots
  let intentos = 0;
  while (dias.length < DIAS_A_MOSTRAR && intentos < 14) {
    intentos++;
    const dow = cursor.getDay();
    if (DIAS_LABORALES.indexOf(dow) >= 0) {
      const slotsDelDia = generarSlotsDelDia(cursor, desde, cal);
      if (slotsDelDia.length > 0) {
        dias.push({
          fecha: formatearFecha(cursor),
          fechaISO: Utilities.formatDate(cursor, TZ, 'yyyy-MM-dd'),
          slots: slotsDelDia
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return { success: true, dias: dias };
}

function generarSlotsDelDia(fecha, desde, cal) {
  const slots = [];

  ASESORIA_HORAS.forEach(hora => {
    const [h, m] = hora.split(':').map(Number);
    const inicio = new Date(fecha);
    inicio.setHours(h, m, 0, 0);
    const fin = new Date(inicio.getTime() + ASESORIA_DURACION_MIN * 60 * 1000);

    if (inicio < desde) return;  // antes de la ventana de 3h

    // Calendar es la ÚNICA fuente de verdad. Si Joako borra el evento, el slot
    // vuelve a quedar libre. La hoja "Reservas Asesoría" queda solo como historial.
    const eventos = cal.getEvents(inicio, fin);
    const ocupado = eventos.some(ev => !ev.isAllDayEvent() && ev.getMyStatus() !== CalendarApp.GuestStatus.NO);
    if (ocupado) return;

    slots.push({
      hora: hora,
      label: formatearHora(hora),
      isoStart: inicio.toISOString(),
      isoEnd: fin.toISOString()
    });
  });

  // Simulación de ocupación: si hay 3 slots libres, mostrar máximo 2 (parece que hay demanda)
  // Determinístico por día (mismos para todos los visitantes del mismo día)
  if (slots.length === 3) {
    const semilla = Utilities.formatDate(fecha, TZ, 'yyyyMMdd');
    const seleccion = pseudoRandomSeleccion(semilla, slots.length, 2);
    return seleccion.map(i => slots[i]);
  }

  return slots;
}

function pseudoRandomSeleccion(semilla, total, cuantos) {
  // Hash determinístico de la semilla para elegir índices
  let hash = 0;
  for (let i = 0; i < semilla.length; i++) hash = (hash << 5) - hash + semilla.charCodeAt(i);
  const indices = [];
  for (let i = 0; i < total; i++) indices.push(i);
  // Shuffle con Fisher-Yates determinístico
  for (let i = indices.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = Math.abs(hash) % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, cuantos).sort((a, b) => a - b);
}

// =====================================================
// FLUJO CORTESÍA (pago manual fuera de Wompi)
// =====================================================
// Joako genera un código manualmente en la hoja "Códigos Cortesía" con los
// datos de la clienta y el código único. Le envía el link por WhatsApp:
// https://joakoestratega.com/agendar-cortesia/?codigo=XXX
// La clienta entra, el sistema valida el código y le permite agendar.

const HOJA_CORTESIA = 'Códigos Cortesía';

function verificarCodigoCortesia(codigo) {
  if (!codigo) return { success: false, error: 'Sin código' };
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA_CORTESIA);
    if (!sheet) return { success: false, error: 'Hoja de cortesía no existe' };
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return { success: false, error: 'Código no encontrado' };
    const headers = data[0].map(h => String(h).toLowerCase().trim());
    const colCodigo = headers.indexOf('código');
    const colUsado = headers.indexOf('usado');
    if (colCodigo === -1) return { success: false, error: 'Hoja mal configurada (falta columna "Código")' };
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][colCodigo]).trim() === String(codigo).trim()) {
        const usadoVal = colUsado >= 0 ? String(data[i][colUsado]).toLowerCase().trim() : '';
        if (usadoVal === 'sí' || usadoVal === 'si' || usadoVal === 'true' || usadoVal === '✓') {
          return { success: false, error: 'Este código ya fue usado', yaUsado: true };
        }
        const result = { success: true, fila: i + 1 };
        headers.forEach((h, j) => { result[h] = data[i][j]; });
        return result;
      }
    }
    return { success: false, error: 'Código no válido' };
  } catch (e) {
    Logger.log('verificarCodigoCortesia error: ' + e);
    return { success: false, error: e.toString() };
  }
}

function crearReservaCortesia(data) {
  if (!data.codigo || !data.isoStart) return { success: false, error: 'Datos incompletos' };

  const cortesia = verificarCodigoCortesia(data.codigo);
  if (!cortesia.success) return { success: false, error: cortesia.error };

  // Fusionar datos del código con los del request (request tiene prioridad)
  data.nombre = data.nombre || cortesia['nombre'] || '';
  data.email = data.email || cortesia['email'] || '';
  data.whatsapp = data.whatsapp || cortesia['whatsapp'] || '';
  data.instagram = data.instagram || cortesia['instagram'] || '';
  data.profesion = data.profesion || cortesia['profesión'] || cortesia['profesion'] || '';
  data.mensaje = data.mensaje || cortesia['mensaje'] || '';
  data.referencia = 'CORTESIA-' + data.codigo;

  const inicio = new Date(data.isoStart);
  const fin = new Date(data.isoEnd);

  // Doble check Calendar
  const cal = CalendarApp.getCalendarById(CALENDAR_ID);
  const eventos = cal.getEvents(inicio, fin);
  const ocupadoAhora = eventos.some(ev => !ev.isAllDayEvent() && ev.getMyStatus() !== CalendarApp.GuestStatus.NO);
  if (ocupadoAhora) return { success: false, error: 'Este horario fue tomado por otra clienta. Elige otro.' };

  // Crear evento + Meet
  const evento = crearEventoCalendar(inicio, fin, data);

  // Registrar reserva
  registrarReserva(data, inicio, fin, evento);

  // Marcar código como usado
  marcarCodigoComoUsado(cortesia.fila);

  // Enviar emails + Telegram
  enviarEmailClienta(data, inicio, evento);
  const pagoFake = { monto: ASESORIA_AMOUNT_CENTS / 100, referencia: data.referencia };
  notificarJoakoNuevaReserva(data, inicio, evento, pagoFake);

  return {
    success: true,
    fecha: formatearFecha(inicio),
    hora: formatearHora(Utilities.formatDate(inicio, TZ, 'HH:mm')),
    meetLink: evento.meetLink,
    eventoId: evento.id
  };
}

function marcarCodigoComoUsado(filaIdx) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA_CORTESIA);
    if (!sheet) return;
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).toLowerCase().trim());
    const colUsado = headers.indexOf('usado');
    const colFecha = headers.indexOf('fecha uso');
    if (colUsado >= 0) sheet.getRange(filaIdx, colUsado + 1).setValue('Sí');
    if (colFecha >= 0) sheet.getRange(filaIdx, colFecha + 1).setValue(new Date());
    sheet.getRange(filaIdx, 1, 1, sheet.getLastColumn()).setBackground('#C8E6C9');
  } catch (e) {
    Logger.log('marcarCodigoComoUsado error: ' + e);
  }
}

function buscarLeadPorReferencia(referencia) {
  // Busca el último lead pre-pago guardado con esa referencia.
  // Sirve para recuperar nombre/email/IG si el sessionStorage del cliente se perdió.
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Leads Asesoría MPV');
    if (!sheet) return null;
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return null;
    const headers = data[0].map(h => String(h));
    const refCol = headers.indexOf('referencia');
    if (refCol === -1) return null;
    // Iterar de abajo hacia arriba para tomar el registro más reciente
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][refCol]) === String(referencia)) {
        const result = {};
        headers.forEach((h, j) => { result[h] = data[i][j]; });
        return result;
      }
    }
    return null;
  } catch (e) {
    Logger.log('buscarLeadPorReferencia error: ' + e);
    return null;
  }
}

function reservaExiste(inicio) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(HOJA_RESERVAS);
    if (!sheet) return false;
    const data = sheet.getDataRange().getValues();
    const isoBuscado = inicio.toISOString();
    for (let i = 1; i < data.length; i++) {
      if (data[i][3] && new Date(data[i][3]).toISOString() === isoBuscado) {
        if (data[i][8] === 'Confirmada') return true;
      }
    }
    return false;
  } catch (e) {
    Logger.log('reservaExiste error: ' + e);
    return false;
  }
}

function formatearFecha(d) {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return dias[d.getDay()] + ' ' + d.getDate() + ' de ' + meses[d.getMonth()];
}

function formatearHora(hora24) {
  const [h, m] = hora24.split(':').map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'am' : 'pm';
  const mStr = m === 0 ? '' : ':' + (m < 10 ? '0' + m : m);
  return h12 + mStr + ' ' + ampm;
}

// =====================================================
// AGENDAMIENTO — VERIFICACIÓN DE PAGO WOMPI
// =====================================================

function verificarPago(referencia, transactionId) {
  if (!referencia && !transactionId) return { success: false, error: 'Sin referencia ni id' };
  try {
    let trans = null;

    // Si llegó id de Wompi, lo usamos directo (caso después del redirect del widget)
    if (transactionId) {
      const resp = UrlFetchApp.fetch(WOMPI_API + '/transactions/' + encodeURIComponent(transactionId), { muteHttpExceptions: true });
      if (resp.getResponseCode() === 200) trans = JSON.parse(resp.getContentText()).data;
    }

    // Si no se encontró por id, buscamos por referencia
    if (!trans && referencia) {
      const resp = UrlFetchApp.fetch(WOMPI_API + '/transactions?reference=' + encodeURIComponent(referencia), { muteHttpExceptions: true });
      if (resp.getResponseCode() === 200) trans = (JSON.parse(resp.getContentText()).data || [])[0];
    }

    if (!trans) return { success: false, error: 'Transacción no encontrada' };

    return {
      success: true,
      aprobada: trans.status === 'APPROVED',
      status: trans.status,
      monto: trans.amount_in_cents / 100,
      referencia: trans.reference,
      id: trans.id,
      email: trans.customer_email
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// =====================================================
// AGENDAMIENTO — CREAR RESERVA
// =====================================================

function crearReserva(data) {
  // data: { referencia, transactionId, isoStart, isoEnd, nombre, whatsapp, email, instagram, profesion, mensaje }
  if ((!data.referencia && !data.transactionId) || !data.isoStart) return { success: false, error: 'Datos incompletos' };

  // Verificar que el pago esté aprobado (acepta referencia o id de Wompi)
  const pago = verificarPago(data.referencia, data.transactionId);
  if (!pago.success || !pago.aprobada) {
    return { success: false, error: 'Pago no aprobado: ' + (pago.status || pago.error) };
  }

  // Si la referencia no llegó, usar la que devuelve Wompi
  if (!data.referencia && pago.referencia) data.referencia = pago.referencia;

  // RESCATE DE DATOS: si el sessionStorage se perdió en el redirect a Wompi y los datos
  // de la clienta no llegan, los buscamos en la hoja Leads Asesoría MPV por referencia.
  if (!data.nombre && data.referencia) {
    const lead = buscarLeadPorReferencia(data.referencia);
    if (lead) {
      data.nombre = data.nombre || lead.nombre;
      data.email = data.email || lead.email;
      data.whatsapp = data.whatsapp || lead.whatsapp;
      data.instagram = data.instagram || lead.instagram;
      data.profesion = data.profesion || lead.profesion;
      data.situacion = data.situacion || lead.situacion;
      data.mensaje = data.mensaje || lead.mensaje;
    }
  }

  // Si tampoco hay email pero Wompi sí tiene, lo usamos
  if (!data.email && pago.email) data.email = pago.email;

  const inicio = new Date(data.isoStart);
  const fin = new Date(data.isoEnd);

  // Doble check con Calendar (única fuente de verdad)
  const calCheck = CalendarApp.getCalendarById(CALENDAR_ID);
  const eventosEnFranja = calCheck.getEvents(inicio, fin);
  const ocupadoAhora = eventosEnFranja.some(ev => !ev.isAllDayEvent() && ev.getMyStatus() !== CalendarApp.GuestStatus.NO);
  if (ocupadoAhora) {
    return { success: false, error: 'Este horario fue tomado por otra clienta. Elige otro.' };
  }

  // Crear evento en Calendar con Meet
  const evento = crearEventoCalendar(inicio, fin, data);

  // Registrar reserva en Sheet
  registrarReserva(data, inicio, fin, evento);

  // Enviar email a la clienta
  enviarEmailClienta(data, inicio, evento);

  // Notificar a Joako: email + Telegram
  notificarJoakoNuevaReserva(data, inicio, evento, pago);

  return {
    success: true,
    fecha: formatearFecha(inicio),
    hora: formatearHora(Utilities.formatDate(inicio, TZ, 'HH:mm')),
    meetLink: evento.meetLink,
    eventoId: evento.id
  };
}

function crearEventoCalendar(inicio, fin, data) {
  // Usa Calendar Advanced Service para incluir Meet automáticamente
  const nombre = data.nombre || 'Clienta';
  const titulo = '🎯 Asesoría MPV · ' + nombre;
  const descripcion = construirDescripcionEvento(data);

  const recurso = {
    summary: titulo,
    description: descripcion,
    start: { dateTime: inicio.toISOString(), timeZone: TZ },
    end: { dateTime: fin.toISOString(), timeZone: TZ },
    attendees: data.email ? [{ email: data.email }] : [],
    conferenceData: {
      createRequest: {
        requestId: 'mpv-' + new Date().getTime() + '-' + Math.random().toString(36).slice(2, 8),
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 * 24 },
        { method: 'popup', minutes: 30 }
      ]
    }
  };

  const evento = Calendar.Events.insert(recurso, CALENDAR_ID, {
    conferenceDataVersion: 1,
    sendUpdates: 'all'
  });

  const meetLink = (evento.conferenceData && evento.conferenceData.entryPoints || [])
    .filter(ep => ep.entryPointType === 'video')
    .map(ep => ep.uri)[0] || '';

  return { id: evento.id, htmlLink: evento.htmlLink, meetLink: meetLink };
}

function construirDescripcionEvento(data) {
  let d = 'Asesoría MPV con ' + (data.nombre || '—') + '\n\n';
  d += 'WhatsApp: ' + (data.whatsapp || '—') + '\n';
  d += 'Email: ' + (data.email || '—') + '\n';
  d += 'Instagram: ' + (data.instagram || '—') + '\n';
  d += 'Profesión: ' + (data.profesion || '—') + '\n';
  if (data.situacion) d += 'Situación: ' + data.situacion + '\n';
  if (data.mensaje) d += '\nLo que quiere resolver:\n' + data.mensaje + '\n';
  d += '\nReferencia pago: ' + (data.referencia || '—') + '\n';
  return d;
}

function registrarReserva(data, inicio, fin, evento) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(HOJA_RESERVAS);
  if (!sheet) {
    sheet = ss.insertSheet(HOJA_RESERVAS);
    const headers = ['Creada', 'Nombre', 'Email', 'Inicio', 'Fin', 'WhatsApp', 'Instagram', 'Profesión', 'Estado', 'Referencia Pago', 'Meet Link', 'Evento ID', 'Mensaje'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#21209C').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    new Date(),
    data.nombre || '',
    data.email || '',
    inicio,
    fin,
    data.whatsapp || '',
    data.instagram || '',
    data.profesion || '',
    'Confirmada',
    data.referencia || '',
    evento.meetLink || '',
    evento.id || '',
    data.mensaje || ''
  ]);
}

function enviarEmailClienta(data, inicio, evento) {
  if (!data.email) return;
  const fechaStr = formatearFecha(inicio) + ' a las ' + formatearHora(Utilities.formatDate(inicio, TZ, 'HH:mm'));
  const asunto = '✅ Tu Asesoría MPV está confirmada · ' + fechaStr;
  let cuerpo = 'Hola ' + (data.nombre || '') + ',\n\n';
  cuerpo += 'Tu Asesoría MPV con Joako Estratega está confirmada.\n\n';
  cuerpo += 'CUÁNDO: ' + fechaStr + ' (hora Colombia)\n';
  cuerpo += 'DURACIÓN: 90 minutos\n';
  cuerpo += 'DÓNDE: ' + (evento.meetLink || '(link Meet en el correo de invitación)') + '\n\n';
  cuerpo += 'La invitación de Google Calendar te llega por separado. Acéptala para que te aparezca en tu agenda.\n\n';
  cuerpo += 'Antes de la sesión: prepara una hoja con las dudas más urgentes de tu negocio. Vamos a aprovechar los 90 minutos al máximo.\n\n';
  cuerpo += 'Si necesitas reagendar o cancelar, responde este correo con al menos 24 horas de anticipación.\n\n';
  cuerpo += '— Joako Estratega\nhttps://joakoestratega.com';
  GmailApp.sendEmail(data.email, asunto, cuerpo, { name: 'Joako Estratega' });
}

function notificarJoakoNuevaReserva(data, inicio, evento, pago) {
  const fechaStr = formatearFecha(inicio) + ' a las ' + formatearHora(Utilities.formatDate(inicio, TZ, 'HH:mm'));

  // Email
  let cuerpo = '✅ NUEVA ASESORÍA AGENDADA\n\n';
  cuerpo += 'CUÁNDO: ' + fechaStr + '\n\n';
  cuerpo += '─── DATOS ───\n';
  cuerpo += 'Nombre: ' + (data.nombre || '—') + '\n';
  cuerpo += 'WhatsApp: ' + (data.whatsapp || '—') + '\n';
  cuerpo += 'Email: ' + (data.email || '—') + '\n';
  cuerpo += 'Instagram: ' + (data.instagram || '—') + '\n';
  cuerpo += 'Profesión: ' + (data.profesion || '—') + '\n';
  if (data.situacion) cuerpo += 'Situación: ' + data.situacion + '\n';
  if (data.mensaje) cuerpo += '\nLo que quiere resolver:\n' + data.mensaje + '\n';
  cuerpo += '\n─── PAGO ───\n';
  cuerpo += 'Monto: $' + (pago.monto || 0).toLocaleString('es-CO') + ' COP\n';
  cuerpo += 'Referencia: ' + (pago.referencia || '—') + '\n';
  cuerpo += '\nMeet: ' + (evento.meetLink || '—') + '\n';
  GmailApp.sendEmail(EMAIL_NOTIFICACION, '✅ Asesoría agendada: ' + (data.nombre || '') + ' · ' + fechaStr, cuerpo);

  // Telegram
  let tg = '✅ *Nueva Asesoría agendada*\n\n';
  tg += '🗓 ' + fechaStr + '\n\n';
  tg += '👤 ' + (data.nombre || '—') + '\n';
  tg += '📱 ' + (data.whatsapp || '—') + '\n';
  tg += '📧 ' + (data.email || '—') + '\n';
  tg += '📸 IG: ' + (data.instagram || '—') + '\n';
  tg += '💼 ' + (data.profesion || '—') + '\n';
  if (data.mensaje) tg += '\n💬 ' + data.mensaje.substring(0, 200) + '\n';
  tg += '\n💰 $' + (pago.monto || 0).toLocaleString('es-CO') + ' COP\n';
  if (evento.meetLink) tg += '\n🎥 ' + evento.meetLink;
  enviarTelegram(tg);
}

// =====================================================
// TELEGRAM
// =====================================================

function enviarTelegram(mensaje) {
  try {
    const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
    UrlFetchApp.fetch(url, {
      method: 'post',
      payload: {
        chat_id: TELEGRAM_CHAT_ID,
        text: mensaje,
        parse_mode: 'Markdown'
      },
      muteHttpExceptions: true
    });
  } catch (e) {
    Logger.log('Telegram error: ' + e);
  }
}

// =====================================================
// WEBHOOK WOMPI (opcional, para confirmar pagos)
// =====================================================

function procesarWebhookWompi(data) {
  try {
    const trans = data.data && data.data.transaction;
    if (!trans) return { success: false };

    // Log de cada cambio de transacción
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName('Webhook Wompi');
    if (!sheet) {
      sheet = ss.insertSheet('Webhook Wompi');
      sheet.appendRow(['Fecha', 'Referencia', 'Estado', 'Monto', 'ID Wompi', 'Email']);
      sheet.getRange(1, 1, 1, 6).setBackground('#21209C').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      new Date(),
      trans.reference || '',
      trans.status || '',
      (trans.amount_in_cents || 0) / 100,
      trans.id || '',
      trans.customer_email || ''
    ]);

    return { success: true };
  } catch (e) {
    Logger.log('Webhook Wompi error: ' + e);
    return { success: false, error: e.toString() };
  }
}

// =====================================================
// ERRORES
// =====================================================

function notificarError(error, e) {
  try {
    GmailApp.sendEmail(
      EMAIL_NOTIFICACION,
      '⚠️ Error en Apps Script',
      'Error:\n\n' + error.toString() + '\n\nStack:\n' + (error.stack || '') +
      '\n\nPayload:\n' + (e && e.postData ? e.postData.contents : 'sin datos')
    );
  } catch (e2) {}
}
