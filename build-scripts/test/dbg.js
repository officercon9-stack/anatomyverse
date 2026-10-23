const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/home/claude/brain3d';
const srv = http.createServer((q, r) => {
  const f = path.join(root, q.url.split('?')[0] === '/' ? 'index.html' : q.url.split('?')[0]);
  if (!fs.existsSync(f)) { console.log('404', q.url); r.writeHead(404); return r.end(); }
  const ext = path.extname(f); r.writeHead(200, { 'content-type': ext === '.html' ? 'text/html' : 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
}).listen(8766);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
  p.on('console', m => console.log('console', m.type(), m.text()));
  p.on('pageerror', e => console.log('pageerror', e.stack));
  p.on('requestfailed', r => console.log('reqfailed', r.url(), r.failure().errorText));
  await p.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith('https://cdn.jsdelivr.net/npm/three@0.128.0/')) {
      const f = path.join('/home/claude/brain3d/test/node_modules/three', u.split('three@0.128.0/')[1]);
      console.log('serve', f, fs.existsSync(f));
      if (!fs.existsSync(f)) return route.abort();
      return route.fulfill({ body: fs.readFileSync(f), contentType: 'application/javascript' });
    }
    if (u.startsWith('https://fonts.')) return route.abort();
    route.continue();
  });
  await p.goto('http://localhost:8766/');
  await p.waitForTimeout(3000); await p.evaluate(() => new Promise(res => new THREE.GLTFLoader().load('brain-skull.glb', g => { console.log('KEYS ' + Object.keys(g).join(',') + ' scenes=' + (g.scenes && g.scenes.length) + ' scene=' + typeof g.scene); res(); }, null, e => { console.log('LOADERR ' + (e && e.message)); res(); }))); await p.waitForTimeout(1000);
  console.log(await p.evaluate(() => document.getElementById('loading').innerText + ' | hidden=' + document.getElementById('loading').hidden));
  await b.close(); srv.close();
})();
