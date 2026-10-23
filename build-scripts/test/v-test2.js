const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/home/claude/av-build';
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const srv = http.createServer((q, r) => {
  let u=q.url.split('?')[0]; let f=path.join(root,u==='/'?'index.html':u);
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){ f=path.join(root,'index.html'); }
  r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r);
}).listen(8773);
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1360,height:900}});
  const errs=[]; p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text().slice(0,200))}); p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
  await p.route('https://fonts.*/**',r=>r.abort());
  await p.goto('http://localhost:8773/#/app/lab',{waitUntil:'load'}); await p.waitForTimeout(9000);
  await p.click('button:has-text("Layers")'); await p.waitForTimeout(800);
  await p.click('button:has-text("Zoom to the brain")'); await p.waitForTimeout(4000);
  await p.mouse.click(1329,28); await p.waitForTimeout(500);
  const chk=async(label)=>{await p.locator('label',{hasText:label}).locator('input').first().check()};
  await chk('Cerebrospinal fluid (CSF)'); await chk('Skull base: three cranial fossae'); await p.waitForTimeout(12000);
  await p.mouse.move(770,450); await p.mouse.wheel(0,500); await p.waitForTimeout(1500);
  for(const v of ['L','Inf','Sup']){ await p.click(`button:text-is("${v}")`); await p.waitForTimeout(3500); await p.screenshot({path:'v-view-'+v+'.png',clip:{x:560,y:0,width:420,height:900}}); }
  console.log('ERRORS',JSON.stringify(errs.slice(0,8)));
  await b.close(); srv.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
