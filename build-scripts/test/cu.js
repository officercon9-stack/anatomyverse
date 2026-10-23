const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/home/claude/av-build';
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const srv = http.createServer((q, r) => { let u=q.url.split('?')[0]; let f=path.join(root,u==='/'?'index.html':u); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()) f=path.join(root,'index.html'); r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(8775);
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1360,height:900}});
  p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('C',m.text().slice(0,300))}); p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.route('https://fonts.*/**',r=>r.abort());
  await p.goto('http://localhost:8775/#/app/lab',{waitUntil:'load'}); await p.waitForTimeout(6000);
  await p.click('button:has-text("Layers")'); await p.waitForTimeout(500);
  await p.selectOption('#model-select','bodyparts3d-brain-skull'); await p.waitForTimeout(15000);
  await p.screenshot({path:'cu.png'}); await b.close(); srv.close();
})();
