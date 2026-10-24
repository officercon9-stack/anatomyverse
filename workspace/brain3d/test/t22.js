const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/home/claude/av-build';
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const PORT=8800+Math.floor(Math.random()*90);
const srv = http.createServer((q, r) => { let u=q.url.split('?')[0]; let f=path.join(root,u==='/'?'index.html':u); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()) f=path.join(root,'index.html'); r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(PORT);
const steps=process.argv.slice(2);
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1360,height:900}});
  p.on('console',m=>{if(m.type()==='error')console.log('C',m.text().slice(0,300))}); p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.route('https://fonts.*/**',r=>r.abort());
  await p.goto(`http://localhost:${PORT}/#/app/lab`,{waitUntil:'load'}); await p.waitForTimeout(6000);
  await p.click('button:has-text("What to show")'); await p.waitForTimeout(500);
  let n=0;
  for(const s of steps){ if(s.startsWith('shot:')){await p.screenshot({path:s.slice(5),timeout:120000});} else if(s.startsWith('wait:')){await p.waitForTimeout(+s.slice(5));} else if(s.startsWith('mouse:')){const [x,y]=s.slice(6).split(',');await p.mouse.move(+x,+y);} else if(s.startsWith('chk:')){await p.click(`label:has-text("${s.slice(4)}")`);} else if(s.startsWith('wheel:')){const [x,y,dy]=s.slice(6).split(',').map(Number);await p.mouse.move(x,y);await p.mouse.wheel(0,dy);} else if(s.startsWith('dbl:')){await p.mouse.dblclick(...s.slice(4).split(',').map(Number));} else if(s.startsWith('type:')){await p.fill('input[role=combobox]',s.slice(5));} else if(s.startsWith('key:')){await p.keyboard.press(s.slice(4));} else if(s.startsWith('text:')){await p.click('text='+s.slice(5));} else if(s.startsWith('click:')){await p.mouse.click(...s.slice(6).split(',').map(Number));} else {await p.click(`button:has-text("${s}")`);} }
  console.log('done'); await b.close(); srv.close();
})();
