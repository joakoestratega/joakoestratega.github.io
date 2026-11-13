// Los 3 temas visuales. Cada estilo que propone la IA usa uno de estos
// y le cambia el color de acento. Las secciones solo leen estas variables.

const TEMAS = {
  impacto: {
    nombre: 'Impacto',
    fuentes: 'family=Anton&family=Inter:wght@400;500;600;700',
    vars: {
      '--fondo': '#0b0b0f', '--superficie': '#15151c', '--superficie-2': '#1d1d26',
      '--texto': '#f4f4f6', '--suave': 'rgba(244,244,246,.66)', '--borde': 'rgba(255,255,255,.10)',
      '--acento': '#f8b400', '--sobre-acento': '#0b0b0f',
      '--f-titulo': "'Anton', Impact, sans-serif", '--f-texto': "'Inter', system-ui, sans-serif",
      '--peso-titulo': '400', '--mayus': 'uppercase', '--letra-titulo': '.01em', '--alto-titulo': '1.02',
      '--radio': '14px', '--radio-btn': '999px', '--sombra': '0 30px 80px rgba(0,0,0,.55)',
    },
  },
  editorial: {
    nombre: 'Editorial',
    fuentes: 'family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600',
    vars: {
      '--fondo': '#f5efe6', '--superficie': '#fffaf3', '--superficie-2': '#ece3d6',
      '--texto': '#1f1a15', '--suave': 'rgba(31,26,21,.64)', '--borde': 'rgba(31,26,21,.12)',
      '--acento': '#8a4b2a', '--sobre-acento': '#fffaf3',
      '--f-titulo': "'Fraunces', Georgia, serif", '--f-texto': "'Inter', system-ui, sans-serif",
      '--peso-titulo': '400', '--mayus': 'none', '--letra-titulo': '-.02em', '--alto-titulo': '1.06',
      '--radio': '4px', '--radio-btn': '2px', '--sombra': '0 24px 60px rgba(60,40,20,.14)',
    },
  },
  limpio: {
    nombre: 'Limpio',
    fuentes: 'family=Plus+Jakarta+Sans:wght@400;500;600;700;800',
    vars: {
      '--fondo': '#ffffff', '--superficie': '#f4f6fb', '--superficie-2': '#e9edf7',
      '--texto': '#0e1525', '--suave': 'rgba(14,21,37,.62)', '--borde': 'rgba(14,21,37,.09)',
      '--acento': '#3a56f5', '--sobre-acento': '#ffffff',
      '--f-titulo': "'Plus Jakarta Sans', system-ui, sans-serif", '--f-texto': "'Plus Jakarta Sans', system-ui, sans-serif",
      '--peso-titulo': '800', '--mayus': 'none', '--letra-titulo': '-.035em', '--alto-titulo': '1.04',
      '--radio': '22px', '--radio-btn': '14px', '--sombra': '0 24px 60px rgba(30,45,90,.12)',
    },
  },
};

// Texto legible sobre el color de acento.
function contraste(hex) {
  const h = (hex || '').replace('#', '');
  if (h.length !== 6) return null;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 0.4 ? '#0b0b0f' : '#ffffff';
}

if (typeof module !== 'undefined') module.exports = { TEMAS, contraste };
else Object.assign(window, { TEMAS, contraste });
