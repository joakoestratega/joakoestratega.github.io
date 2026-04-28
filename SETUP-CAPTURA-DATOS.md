# Setup de captura de datos · Google Apps Script + Sheets

Sistema propio de captura de leads para tus landings. Sin servicios externos, gratis para siempre, datos en tu propia cuenta Google.

---

## Cómo funciona

```
1. Usuario llena formulario en la landing
        ↓
2. JavaScript envía datos a tu Google Apps Script
        ↓
3. Apps Script guarda los datos en tu Google Sheets
        ↓
4. Te llega email automático con cada lead nuevo
        ↓
5. Usuario es redirigido a Wompi para pagar
        ↓
6. Cruzas la lista de leads con los pagos de Wompi
```

---

## Setup paso a paso (30 minutos, una sola vez)

### Paso 1. Crear la Google Sheets

1. Ve a https://sheets.google.com
2. Click en **"+ En blanco"** para crear una nueva
3. Renómbrala: `Leads Joako Estratega`
4. Mira la URL del navegador. Va a verse así:
   ```
   https://docs.google.com/spreadsheets/d/AQUÍ_VA_EL_ID/edit
   ```
5. **Copia el ID** (la parte entre `/d/` y `/edit`). Lo necesitas en el siguiente paso.

### Paso 2. Crear el Apps Script

1. En tu Google Sheets, click en **Extensiones → Apps Script**
2. Se abre un editor de código en una pestaña nueva
3. Borra todo el código que aparece por default
4. Abre el archivo `apps-script.gs` que está en esta carpeta
5. **Copia TODO el contenido** y pégalo en el editor de Apps Script
6. Reemplaza estas líneas al inicio con tus datos:
   ```javascript
   const SHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEETS';
   const NOMBRE_HOJA = 'Leads Bootcamp Claude';
   const EMAIL_NOTIFICACION = 'joakoestratega@gmail.com';
   ```
   - `SHEET_ID`: el ID que copiaste en el Paso 1
   - `NOMBRE_HOJA`: déjalo así o ponle otro nombre (será el nombre de la pestaña dentro de tu Sheets)
   - `EMAIL_NOTIFICACION`: tu email donde quieres recibir notificación de cada lead
7. Guarda con **Ctrl + S** y dale nombre al proyecto: `Captura Joako`

### Paso 3. Desplegar como Web App

1. Click arriba a la derecha en **"Implementar" → "Nueva implementación"**
2. Click en el ícono de engranaje ⚙️ y selecciona **"Aplicación web"**
3. Configura:
   - **Descripción:** "Captura de leads landings"
   - **Ejecutar como:** Yo (tu correo)
   - **Quién tiene acceso:** **Cualquier persona** (esto es necesario para que la landing pueda enviar datos)
4. Click en **"Implementar"**
5. La primera vez te pedirá autorización. Click en **"Autorizar acceso"**
6. Selecciona tu cuenta Google
7. Si te aparece "Esta app no está verificada", click en **"Avanzado"** → **"Ir a Captura Joako (no seguro)"**. Es seguro porque tú lo creaste.
8. Click en **"Permitir"**
9. Te aparece una URL al final. **Copia la URL de la Web app**. Va a verse así:
   ```
   https://script.google.com/macros/s/AQUI_VA_LARGA_CADENA/exec
   ```
10. Guárdala, la necesitas en el siguiente paso.

### Paso 4. Pegar la URL en tu HTML

1. Abre `bootcamp-claude/index.html` con un editor (VSCode, Bloc de notas)
2. Busca la línea:
   ```javascript
   const APPS_SCRIPT_URL = 'PEGA_AQUI_LA_URL_DEL_APPS_SCRIPT';
   ```
3. Reemplaza `PEGA_AQUI_LA_URL_DEL_APPS_SCRIPT` con la URL real que copiaste
4. Busca también:
   ```javascript
   const LINK_PAGO_WOMPI = '{{LINK_WOMPI}}';
   ```
5. Reemplaza `{{LINK_WOMPI}}` con tu link real de Wompi cuando lo crees
6. Guarda el archivo y súbelo a GitHub

### Paso 5. Probar el flujo

1. Entra a `https://joakoestratega.com/bootcamp-claude/`
2. Click en cualquier botón "Aplicar para mi cupo"
3. Llena el formulario con datos de prueba
4. Click en **Quiero mi cupo**
5. Verifica que:
   - Aparece pantalla de éxito
   - Te llega email de notificación
   - Aparece una nueva fila en tu Google Sheets
   - Te redirige al link de Wompi

Si todo funciona, **estás listo para vender.**

---

## Cómo trabajas con los datos

### Tu Google Sheets es tu CRM

Cada vez que alguien aplica, aparece una fila nueva con:

| Fecha | Nombre | WhatsApp | Email | Negocio | Reqs | Producto | Estado |
|-------|--------|----------|-------|---------|------|----------|--------|

**Estados que tú vas actualizando:**
- `Aplicó` (lo pone el sistema automáticamente)
- `Pagado` (lo pones tú cuando ves el pago en Wompi)
- `No respondió` (tras 72h sin respuesta)
- `Rechazado` (no cumple requisitos importantes)

### Cruzar con Wompi

1. Cada día revisas tu dashboard de Wompi
2. Cada pago aprobado, lo marcas como "Pagado" en tu Sheets
3. Los que aplicaron pero NO pagaron en 24h → les escribes por WhatsApp manualmente
4. Esos son tus leads más calientes para cierre personal

---

## Si algo falla

### "No me llegó email pero sí veo la fila en Sheets"
Solución: ve al editor de Apps Script, click en **"Ejecuciones"** (menú izquierdo). Verás errores si los hay. Posiblemente toca dar permiso a Gmail.

### "El formulario dice 'Hubo un problema'"
Solución 1: verifica que `APPS_SCRIPT_URL` en el HTML está correctamente pegada (sin espacios, sin comillas extra).
Solución 2: re-implementa el Apps Script (Implementar → Implementaciones de prueba → Nueva implementación).

### "Quiero cambiar algo del email"
Edita el cuerpo del email dentro del Apps Script (en la variable `cuerpo`). Cambia lo que quieras y guarda. **Importante:** después de cambiar el código, debes hacer **"Implementar → Administrar implementaciones → Editar (lápiz) → Versión nueva"**. Sin esto, los cambios no se aplican.

---

## Reutilizar para otras landings (estándar Joako)

Esta misma solución sirve para cualquier landing futura:
- Bootcamp Meta Ads
- Implementación personalizada
- Mentoría
- Eventos
- Lead magnets

Solo cambias estos 3 valores en el Apps Script:
```javascript
const NOMBRE_HOJA = 'Leads [Producto]';
const EMAIL_NOTIFICACION = 'joakoestratega@gmail.com';
```

Y opcionalmente, todas las landings pueden apuntar al **mismo SHEET_ID**, con cada una guardando en su propia hoja (pestaña). Así tienes un solo Google Sheets con varias pestañas:
- Hoja 1: Leads Bootcamp Claude
- Hoja 2: Leads Bootcamp Meta
- Hoja 3: Leads Implementación
- ...

---

## Para el agente creador de landings (futuro)

Este flujo queda como **estándar oficial** para cualquier landing que se genere con el agente creador de landings:

1. Cada landing nueva incluye automáticamente este sistema de captura
2. El agente debe pedir el SHEET_ID al usuario al crear la landing
3. El agente debe pedir el nombre del producto para `NOMBRE_HOJA`
4. El agente integra el código JS al HTML automáticamente

Esto se documentará formalmente cuando creemos el agente.

---

*Sistema estable, gratis, sin dependencias externas. Tu sistema, tus datos, tu control.*
