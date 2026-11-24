// Miniaturas: A = personaje animado golpeando el saco, B = boxeador real de un clip. node miniatura2.js <plano_clip_B> <frame_B>
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [nB, fB] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await pg.goto('file://' + path.join(__dirname, 'escena.html')); await pg.evaluate(() => window.listo);
  const textos = (modo) => {
    const g = document.getElementById('c').getContext('2d');
    // degradado oscuro a la derecha para el texto
    const gr = g.createLinearGradient(820, 0, 1920, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.35, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0.9)');
    g.fillStyle = gr; g.fillRect(820, 0, 1100, 1080);
    g.save(); g.textAlign = 'center'; g.lineJoin = 'round';
    const cx = 1450; let fs = 190; g.font = `900 ${fs}px Playfair`;
    while (g.measureText('TERMÍNALO.').width > 860) { fs -= 4; g.font = `900 ${fs}px Playfair`; } g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillText('TERMÍNALO.', cx + 8, 430);
    g.fillStyle = '#fff'; g.fillText('TERMÍNALO.', cx, 420);
    g.font = '112px Anton'; g.lineWidth = 16; g.strokeStyle = '#000';
    g.strokeText('LO QUE EMPIEZAS', cx, 580); g.fillStyle = '#FFD93B'; g.fillText('LO QUE EMPIEZAS', cx, 580);
    // chapa roja
    g.translate(cx, 760); g.rotate(-0.05);
    g.font = '92px Anton'; const t = '7 REGLAS'; const w = g.measureText(t).width;
    g.fillStyle = '#d6332e'; g.fillRect(-w / 2 - 34, -86, w + 68, 116);
    g.fillStyle = '#fff'; g.fillText(t, 0, 4);
    g.restore();
  };
  // A: plano de saco sin título, justo en un impacto
  await pg.evaluate(() => {
    window.SIN_SUBS = true;
    const ev = window.eventos(); const p = window.planos.find(p => p.tipo === 'saco' && !p.titulo && p.env === 'ciudad');
    const golpe = ev.golpes.find(g => g > p.t0 + 0.5 && g < p.t1);
    window.renderAt(golpe + 0.03);
    const c = document.getElementById('c'), cp = document.createElement('canvas'); cp.width = 1920; cp.height = 1080;
    cp.getContext('2d').drawImage(c, 0, 0);
    const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, 1920, 1080);
    const z = 1.45; g.drawImage(cp, 560 - 560 * z - 170, 560 - 560 * z, 1920 * z, 1080 * z);
  });
  await pg.evaluate(textos, 'A');
  await pg.locator('canvas').screenshot({ path: 'salida/01-miniatura-A.jpg', type: 'jpeg', quality: 93 });
  // B: fotograma real
  await pg.evaluate(async ([nB, fB]) => {
    const img = new Image(); img.src = `tmp/clipframes/${nB}/${String(fB).padStart(4, '0')}.jpg`; await img.decode();
    const g = document.getElementById('c').getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(img, -430, -60, 1920 * 1.12, 1080 * 1.12);
    g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(40,140,160,0.35)'; g.fillRect(0, 0, 1920, 1080); g.restore();
    g.save(); g.globalCompositeOperation = 'overlay'; g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, 1920, 1080); g.restore();
  }, [nB, fB]);
  await pg.evaluate(textos, 'B');
  await pg.locator('canvas').screenshot({ path: 'salida/01-miniatura-B.jpg', type: 'jpeg', quality: 93 });
  await b.close();
})();
