// Captura un fotograma de una escena 3D (three.js) a PNG 1080x1920.
// Uso: node tools/captura.js <ruta/escena.html relativa al repo> <salida.png>
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const raiz = path.resolve(__dirname, '..');
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(raiz, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
srv.listen(0, async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('console', m => m.type() === 'error' && console.log('consola:', m.text())); p.on('pageerror', e => console.log('error:', e.message));
  await p.goto(`http://127.0.0.1:${srv.address().port}/${process.argv[2]}`);
  await p.waitForFunction('window.LISTO === true', null, { timeout: 300000 });
  await p.screenshot({ path: process.argv[3] }); await b.close(); srv.close();
});
