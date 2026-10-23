const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/home/claude/av-build';
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const srv = http.createServer((q, r) => {
  let u=q.url.split('?')[0]; let f=path.join(root,u==='/'?'index.html':u);
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){ f=path.join(root,'index.html'); }
  r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r);
}).listen(8771);
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1360,height:900}});
  const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
  await p.route('https://fonts.*/**',r=>r.abort());
  await p.goto('http://localhost:8771/#/app/lab',{waitUntil:'load'}); await p.waitForTimeout(9000);
  await p.click('button:has-text("Layers")'); await p.waitForTimeout(800);
  const set=async(idx,val)=>{await p.$$eval('input[type=range]',(els,[i,v])=>{const el=els[i];const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));},[idx,val])};
  console.log(await p.$$eval('input[type=range]',e=>e.map(x=>x.getAttribute('aria-label')+'|'+x.min+'|'+x.max+'|'+x.value)));
  await set(2,'0.3');
  await p.click('button:has-text("Cerebellum")'); await p.waitForTimeout(1500);
  await p.mouse.click(1329,28);
  await p.mouse.move(770,450);
  await p.mouse.wheel(0,700); await p.waitForTimeout(1500); await p.screenshot({path:'body-h-front.png'});
  await p.mouse.move(700,450); await p.mouse.down(); await p.mouse.move(930,450,{steps:12}); await p.mouse.up(); await p.waitForTimeout(1500);
  await p.screenshot({path:'body-h-side.png'});
  console.log('ERRORS',JSON.stringify(errs.slice(0,8)));
  await b.close(); srv.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
