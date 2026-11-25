// Renderiza un film (página con window.renderAt(t)) a fotogramas JPG en paralelo.
// Uso: node tools/render_film.js <film.html relativo al repo> <carpeta_salida> [fps=30] [procesos=3]
//      node tools/render_film.js <film.html> <carpeta> --tiempos 0,1.5,3   (solo esos instantes, para revisar)
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const raiz = path.resolve(__dirname, '..');
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json' };
const [film, salida, a3, a4] = process.argv.slice(2);
fs.mkdirSync(salida, { recursive: true });
const srv = http.createServer((q, r) => { const f = path.join(raiz, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
srv.listen(0, async () => {
  const url = `http://127.0.0.1:${srv.address().port}/${film}`;
  const abrir = async () => {
    const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    p.on('pageerror', e => console.log('error:', e.message)); p.on('console', m => m.type() === 'error' && console.log('consola:', m.text()));
    await p.goto(url); await p.waitForFunction('window.LISTO === true', null, { timeout: 300000 });
    return { b, p };
  };
  const foto = async (p, t, archivo) => { await p.evaluate(t => window.renderAt(t), t); await p.screenshot({ path: archivo, type: 'jpeg', quality: 96, timeout: 180000 }); };
  if (a3 === '--tiempos') {
    const { b, p } = await abrir();
    for (const t of a4.split(',').map(Number)) await foto(p, t, path.join(salida, `t_${t.toFixed(2)}.jpg`));
    console.log('planos:', JSON.stringify(await p.evaluate(() => window.PLANOS.map(x => [x.nombre, +x.t0.toFixed(2)])))); await b.close(); srv.close(); return;
  }
  const fps = +(a3 || 30), N = +(a4 || 3);
  const { b: b0, p: p0 } = await abrir(); const dur = await p0.evaluate(() => window.DURACION); await b0.close();
  const total = Math.ceil(dur * fps); const t0 = Date.now(); let hechos = 0;
  console.log(`${total} fotogramas, ${dur.toFixed(2)} s`);
  await Promise.all([...Array(N)].map(async (_, w) => {
    const { b, p } = await abrir();
    for (let f = w; f < total; f += N) {
      const arch = path.join(salida, String(f).padStart(5, '0') + '.jpg');
      if (!fs.existsSync(arch)) await foto(p, f / fps, arch);
      if (++hechos % 150 === 0) console.log(`${hechos}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    await b.close();
  }));
  console.log('listo en', ((Date.now() - t0) / 1000).toFixed(0), 's'); srv.close();
});
