# Setup de captura de datos · Google Apps Script + Sheets

Sistema propio de captura de leads para las 4 landings. Sin servicios externos, gratis para siempre, datos en tu propia cuenta Google. Una sola configuración sirve para todos los formularios.

---

## Cómo funciona

```
1. Visitante llena formulario en la landing
        ↓
2. main.js envía los datos a tu Apps Script (en background, sin recargar)
        ↓
3. Apps Script identifica el producto y lo guarda en la hoja correcta
        ↓
4. Te llega email automático con cada lead nuevo (excepto leads parciales)
        ↓
5. Visitante es redirigido a la página de gracias correspondiente
        ↓
6. Página de gracias dispara el evento de conversión en GA4 / Meta Pixel
```

---

## Hojas que se crean automáticamente

El Apps Script crea una hoja distinta por producto, sin que tengas que tocar nada. La estructura final:

| Producto | Hoja en Sheets | Campos |
|---|---|---|
| Plano MPV ($50 USD) | `Leads Plano MPV` | nombre, whatsapp, email, profesión, situación, mensaje |
| Comunidad WhatsApp (gratis) | `Leads Comunidad` | nombre, whatsapp, profesión |
| Newsletter Método MPV | `Leads Método MPV` | nombre, email, profesión |
| Contacto desde Home | `Contactos Home` | (lo que llegue) |
| Cualquier otro | `Leads Generales` | (lo que llegue) |

Además, los **leads parciales** (visitas que llenaron nombre + WhatsApp/email pero NO enviaron) quedan registrados con fila pintada de amarillo. Eso te permite recuperar gente que se fue a mitad del formulario.

---

## Setup paso a paso (15 minutos, una sola vez)

### Paso 1. Crear la Google Sheets

1. Ve a [sheets.google.com](https://sheets.google.com).
2. Click en **+ En blanco**.
3. Renombra: `Leads Joako Estratega`.
4. Mira la URL: `https://docs.google.com/spreadsheets/d/AQUÍ_VA_EL_ID/edit`
5. **Copia el ID** (parte entre `/d/` y `/edit`). Lo usas en el paso siguiente.

### Paso 2. Crear el Apps Script

1. En tu Sheets: **Extensiones → Apps Script**.
2. Borra el código que aparece por defecto.
3. Abre el archivo `apps-script.gs` de esta carpeta.
4. Copia TODO el contenido y pégalo en el editor.
5. Edita las primeras líneas con tus datos:
   ```javascript
   const SHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEETS';
   const EMAIL_NOTIFICACION = 'joakoestratega@gmail.com';
   ```
6. **Guardar** (Ctrl/Cmd + S). Ponle nombre al proyecto: `Captura Joako Estratega`.

### Paso 3. Implementar como Web App

1. Click en **Implementar → Nueva implementación** (arriba a la derecha).
2. Click en el ícono ⚙ de tipo → **Aplicación web**.
3. Configuración:
   - **Descripción:** `Captura leads v2 multi-producto`.
   - **Ejecutar como:** `Yo (tu correo)`.
   - **Tener acceso:** `Cualquier persona`.
4. Click **Implementar**.
5. La primera vez te pide autorizar permisos: acepta y continúa con tu cuenta.
6. Te aparece un URL que termina en `/exec`. **Cópialo, lo usas en el paso 4.**

> **IMPORTANTE.** Si después editas el código, debes hacer **Implementar → Administrar implementaciones → ⚙ → Nueva versión** para que los cambios apliquen. Si haces "Nueva implementación" en lugar de "Nueva versión", se genera un URL nuevo y los formularios dejan de funcionar hasta que actualices el URL en las landings.

### Paso 4. Pegar el URL en las landings

En 6 archivos hay que reemplazar `PEGA_AQUI_EL_URL_DE_TU_APPS_SCRIPT` por el URL `/exec` que copiaste:

- `index.html`
- `plano-mpv/index.html`
- `plano-mpv/gracias/index.html`
- `comunidad/index.html`
- `comunidad/gracias/index.html`
- `metodo-mpv/index.html`

Es siempre el mismo bloque:

```html
<script>
  window.JOAKO = {
    APPS_SCRIPT_URL: 'PEGA_AQUI_EL_URL_DE_TU_APPS_SCRIPT', // ← cambia esto
    ...
  };
</script>
```

### Paso 5. Probar

1. Abre tu sitio en GitHub Pages (o sirve la carpeta local con `python -m http.server`).
2. Llena el formulario de Comunidad (es el más simple) con tus propios datos.
3. Verifica que:
   - Te llega email a `joakoestratega@gmail.com`.
   - Aparece la fila en la hoja `Leads Comunidad` de tu Sheets.
   - Te redirige a `/comunidad/gracias/`.

Si algo falla, abre la consola del navegador (F12) y mira el error. Lo más común:
- URL mal pegado (debe terminar en `/exec`).
- Olvidaste implementar como Web App (paso 3).
- Permisos no aceptados.

---

## Cómo agregar un producto nuevo después

Si más adelante creas un nuevo formulario (ej: para vender el Constructor MPV con su propia landing), solo tienes que:

1. En tu landing nueva, ponle al `<form>` el atributo `data-form="Nombre del Producto"`.
2. En `apps-script.gs`, agrega una entrada al objeto `HOJAS_POR_PRODUCTO`:
   ```javascript
   const HOJAS_POR_PRODUCTO = {
     'Plano MPV': 'Leads Plano MPV',
     'Comunidad WhatsApp': 'Leads Comunidad',
     'Newsletter Método MPV': 'Leads Método MPV',
     'Contacto Home': 'Contactos Home',
     'Constructor MPV': 'Leads Constructor',  // ← nuevo
     'default': 'Leads Generales'
   };
   ```
3. **Implementar → Administrar implementaciones → Nueva versión.**

La hoja se crea sola la primera vez que llega un lead.

---

## Notas técnicas

- **Por qué `mode: 'no-cors'` en el fetch.** Apps Script en modo Web App no soporta CORS preflight. La respuesta no se puede leer desde el navegador, pero el envío sí pasa. Por eso usamos las páginas de `gracias/` para confirmar al usuario que llegó.
- **Por qué leads parciales.** Si alguien empieza a llenar y se va, perdemos el lead a menos que lo capturemos al instante. El sistema dispara el envío parcial cuando hay nombre + WhatsApp/email aunque la persona no haya hecho click en enviar.
- **Por qué hojas separadas.** Más fácil filtrar y segmentar después por producto. Si quieres ver todos los leads juntos, usa una vista o `=QUERY()` en una hoja resumen.
- **Backup.** Cada noche Google hace backup automático de tu Sheets. También puedes Archivo → Crear copia para tener una manual.

---

*Sistema definido: 2026-05-11. Compatible con todas las landings v1 mayo 2026.*