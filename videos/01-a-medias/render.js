// Render completo: node render.js [fps] [workers] [desde_seg] [hasta_seg]
// Cada worker renderiza un tramo y lo envía a su propio ffmpeg -> tmp/seg_k.mp4. Salta tramos ya hechos.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { spawn } = require('child_process');
const FPS = +(process.argv[2] || 30), NW = +(process.argv[3] || 3);
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const abrir = async () => { const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } }); pg.on('pageerror', e => console.log('ERR', e.message));
    await pg.goto('file://' + path.join(__dirname, 'escena.html')); await pg.evaluate(() => window.listo); return pg; };
  const p0 = await abrir();
  const ev = await p0.evaluate(() => window.eventos()); fs.writeFileSync('tmp/eventos.json', JSON.stringify(ev));
  const total = Math.ceil(ev.total * FPS), desde = Math.floor((+(process.argv[4] || 0)) * FPS), hasta = Math.min(total, Math.ceil((+(process.argv[5] || 1e9)) * FPS));
  const SEG = 60 * FPS; // tramos de 60 s
  const tramos = []; for (let a = Math.floor(desde / SEG) * SEG; a < hasta; a += SEG) tramos.push([a, Math.min(a + SEG, total)]);
  let siguiente = 0; const t0 = Date.now();
  const worker = async (pg) => {
    while (siguiente < tramos.length) {
      const [a, z] = tramos[siguiente++], out = `tmp/seg_${String(a / SEG).padStart(3, '0')}.mp4`;
      if (fs.existsSync(out)) continue;
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-r', String(FPS), out + '.tmp.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let f = a; f < z; f++) {
        await pg.evaluate(t => window.renderAt(t), f / FPS);
        const buf = await pg.screenshot({ type: 'jpeg', quality: 93 });
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      }
      ff.stdin.end(); await new Promise(r => ff.on('close', r)); fs.renameSync(out + '.tmp.mp4', out);
      console.log(`tramo ${a / SEG} listo (${((Date.now() - t0) / 60000).toFixed(1)} min)`);
    }
  };
  const pgs = [p0]; for (let i = 1; i < NW; i++) pgs.push(await abrir());
  await Promise.all(pgs.map(worker)); await b.close(); console.log('RENDER OK');
})();
