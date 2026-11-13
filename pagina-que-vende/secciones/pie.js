registrarSeccion({
  id: 'pie',
  nombre: 'Pie de página',
  descripcion: 'Cierre con el nombre de la marca y una línea de contacto. Siempre va de último.',
  ejemplo: { marca: 'Nombre de la marca', texto: 'Ciudad, país · contacto@marca.com' },
  fotos: [],
  css: `
.pie{padding:44px 0;border-top:1px solid var(--borde);font-size:14px;color:var(--suave)}
.pie .cont{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:center}
.pie strong{font-family:var(--f-titulo);font-weight:var(--peso-titulo);text-transform:var(--mayus);font-size:20px;color:var(--texto);letter-spacing:var(--letra-titulo)}
`,
  html: h => `<footer class="pie"><div class="cont">${h.txt('marca', 'strong')}${h.txt('texto', 'span')}<span>© ${new Date().getFullYear()}</span></div></footer>`,
});
