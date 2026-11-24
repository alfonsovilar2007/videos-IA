// Miniaturas vídeo 02: node miniatura.js <plano> <frame> <salida> <lado: izq|der>
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [n, fr, out, lado] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await pg.goto('file://' + path.join(__dirname, 'escena.html')); await pg.evaluate(() => window.listo);
  await pg.evaluate(async ([n, fr, lado]) => {
    const W = 1920, H = 1080, g = document.getElementById('c').getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
    const img = new Image(); img.src = `tmp/clipframes/${n}/${String(fr).padStart(4, '0')}.jpg`; await img.decode();
    const dx = lado === 'izq' ? -380 : 0; g.drawImage(img, dx, -40, W * 1.08, H * 1.08);
    g.save(); g.globalCompositeOperation = 'saturation'; g.globalAlpha = 0.6; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); g.restore();
    g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,165,80,0.45)'; g.fillRect(0, 0, W, H); g.restore();
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(190,155,120,1)'; g.fillRect(0, 0, W, H); g.restore();
    const gr = g.createLinearGradient(700, 0, W, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.78)'); gr.addColorStop(1, 'rgba(0,0,0,0.92)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    // texto
    const cx = 1390; g.textAlign = 'center';
    let fs = 200; g.font = `900 ${fs}px Playfair`; while (g.measureText('OBSESIÓNATE.').width > 900) { fs -= 4; g.font = `900 ${fs}px Playfair`; }
    g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillText('OBSESIÓNATE.', cx + 7, 520 + 9);
    g.fillStyle = '#f4ead8'; g.fillText('OBSESIÓNATE.', cx, 520);
    g.fillStyle = '#E8B84A'; g.fillRect(cx - 300, 565, 600, 6);
    let ft = 54; g.font = `800 ${ft}px Mont`; const t = '6 VERDADES QUE NADIE TE DICE'; while (g.measureText(t).width + 4 * (t.length - 1) > 820) { ft -= 2; g.font = `800 ${ft}px Mont`; } let x = cx - (g.measureText(t).width + 4 * (t.length - 1)) / 2; g.textAlign = 'left';
    for (const ch of t) { g.fillStyle = '#E8B84A'; g.fillText(ch, x, 660); x += g.measureText(ch).width + 4; }
    // chapa con el reloj
    g.textAlign = 'center'; g.font = '800 46px Mont'; const c2 = '24 HORAS'; const w2 = g.measureText(c2).width;
    g.save(); g.translate(cx, 800); g.rotate(-0.04); g.fillStyle = '#b3281e'; g.fillRect(-w2 / 2 - 30, -52, w2 + 60, 74); g.fillStyle = '#fff'; g.fillText(c2, 0, 4); g.restore();
  }, [n, fr, lado]);
  await pg.locator('canvas').screenshot({ path: out, type: 'jpeg', quality: 93 });
  await b.close();
})();
