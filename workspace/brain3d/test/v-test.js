const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/home/claude/av-build';
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const srv = http.createServer((q, r) => {
  let u=q.url.split('?')[0]; let f=path.join(root,u==='/'?'index.html':u);
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){ f=path.join(root,'index.html'); }
  r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r);
}).listen(8772);
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1360,height:900}});
  const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
  await p.route('https://fonts.*/**',r=>r.abort());
  await p.goto('http://localhost:8772/#/app/lab',{waitUntil:'load'}); await p.waitForTimeout(9000);
  await p.click('button:has-text("Layers")'); await p.waitForTimeout(800);
  await p.click('button:has-text("Zoom to the brain")'); await p.waitForTimeout(6000);
  await p.screenshot({path:'v-1-default.png'});
  await p.mouse.move(770,450); await p.mouse.wheel(0,400); await p.waitForTimeout(2500);
  await p.screenshot({path:'v-2-zoomout.png'});
  const chk=async(label)=>{await p.locator('label',{hasText:label}).locator('input').first().check()};
  await chk('Cerebrospinal fluid (CSF)'); await p.waitForTimeout(9000);
  await p.screenshot({path:'v-3-csf.png'});
  await chk('Skull base: three cranial fossae'); await p.waitForTimeout(9000);
  await p.screenshot({path:'v-4-fossae.png'});
  console.log('ERRORS',JSON.stringify(errs.slice(0,8)));
  await b.close(); srv.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
