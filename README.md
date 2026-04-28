# Sitio Joako Estratega · Carpeta lista para GitHub Pages

Esta carpeta es el sitio completo de **joakoestratega.com**. Contiene la home principal, las 4 sub-páginas de servicios y todo lo necesario para subirlo a GitHub Pages.

---

## Estructura final

```
LANDINGS/  (esto es lo que subes a GitHub)
│
├── CNAME                                 ← Vincula joakoestratega.com con GitHub Pages
├── index.html                            ← HOME nueva: hub de servicios
├── apps-script.gs                        ← Captura de leads multi-producto
├── SETUP-CAPTURA-DATOS.md                ← Guía para configurar Apps Script
├── README.md                             ← Este archivo
│
├── imagenes/
│   └── testimonios/
│       ├── LEEME.txt                     ← Instrucciones para subir testimonios
│       └── test-1.jpg ... test-6.jpg     ← Subir tus capturas de WhatsApp
│
├── comunidad/                            ← Sub-página comunidad gratuita
│   └── index.html                        ← Va directo al WhatsApp del grupo
│
├── bootcamp-claude/                      ← Bootcamp Claude (ya existente)
│   ├── index.html
│   ├── imagenes/   (logos, joako-effi, claude-corriendo, parrilla-demo)
│   ├── videos/
│   └── gracias/
│
├── bootcamp-meta-ads/                    ← Bootcamp Meta Ads (NUEVO)
│   └── index.html                        ← Con formulario de waitlist
│
└── agencia/                              ← Agencia (NUEVO)
    └── index.html                        ← Con formulario de aplicación
```

---

## URLs que vas a tener al aire

| URL pública | Qué muestra |
|-------------|-------------|
| https://joakoestratega.com | **Home nueva** con los 4 servicios |
| https://joakoestratega.com/comunidad | Sub-página de la comunidad gratuita (CTA al WhatsApp) |
| https://joakoestratega.com/bootcamp-claude | Landing del bootcamp Claude (ya existente) |
| https://joakoestratega.com/bootcamp-meta-ads | Landing del bootcamp Meta Ads + waitlist |
| https://joakoestratega.com/agencia | Página de la agencia + formulario de aplicación |

---

## QUÉ FALTA HACER ANTES DE SUBIR

### 1. Subir testimonios

Carpeta: `imagenes/testimonios/`

Sube de 1 a 6 capturas de WhatsApp/comentarios con los nombres `test-1.jpg`, `test-2.jpg`, etc. Si tienes más de 6, dime cuántos y agrego más slots en la home. Si tienes menos, no pasa nada: los slots vacíos se ocultan solos.

**Importante:** tapa números de WhatsApp y nombres completos si las personas no autorizaron mostrarlos. Ver `imagenes/testimonios/LEEME.txt` para los detalles.

### 2. Configurar el Apps Script (captura de leads)

Una sola vez. Sirve para los formularios de Bootcamp Claude, Meta Ads waitlist y Agencia.

Pasos completos en `SETUP-CAPTURA-DATOS.md`. Resumen:

1. Crea un Google Sheets nuevo (o usa el existente del bootcamp Claude)
2. Copia su ID (la parte larga del URL)
3. Abre `apps-script.gs` en este proyecto y reemplaza:
   - `PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEETS` por el ID real
   - `joakoestratega@gmail.com` ya está, déjalo así (o cámbialo si quieres recibir alertas en otro correo)
4. Entra a [script.google.com](https://script.google.com) → Nuevo proyecto → Pega el código → Guarda
5. **Implementar → Nueva implementación** → Tipo: Aplicación web
   - Ejecutar como: Yo (tu cuenta)
   - Tener acceso: Cualquier persona
6. Copia el URL que termina en `/exec`
7. Pega ese URL en los siguientes archivos donde dice `PEGA_AQUI_EL_URL_DE_TU_APPS_SCRIPT`:
   - `bootcamp-meta-ads/index.html`
   - `agencia/index.html`
   - `bootcamp-claude/index.html` (si todavía no estaba conectado)

El script crea hojas separadas automáticamente:
- "Leads Bootcamp Claude"
- "Lista Espera Meta Ads"
- "Aplicaciones Agencia"

### 3. (Opcional) Editar fechas o cupos del bootcamp Claude

El bootcamp Claude ya tiene la fecha "Sábado 6 de junio". Si cambia, edita `bootcamp-claude/index.html`.

---

## PASO A PASO PARA PUBLICAR

### Paso 1. Repositorio en GitHub

Si ya existe `joakoestratega-landing` (o como lo hayas llamado), salta al paso 2.

Si es la primera vez:
1. Entra a [github.com/new](https://github.com/new)
2. Repository name: `joakoestratega-landing`
3. Visibility: **Public** (necesario para GitHub Pages gratis)
4. NO marques "Add README" ni nada extra
5. Create repository

### Paso 2. Subir el contenido

**Opción A — GitHub Desktop (recomendado si no usas terminal)**

1. Si ya tienes el repo clonado, abre la carpeta local
2. **Borra el contenido viejo** del repo (excepto la carpeta `.git`)
3. Copia TODO el contenido de `LANDINGS/` (no la carpeta, su contenido) al repo local
4. GitHub Desktop muestra los cambios → Commit message: "Sitio nuevo con hub + 4 servicios"
5. Push origin

**Opción B — Web directa**

1. En el repo, borra los archivos viejos (Settings o desde la web)
2. Sube los nuevos arrastrándolos
3. Commit changes

### Paso 3. GitHub Pages (si no estaba activo)

1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main`, Folder: `/ (root)`
4. Save
5. En 1-2 minutos sale al aire

### Paso 4. Dominio joakoestratega.com (Hostinger)

Si ya estaba conectado al bootcamp Claude, el dominio sigue funcionando, no tienes que tocar nada. La nueva home reemplaza la anterior automáticamente.

Si no estaba:
- DNS Hostinger:

| Tipo | Nombre | Apunta a (Valor) | TTL |
|------|--------|------------------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| CNAME | www | tu-usuario.github.io | 3600 |

- En GitHub: Settings → Pages → Custom domain: `joakoestratega.com` → Save → Espera el check verde → Marca "Enforce HTTPS"

---

## CHECKLIST FINAL

- [ ] Subí mis testimonios a `imagenes/testimonios/` (test-1.jpg, test-2.jpg, ...)
- [ ] Configuré el Apps Script y copié el URL `/exec`
- [ ] Pegué el URL en `bootcamp-meta-ads/index.html` (donde dice `PEGA_AQUI_EL_URL_DE_TU_APPS_SCRIPT`)
- [ ] Pegué el URL en `agencia/index.html` (mismo lugar)
- [ ] Subí todo el contenido al repo de GitHub
- [ ] Verifiqué que las 5 URLs funcionan:
  - [ ] joakoestratega.com (home nueva)
  - [ ] joakoestratega.com/comunidad
  - [ ] joakoestratega.com/bootcamp-claude
  - [ ] joakoestratega.com/bootcamp-meta-ads
  - [ ] joakoestratega.com/agencia
- [ ] Probé que los formularios guardan en Google Sheets (anótate tú primero como prueba)
- [ ] Probé el botón verde de la comunidad y abre el grupo de WhatsApp

---

## CÓMO HACER CAMBIOS DESPUÉS

Cualquier cambio (precio, fecha, copy, agregar testimonio, abrir fecha del Bootcamp Meta Ads):

**Con GitHub Desktop:**
1. Abre la carpeta clonada
2. Edita el archivo correspondiente con cualquier editor
3. Guarda → GitHub Desktop muestra el cambio → Commit → Push
4. En 1-2 minutos sale al aire

**Desde GitHub web:**
1. Entra al repo → archivo → lápiz (Edit)
2. Cambia el texto
3. Commit changes

---

## PRÓXIMOS PASOS RECOMENDADOS

1. **Cuando tengas fecha del Bootcamp Meta Ads:** convierte la página de waitlist en landing de venta. Avísame y la actualizo.
2. **Si tu bootcamp Claude tiene varias ediciones:** podemos crear sub-páginas tipo `/bootcamp-claude/agosto-2026/` para distintas fechas.
3. **Página de "casos" o "cómo trabajo":** si ganas más testimonios públicos con permiso, podemos hacer una página dedicada con casos detallados.

---

Cualquier error en el proceso, escríbeme.