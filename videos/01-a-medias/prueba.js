// Uso: node prueba.js salida.jpg t1 t2 ...   (hoja con fotogramas sueltos)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const [out, ...ts] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on('pageerror', e => console.log('ERR', e.message)); pg.on('console', m => console.log('LOG', m.text()));
  await pg.goto('file://' + path.join(__dirname, 'escena.html')); await pg.evaluate(() => window.listo);
  const info = await pg.evaluate(() => window.planos.map(p => `${p.t0.toFixed(1)} ${p.tipo} ${p.env}`).slice(0, 400));
  fs.writeFileSync('tmp/planos.txt', info.join('\n'));
  let i = 0;
  for (const t of ts) { const t0 = Date.now(); await pg.evaluate(t => window.renderAt(+t), t); await pg.locator('canvas').screenshot({ path: `tmp/p_${i++}.jpg`, quality: 85, type: 'jpeg' }); console.log(t, Date.now() - t0, 'ms'); }
  await b.close();
})();
