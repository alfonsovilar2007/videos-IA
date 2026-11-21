// Renderiza un personaje suelto a PNG con fondo transparente.
// Uso: node tools/sprite.js <personaje> <expresion> <salida.png> ['{"cambios":"json"}']
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [p, e, out, cambios] = process.argv.slice(2);
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 400, height: 640 }, deviceScaleFactor: 2 });
  const url = 'file://' + path.resolve(__dirname, '../personajes/sprite.html') + '?p=' + p + '&e=' + e + (cambios ? '&cambios=' + encodeURIComponent(cambios) : '');
  await pg.goto(url); await pg.locator('#s').screenshot({ path: out, omitBackground: true }); await b.close();
})();
