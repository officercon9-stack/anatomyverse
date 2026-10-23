const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/home/claude/av-build';
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const srv = http.createServer((q, r) => {
  let u=q.url.split('?')[0]; let f=path.join(root,u==='/'?'index.html':u);
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){ f=path.join(root,'index.html'); }
  r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r);
}).listen(8770);
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1360,height:900}});
  const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
  await p.route('https://fonts.*/**',r=>r.abort());
  await p.goto('http://localhost:8770/#/app/lab',{waitUntil:'load'}); await p.waitForTimeout(2500); console.log('links',await p.$$eval('a',a=>a.map(x=>x.getAttribute('href')+':'+x.textContent.trim()).slice(0,20)));
  await p.waitForTimeout(4000);
  console.log('url',p.url(),'title',await p.title());
  await p.screenshot({path:'app-1.png'});
  await p.click('button:has-text("Layers")'); await p.waitForTimeout(800);
  const hasSel=await p.$('#model-select'); console.log('model-select',!!hasSel);
  console.log('options',await p.$$eval('#model-select option',o=>o.map(x=>x.value+' | '+x.textContent)));
  await p.selectOption('#model-select','bodyparts3d-brain-skull');
  await p.waitForTimeout(10000);
  await p.screenshot({path:'app-2-brain.png'});
  await p.click('button:has-text("Structures")'); await p.waitForTimeout(500);
  await p.click('button:has-text("Nervous")'); await p.waitForTimeout(500);
  await p.click('text=Frontal lobe'); await p.waitForTimeout(2500);
  await p.screenshot({path:'app-3-frontal.png'});
  const btns=await p.$$eval('button',b=>b.map(x=>x.textContent.trim()).filter(t=>/close-up|full-body/i.test(t)));
  console.log('buttons',btns);
  console.log('ERRORS',JSON.stringify(errs.slice(0,8)));
  await b.close(); srv.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
