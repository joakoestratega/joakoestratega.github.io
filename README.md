# Sitio Joako Estratega · Carpeta lista para GitHub Pages

Esta carpeta está lista para subir a GitHub Pages y conectar con dominio joakoestratega.com.

---

## Estructura final

```
LANDINGS/  (esto es lo que subes a GitHub)
│
├── CNAME                                 ← Vincula joakoestratega.com con GitHub Pages
├── index.html                            ← Home del dominio (joakoestratega.com)
│
└── bootcamp-claude/                      ← Landing del bootcamp Claude
    ├── index.html                        ← La landing completa
    ├── imagenes/
    │   ├── LEEME.txt
    │   ├── logo-negro-amarillo-blanco.png       (✅ ya está)
    │   ├── logo-blanco-amarillo-fondo-azul.png  (✅ ya está)
    │   └── logo-blanco-amarillo-fondo-negro.png (✅ ya está)
    └── videos/
        └── LEEME.txt
```

## URLs que vas a tener al aire

| URL pública | Qué muestra |
|-------------|-------------|
| https://joakoestratega.com | Home simple con tu logo y botón al bootcamp |
| https://joakoestratega.com/bootcamp-claude | Landing completa del bootcamp |
| https://wa.me/573028662556 | Tu WhatsApp directo (ya integrado en ambas páginas) |

---

## ARCHIVOS QUE TIENES QUE SUBIR (lo que falta)

Los 3 logos ya están copiados y listos. Solo te faltan **3 imágenes adicionales** y **1 video**:

### En `bootcamp-claude/imagenes/`
- `claude-corriendo.png` — Captura de Claude Code corriendo en tu PC con agentes visibles
- `parrilla-demo.gif` — GIF corto (5-10 seg) del sistema generando parrilla
- `joako-effi.jpg` — Foto profesional tuya en tarima de Feria EFFIX o Grupo EFFI

### En `bootcamp-claude/videos/` (opcional)
Solo si vas con video local en lugar de YouTube. Ver instrucciones en `bootcamp-claude/videos/LEEME.txt`.

---

## EDICIONES PENDIENTES EN EL HTML

Antes de subir, abre `bootcamp-claude/index.html` con cualquier editor de texto y reemplaza:

1. **`{{LINK_WOMPI}}`** → tu link real de pago Wompi
2. **`VIDEO_ID`** → ID de tu video de YouTube (o cambia a video local)
3. **`Dirección al confirmar inscripción`** → cuando confirmes el lugar exacto

---

## PASO A PASO PARA PUBLICAR

### Paso 1. Crea el repositorio en GitHub

1. Entra a https://github.com con tu cuenta (si no tienes, créala en 5 minutos)
2. Click en **"New"** o ve a https://github.com/new
3. Configura:
   - **Repository name:** `joakoestratega-landing`
   - **Visibility:** Public (necesario para GitHub Pages gratis)
   - **NO marques** "Add README", "Add .gitignore", "Add license"
4. Click en **"Create repository"**

### Paso 2. Sube el contenido de la carpeta `LANDINGS/` al repo

**Opción A — GitHub Desktop (recomendado si no usas terminal)**
1. Descarga GitHub Desktop: https://desktop.github.com
2. Inicia sesión y clona el repo recién creado
3. Copia **TODO lo que hay dentro de `LANDINGS/`** (no la carpeta, el contenido) a la carpeta clonada del repo
4. En GitHub Desktop verás los archivos pendientes
5. Mensaje de commit: "Primera versión del sitio"
6. Click "Commit to main" → "Push origin"

**Opción B — Web directa**
1. En el repo recién creado, click en **"uploading an existing file"**
2. Arrastra todo el contenido de `LANDINGS/`
3. Mensaje: "Primera versión del sitio"
4. Click "Commit changes"

### Paso 3. Activa GitHub Pages

1. En tu repositorio: **Settings** → **Pages** (menú izquierdo)
2. En "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** main
   - **Folder:** / (root)
3. Click **Save**
4. GitHub te dará URL temporal tipo: `https://tu-usuario.github.io/joakoestratega-landing`
5. Espera 1-2 minutos a que se publique. Ya puedes verla en esa URL.

### Paso 4. Conecta tu dominio joakoestratega.com (Hostinger)

#### 4.1 — En Hostinger (configurar DNS)
1. Entra a https://hpanel.hostinger.com
2. **Dominios** → **joakoestratega.com** → **Administrar**
3. Busca **DNS / Nameservers** o **Editor de Zona DNS**
4. **Borra** los registros A o CNAME existentes en `@` y `www` que apunten a otros sitios
5. **Crea 4 registros tipo A** (uno por cada IP):

| Tipo | Nombre | Apunta a (Valor) | TTL |
|------|--------|------------------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

6. **Crea 1 registro CNAME** para www:

| Tipo | Nombre | Apunta a | TTL |
|------|--------|----------|-----|
| CNAME | www | tu-usuario.github.io | 3600 |

(Reemplaza `tu-usuario` por tu username real de GitHub)

7. Guarda los cambios.

#### 4.2 — En GitHub (configurar dominio personalizado)
1. Vuelve a **Settings → Pages** en tu repositorio
2. En **Custom domain** escribe: `joakoestratega.com`
3. Click **Save**
4. GitHub valida el DNS automáticamente (10 min a 24 horas).
5. Cuando aparezca check verde "DNS check successful", **marca "Enforce HTTPS"**.

El archivo `CNAME` que ya está en la carpeta tiene `joakoestratega.com` adentro, GitHub lo reconoce solo.

### Paso 5. Verifica

Después de 24-48 horas máximo:
- https://joakoestratega.com → Home con botón al bootcamp
- https://joakoestratega.com/bootcamp-claude → Landing completa
- https://www.joakoestratega.com → debe redirigir a la versión sin www
- Candado verde de HTTPS activo

---

## CHECKLIST FINAL ANTES DE LANZAR

- [ ] Subí las 3 imágenes faltantes a `bootcamp-claude/imagenes/`
- [ ] Subí o configuré el video del hero (YouTube o local)
- [ ] Reemplacé `{{LINK_WOMPI}}` con mi link real de Wompi
- [ ] Reemplacé `VIDEO_ID` con el ID real de YouTube
- [ ] Cuando confirmé el lugar, edité "Dirección al confirmar inscripción"
- [ ] Creé el repositorio `joakoestratega-landing` en GitHub
- [ ] Subí todo el contenido de la carpeta LANDINGS al repo
- [ ] Activé GitHub Pages (Settings → Pages → main branch)
- [ ] Configuré los 4 registros A en Hostinger
- [ ] Configuré el CNAME para www en Hostinger
- [ ] Agregué `joakoestratega.com` en Settings → Pages → Custom domain
- [ ] Esperé propagación DNS (1-48 horas)
- [ ] Activé "Enforce HTTPS" en GitHub
- [ ] Verifiqué https://joakoestratega.com y https://joakoestratega.com/bootcamp-claude

---

## ¿CÓMO HACER CAMBIOS DESPUÉS?

Cuando vendas un cupo y quieras cambiar "10 cupos" por "9 cupos":

**Con GitHub Desktop:**
1. Abre la carpeta clonada
2. Edita `bootcamp-claude/index.html` con un editor
3. Busca la palabra (ej: "10 cupos disponibles")
4. Cambia por "9 cupos disponibles"
5. Guarda → GitHub Desktop muestra el cambio → Commit → Push

**Desde GitHub web:**
1. Entra a tu repo → `bootcamp-claude/index.html`
2. Click en el lápiz (Edit)
3. Cambia el texto
4. Click "Commit changes"
5. En 1-2 minutos sale al aire

---

Cualquier error en el proceso, escríbeme.
