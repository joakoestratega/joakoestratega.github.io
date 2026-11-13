// Secciones que puede usar la IA. Para sumar una nueva: crea su archivo en esta
// carpeta (copia _PLANTILLA.js) y agrega su nombre aquí abajo.
const LISTA_SECCIONES = [
  'anuncio',
  'hero',
  'confianza',
  'problema',
  'beneficios',
  'como-funciona',
  'oferta',
  'cta-final',
  'pie',
];

if (typeof module !== 'undefined') module.exports = LISTA_SECCIONES;
else window.LISTA_SECCIONES = LISTA_SECCIONES;
