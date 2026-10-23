const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/home/claude/brain3d';
const srv = http.createServer((q, r) => {
  const f = path.join(root, q.url.split('?')[0] === '/' ? 'index.html' : q.url.split('?')[0]);
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  const ext = path.extname(f); r.writeHead(200, { 'content-type': ext === '.html' ? 'text/html' : ext === '.glb' ? 'model/gltf-binary' : 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
}).listen(8765);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const errors = [];
  async function setup(vw, vh, scheme) {
    const ctx = await b.newContext({ viewport: { width: vw, height: vh }, colorScheme: scheme });
    const p = await ctx.newPage();
    p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(vw + ' ' + m.type() + ': ' + m.text()); });
    p.on('pageerror', e => errors.push(vw + ' pageerror: ' + e.message));
    await p.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith('https://cdn.jsdelivr.net/npm/three@0.128.0/')) {
        const f = path.join('/home/claude/brain3d/test/node_modules/three', u.split('three@0.128.0/')[1]);
        return route.fulfill({ body: fs.readFileSync(f), contentType: 'application/javascript' });
      }
      if (u.startsWith('https://fonts.')) return route.abort();
      route.continue();
    });
    return p;
  }
  let p = await setup(1280, 860, 'dark');
  await p.goto('http://localhost:8765/');
  await p.waitForSelector('#loading', { state: 'hidden', timeout: 90000 });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: 'shot-desktop-dark.png' });
  await p.evaluate(() => document.querySelectorAll('details.grp').forEach(d => d.open = true));
  await p.click('.row button:has-text("Frontal lobe (right)")');
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'shot-selected.png' });
  await p.click('#presets .chip[data-p="midline"]');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'shot-midline.png' });
  await p.selectOption('#scene', 'csf');
  await p.waitForTimeout(3500);
  await p.screenshot({ path: 'shot-csf.png' });
  await p.selectOption('#scene', 'signal');
  await p.waitForTimeout(3000);
  await p.screenshot({ path: 'shot-signal.png' });
  const info = await p.evaluate(() => ({ caption: document.getElementById('caption').textContent, time: document.getElementById('tlTime').textContent }));
  console.log(JSON.stringify(info));
  let m = await setup(390, 800, 'light');
  await m.goto('http://localhost:8765/');
  await m.waitForSelector('#loading', { state: 'hidden', timeout: 90000 });
  await m.waitForTimeout(1200);
  await m.screenshot({ path: 'shot-mobile-light.png', fullPage: true });
  const sw = await m.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  console.log('mobile scrollWidth/innerWidth', sw);
  console.log('ERRORS', JSON.stringify(errors, null, 1));
  await b.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
