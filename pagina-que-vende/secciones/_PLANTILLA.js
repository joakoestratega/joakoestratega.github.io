// PLANTILLA PARA UNA SECCIÓN NUEVA
// 1. Copia este archivo con el nombre de tu sección (ej: testimonios.js).
// 2. Cambia id, nombre, descripcion, ejemplo, css y html.
// 3. Agrega el id en secciones/lista.js.
//
// Ayudas que tienes dentro de html (h):
//   h.txt('campo', 'etiqueta', 'clase')  → texto editable (ej: h.txt('titulo', 'h2', 'tit t2'))
//   h.lista('campo')                     → arreglo para recorrer
//   h.boton()                            → botón de compra con el link del cliente
//   h.foto('slot', 'clase')              → hueco de foto (decláralo en fotos)
//   h.tieneFoto('slot')                  → true si va foto (para cambiar el diseño)
//
// Clases que ya existen: sec (espacio arriba/abajo), alt (fondo alterno), cont (ancho),
// cab / cab centro (encabezado), etq (etiqueta), tit t1/t2/t3 (titulares), lead (texto grande), btn.
// Colores y letras: usa SIEMPRE var(--acento), var(--texto), var(--suave), var(--superficie),
// var(--borde), var(--radio), var(--f-titulo). Nunca colores fijos: así sirve en los 3 estilos.

registrarSeccion({
  id: 'mi-seccion',
  nombre: 'Mi sección',
  descripcion: 'Para qué sirve y cuándo usarla. La IA lee esto para decidir si la pone.',
  ejemplo: { titulo: 'Titular de ejemplo', texto: 'Texto de ejemplo.' },
  fotos: [],
  css: `
.mi-sec{text-align:center}
`,
  html: h => `<section class="sec mi-sec"><div class="cont">
  <div class="cab centro">${h.txt('titulo', 'h2', 'tit t2')}${h.txt('texto', 'p', 'lead')}</div>
</div></section>`,
});
