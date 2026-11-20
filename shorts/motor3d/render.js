// Renderiza en 3D las escenas de un plan: node render.js plan.json
// plan.json: { ancho, alto, fps, escenas: [{ imagen, profundidad, frames, duracion, movimiento, particulas, anclas:[[u,v]], salida }] }
// Para cada escena escribe salida/NNNNN.jpg y salida/anclas.json
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const RAIZ = __dirname;
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' };

(async () => {
  const plan = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const nav = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pag = await nav.newPage({ viewport: { width: plan.ancho, height: plan.alto } });
  pag.on('console', m => { if (m.type() === 'error') console.error('[navegador]', m.text()); });
  pag.on('pageerror', e => console.error('[navegador]', e.message));
  await pag.route('http://local/**', async r => {
    const u = decodeURIComponent(new URL(r.request().url()).pathname);
    let f;
    if (u === '/three.module.js') f = path.join(RAIZ, 'node_modules/three/build/three.module.js');
    else if (u.startsWith('/archivo/')) f = u.slice('/archivo'.length);
    else f = path.join(RAIZ, u);
    try { await r.fulfill({ body: fs.readFileSync(f), contentType: TIPOS[path.extname(f)] || 'application/octet-stream' }); }
    catch (e) { await r.fulfill({ status: 404, body: '' }); }
  });
  await pag.goto('http://local/escena.html');
  await pag.waitForFunction(() => window.prepararEscena && window.renderFrame);

  for (const [n, e] of plan.escenas.entries()) {
    fs.mkdirSync(e.salida, { recursive: true });
    await pag.evaluate(p => window.prepararEscena(p), {
      ...e, ancho: plan.ancho, alto: plan.alto,
      imagen: 'http://local/archivo' + path.resolve(e.imagen), profundidad: 'http://local/archivo' + path.resolve(e.profundidad),
    });
    const anclas = [];
    const t0 = Date.now();
    for (let k = 0; k < e.frames; k++) {
      const r = await pag.evaluate(k => window.renderFrame(k), k);
      fs.writeFileSync(path.join(e.salida, String(k).padStart(5, '0') + '.jpg'), Buffer.from(r.img.split(',')[1], 'base64'));
      anclas.push(r.anclas);
    }
    fs.writeFileSync(path.join(e.salida, 'anclas.json'), JSON.stringify(anclas));
    console.log(`[3d] escena ${n + 1}/${plan.escenas.length}: ${e.frames} frames en ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await nav.close();
})().catch(e => { console.error(e); process.exit(1); });
