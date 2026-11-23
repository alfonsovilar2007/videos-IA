const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await pg.goto('file://' + path.join(__dirname, 'escena.html')); await pg.evaluate(() => window.listo);
  await pg.evaluate(() => {
    window.SIN_SUBS = true;
    const p = window.planos.find(p => p.tipo === 'espalda' && p.env === 'ciudad' && !p.titulo && p.t1 - p.t0 > 2);
    window.renderAt(p.t0 + 1.13);
    const g = document.getElementById('c').getContext('2d');
    g.save(); g.textAlign = 'center'; g.font = '900 210px Playfair';
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillText('TERMÍNALO.', 968, 470);
    g.fillStyle = '#fff'; g.fillText('TERMÍNALO.', 960, 460);
    g.font = '96px Anton'; g.lineWidth = 14; g.strokeStyle = '#000'; g.lineJoin = 'round';
    const t = '7 REGLAS PARA NO ABANDONAR'; const w = g.measureText(t).width;
    g.fillStyle = '#d6332e'; g.fillRect(960 - w / 2 - 24, 860, w + 48, 120);
    g.fillStyle = '#fff'; g.fillText(t, 960, 955); g.restore();
  });
  await pg.locator('canvas').screenshot({ path: 'salida/01-miniatura.jpg', type: 'jpeg', quality: 92 });
  await b.close();
})();
