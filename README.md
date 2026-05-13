# Sitio Joako Estratega · joakoestratega.com

Sistema de 4 páginas conectadas, listas para subir a GitHub Pages. Construidas sobre el modelo nuevo (mayo 2026): mujeres con servicio profesional propio (abogadas, psicólogas, coaches, terapeutas, consultoras) · escalera Plano MPV · Constructor MPV · MPV en Operación · más comunidad de WhatsApp gratuita como puerta de entrada.

---

## Estructura del sitio

```
LANDINGS/                              ← esto es lo que subes a GitHub Pages
│
├── CNAME                              ← joakoestratega.com (vincula dominio)
├── index.html                         ← HOME institucional
├── sitemap.xml                        ← para Google + GEO
├── robots.txt                         ← reglas de indexación
├── apps-script.gs                     ← captura de leads multi-producto
├── SETUP-CAPTURA-DATOS.md             ← guía Apps Script + Sheets
├── README.md                          ← este archivo
│
├── assets/
│   ├── styles.css                     ← sistema de diseño compartido
│   └── main.js                        ← analytics + form handlers
│
├── imagenes/
│   ├── logos/                         ← 7 logos de validación pública
│   ├── validacion/                    ← 8 fotos profesionales (.jpg + .webp)
│   └── testimonios/                   ← (vacía, por llenar con capturas)
│
├── plano-mpv/
│   ├── index.html                     ← landing del producto $50 USD (la crítica)
│   └── gracias/index.html
│
├── comunidad/
│   ├── index.html                     ← lead magnet WhatsApp gratis
│   └── gracias/index.html
│
├── metodo-mpv/
│   └── index.html                     ← autoridad SEO + GEO + newsletter
│
└── _archivo-modelo-viejo-2026-04/     ← landings anteriores (no se publican)
```

---

## URLs públicas finales

| URL | Función |
|---|---|
| `https://joakoestratega.com/` | Home institucional. Presenta a Joako, escalera de productos, Método MPV resumido, validación. CTA principal: Plano MPV |
| `https://joakoestratega.com/plano-mpv/` | Landing de venta del producto $50 USD. La página que más debe convertir |
| `https://joakoestratega.com/comunidad/` | Lead magnet del grupo de WhatsApp gratis |
| `https://joakoestratega.com/metodo-mpv/` | Pilar de autoridad: explica las 4 condiciones del Método MPV. Captura email para newsletter mensual |

Páginas de gracias (no indexables): `/plano-mpv/gracias/`, `/comunidad/gracias/`.

---

## Pendientes ANTES de publicar

### 1. Apps Script (captura de leads)

Sin este paso, los formularios no guardan datos.

1. Crea un Google Sheets nuevo (o usa el del bootcamp viejo). Copia su ID (la parte larga del URL).
2. Abre `apps-script.gs` y reemplaza:
   - `PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEETS` → tu ID real.
   - `joakoestratega@gmail.com` ya está. Cámbialo si quieres recibir alertas en otro correo.
3. Entra a [script.google.com](https://script.google.com) → Nuevo proyecto → pega el código → Guarda.
4. **Implementar → Nueva implementación** → Aplicación web.
   - Ejecutar como: Yo (tu cuenta).
   - Tener acceso: Cualquier persona.
5. Copia el URL que termina en `/exec`.
6. Pega ese URL en los 4 archivos donde dice `PEGA_AQUI_EL_URL_DE_TU_APPS_SCRIPT`:
   - `index.html`
   - `plano-mpv/index.html`
   - `plano-mpv/gracias/index.html`
   - `comunidad/index.html`
   - `comunidad/gracias/index.html`
   - `metodo-mpv/index.html`

   Es el bloque `<script>window.JOAKO = {...}</script>` arriba en cada archivo. Cambia 1 valor en 6 archivos. Tarda 2 minutos.

7. El script crea hojas separadas automáticamente por producto: `Leads Plano MPV`, `Leads Comunidad`, `Leads Método MPV`, `Contactos Home`, `Leads Generales`.

Detalles completos en `SETUP-CAPTURA-DATOS.md`.

### 2. Link del grupo de WhatsApp

En el mismo bloque `window.JOAKO = {...}` de los 6 archivos, reemplaza:
- `WHATSAPP_COMUNIDAD: 'https://chat.whatsapp.com/PEGA_LINK_GRUPO'` → link real del grupo.
- `WHATSAPP_DIRECTO: 'https://wa.me/573XXXXXXXXX'` → tu WhatsApp personal.

### 3. Analytics (opcional pero recomendado)

En el mismo bloque, agrega los IDs cuando los tengas. Si están vacíos, simplemente no se carga ese tracker:

```javascript
GA4_ID: 'G-XXXXXXXXXX',          // Google Analytics 4
META_PIXEL_ID: '1234567890',     // Meta (Facebook) Pixel
CLARITY_ID: 'abcdef1234'         // Microsoft Clarity (mapas de calor + grabaciones)
```

**Stack recomendado (todos gratis):**
- **GA4:** crea propiedad en analytics.google.com → copia ID.
- **Meta Pixel:** Business Manager → Eventos → Crea pixel → copia ID.
- **Clarity:** clarity.microsoft.com → crea proyecto → copia ID.

### 4. Imágenes de testimonios (opcional)

Carpeta `imagenes/testimonios/` está vacía. Cuando tengas capturas de WhatsApp/comentarios reales, súbelas y avísame para conectarlas a las landings.

### 5. Foto profesional del hero (opcional)

Hoy todas las landings usan fotos del banco de validación (tarima EFFIX, conversatorios). Cuando tengas fotos profesionales nuevas tipo "estratega trabajando", podemos cambiar las del hero por algo más cercano a la mujer profesional que te mira a los ojos. Lo puedes ir haciendo después.

---

## Eventos que se trackean automáticamente

Cuando GA4/Meta Pixel/Clarity están configurados, `main.js` dispara estos eventos sin que tengas que tocar nada:

| Evento | Cuándo dispara |
|---|---|
| `cta_click` | Click en cualquier botón con `data-cta="..."` |
| `scroll_depth` | Scroll del 25/50/75/100% de la página |
| `time_on_page` | A los 30s, 60s y 180s en la página |
| `form_start` | Primer click en cualquier campo del formulario |
| `form_complete` | Envío exitoso del formulario |
| `form_abandon` | Cierre de página con formulario tocado pero no enviado |
| `faq_open` | Apertura de cada pregunta del FAQ |
| `video_play` / `video_50` / `video_complete` | Reproducción de videos con `data-video="..."` |
| `lead_complete` | Carga de página de gracias (mejor evento de conversión) |
| Lead parcial automático | Si la usuaria llena nombre + WhatsApp/email pero no envía, el sistema guarda igualmente el dato (en hoja con marca amarilla) |

---

## Cómo publicar en GitHub Pages

### Si el repo ya existe (caso normal — Joako ya tenía joakoestratega.com en GitHub)

**Opción A — GitHub Desktop:**
1. Abre la carpeta local del repo.
2. Borra TODO el contenido viejo (excepto `.git`).
3. Copia el contenido de `LANDINGS/` (no la carpeta — su contenido) al repo.
4. Commit message: `Sitio nuevo · modelo mayo 2026 · 4 landings interconectadas`.
5. Push origin.

**Opción B — Git CLI:**
```bash
cd /ruta/a/repo
rm -rf *
cp -r "ruta/a/LANDINGS/"* .
git add .
git commit -m "Sitio nuevo · modelo mayo 2026 · 4 landings interconectadas"
git push origin main
```

En 1-2 minutos GitHub Pages reconstruye el sitio.

### Si necesitas crear el repo desde cero

1. github.com/new → nombre: `joakoestratega.github.io` (o el que ya tenías) → Public.
2. Sube el contenido de `LANDINGS/`.
3. Settings → Pages → Source: `main` branch, root.
4. Settings → Pages → Custom domain: `joakoestratega.com` → Save → Enforce HTTPS.

DNS Hostinger (si no estaba):

| Tipo | Nombre | Valor | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| CNAME | www | tu-usuario.github.io | 3600 |

---

## Cómo iterar después (CRO)

El sistema está pensado para mejorar a partir de datos:

1. **Semana 1-2 después de publicar:** revisa Microsoft Clarity. Mira las grabaciones de las primeras 50 visitas. Verás dónde la gente se pierde, qué no leen, qué los confunde.
2. **Cada lunes:** abre Google Sheets de leads. ¿Cuántos llenaron formulario? ¿Cuáles parcialmente? ¿De qué hojas vienen?
3. **Cada 2 semanas:** mira en GA4 los eventos `cta_click` agrupados por `cta_id`. Los CTAs con más clicks son los que están funcionando. Los que nadie toca, se cambian o se quitan.
4. **Cuando quieras hacer un cambio fuerte (cambiar headline, cambiar precio, cambiar el orden de las secciones):** primero copia la página actual a `/plano-mpv/v2/` para hacer split test manual con tráfico de pauta dividido 50/50.

Cuando vayas a iterar, avísame y te ayudo con la decisión.

---

## Checklist final antes de promocionar

- [ ] Configuré Apps Script y pegué el URL `/exec` en los 6 archivos.
- [ ] Cambié `WHATSAPP_COMUNIDAD` por el link real del grupo en los 6 archivos.
- [ ] Cambié `WHATSAPP_DIRECTO` por mi número real en los 6 archivos.
- [ ] Subí todo a GitHub.
- [ ] Probé las 4 URLs en el celular y en el computador.
- [ ] Llené yo misma cada formulario para verificar que llega a Google Sheets.
- [ ] Confirmé que el botón "Entrar al grupo" abre el WhatsApp real.
- [ ] (Opcional) Configuré GA4, Meta Pixel y Clarity.
- [ ] (Opcional) Subí 3-6 testimonios a `imagenes/testimonios/`.

---

## Cómo hacer cambios después

Para editar copy, precio, fechas o agregar contenido nuevo, abre el archivo `.html` correspondiente con cualquier editor:

- Edita texto entre etiquetas (no toques las clases CSS ni las etiquetas).
- Guarda → commit → push → 1-2 min y está al aire.

Si el cambio es grande (cambiar arquitectura, agregar página nueva, mover bloques), avísame y lo hago yo.

---

*Sitio creado: 2026-05-11. Versión: v1 modelo mayo 2026.*