// =====================================================
// CAPTURA DE DATOS — JOAKO ESTRATEGA (multi-producto)
// =====================================================
// Un solo Apps Script desplegado como Web App que recibe
// datos de TODAS las landings (Bootcamp Claude, Bootcamp
// Meta Ads waitlist, Aplicación Agencia, futuros productos).
//
// Crea automáticamente una hoja por producto y guarda los
// campos que cada formulario envíe.
//
// Para implementar:
// 1. Abre script.google.com → Nuevo proyecto
// 2. Pega este código completo
// 3. Configura las 2 constantes de abajo (SHEET_ID, EMAIL_NOTIFICACION)
// 4. Despliega → Implementar → Nueva implementación → Tipo: Aplicación web
//    - Ejecutar como: Yo (tu cuenta)
//    - Tener acceso: Cualquier persona
// 5. Copia el URL "/exec" y pégalo en cada index.html donde dice
//    PEGA_AQUI_EL_URL_DE_TU_APPS_SCRIPT
// =====================================================

// CONFIGURACIÓN — Cambia estos valores antes de implementar
const SHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEETS';
const EMAIL_NOTIFICACION = 'joakoestratega@gmail.com';

// Mapa producto → nombre de hoja en Google Sheets
const HOJAS_POR_PRODUCTO = {
  'Bootcamp Claude': 'Leads Bootcamp Claude',
  'Bootcamp Meta Ads (Waitlist)': 'Lista Espera Meta Ads',
  'Aplicación Agencia': 'Aplicaciones Agencia',
  'default': 'Leads Generales'
};

// =====================================================
// NO TOQUES NADA DE AQUÍ HACIA ABAJO
// =====================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const producto = data.producto || 'default';
    const nombreHoja = HOJAS_POR_PRODUCTO[producto] || HOJAS_POR_PRODUCTO['default'];
    const estadoLead = data.estado || 'Aplicó';
    const esParcial = estadoLead === 'Lead parcial';

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(nombreHoja);

    // Si la hoja no existe, la crea con headers dinámicos según el payload
    if (!sheet) {
      sheet = ss.insertSheet(nombreHoja);
      const headers = ['Fecha', ...Object.keys(data).filter(k => k !== 'estado'), 'Estado'];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#21209C')
        .setFontColor('#FFFFFF')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Lee los headers actuales y construye la fila respetando ese orden
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const fila = headers.map(header => {
      if (header === 'Fecha') return new Date();
      if (header === 'Estado') return estadoLead;
      return data[header] !== undefined ? data[header] : '';
    });

    // Si llegan campos nuevos que no están en headers, los agregamos al final
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

    // Pintar la fila si es lead parcial (amarillo claro) para distinguirla en la hoja
    if (esParcial) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).setBackground('#FFF4CC');
    }

    // Email solo para leads completos. Los parciales se acumulan en la hoja sin spamear.
    if (!esParcial) {
      const asunto = `🔥 Nuevo lead: ${producto}`;
      const cuerpo = construirCuerpoEmail(data, producto);
      GmailApp.sendEmail(EMAIL_NOTIFICACION, asunto, cuerpo);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Lead guardado en ' + nombreHoja }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    try {
      GmailApp.sendEmail(
        EMAIL_NOTIFICACION,
        '⚠️ Error en captura de leads',
        'Hubo un error procesando un formulario:\n\n' + error.toString() + '\n\nDatos recibidos:\n' + (e && e.postData ? e.postData.contents : 'sin datos')
      );
    } catch (e2) {}

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function construirCuerpoEmail(data, producto) {
  let cuerpo = `Tienes un nuevo lead.\n\n`;
  cuerpo += `PRODUCTO: ${producto}\n`;
  cuerpo += `FECHA: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n`;
  cuerpo += `─────────────────────\n\n`;

  // Campos comunes primero (si existen)
  const ordenComun = ['nombre', 'whatsapp', 'email', 'negocio'];
  ordenComun.forEach(campo => {
    if (data[campo]) {
      const label = campo.charAt(0).toUpperCase() + campo.slice(1);
      cuerpo += `${label}: ${data[campo]}\n`;
    }
  });

  cuerpo += `\n─────────────────────\nDETALLES ADICIONALES\n─────────────────────\n`;

  Object.keys(data).forEach(campo => {
    if (ordenComun.includes(campo)) return;
    if (campo === 'producto' || campo === 'origen') return;
    const label = campo.charAt(0).toUpperCase() + campo.slice(1).replace(/_/g, ' ');
    cuerpo += `${label}: ${data[campo]}\n`;
  });

  if (data.origen) {
    cuerpo += `\n─────────────────────\nURL DE ORIGEN: ${data.origen}\n`;
  }

  cuerpo += `\nAcción siguiente: revisa la hoja "${HOJAS_POR_PRODUCTO[producto] || HOJAS_POR_PRODUCTO['default']}" en tu Google Sheets y contáctalo por WhatsApp.`;

  return cuerpo;
}

// Función opcional para probar que el script funciona
function doGet() {
  return ContentService
    .createTextOutput('Apps Script Joako Estratega · funcionando ✓ · multi-producto v2')
    .setMimeType(ContentService.MimeType.TEXT);
}