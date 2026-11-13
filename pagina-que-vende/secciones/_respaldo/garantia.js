registrarSeccion({
  id: 'garantia',
  nombre: 'Garantía',
  descripcion: 'Quita el miedo a comprar. Un sello, un titular con la garantía y una frase que explica cómo funciona. Usa SOLO la garantía que dio el negocio; si no dio ninguna, no uses esta sección.',
  ejemplo: { sello: '30 días', titulo: 'Pruébalo sin riesgo', texto: 'Si en 30 días no te gusta, nos escribes y te devolvemos tu dinero. Sin preguntas.' },
  fotos: [],
  css: `
.gar .cont{display:grid;grid-template-columns:auto 1fr;gap:clamp(28px,5vw,64px);align-items:center;max-width:920px;padding:clamp(36px,5vw,56px);border:2px solid var(--acento);border-radius:calc(var(--radio) + 6px)}
.gar-sello{display:grid;place-items:center;text-align:center;width:150px;height:150px;border-radius:50%;background:var(--acento);color:var(--sobre-acento);font-family:var(--f-titulo);font-weight:var(--peso-titulo);text-transform:var(--mayus);font-size:26px;line-height:1.05;padding:18px;box-shadow:0 0 0 8px var(--fondo),0 0 0 10px var(--acento)}
.gar-txt{display:grid;gap:14px}
@media (max-width:700px){.gar .cont{grid-template-columns:1fr;justify-items:center;text-align:center}}
`,
  html: h => `<section class="sec gar"><div class="cont">
  ${h.txt('sello', 'div', 'gar-sello')}
  <div class="gar-txt">${h.txt('titulo', 'h2', 'tit t2')}${h.txt('texto', 'p', 'lead')}</div>
</div></section>`,
});
