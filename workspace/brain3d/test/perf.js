const { chromium } = require('playwright-core');
const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/av-build';const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json'};
const srv=http.createServer((q,r)=>{let u=q.url.split('?')[0];let f=path.join(root,u==='/'?'index.html':u);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8899);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
const p=await b.newPage({viewport:{width:1360,height:900}});const t0=Date.now();
p.on('response',async r=>{const u=r.url();if(/models|data/.test(u)){const h=r.headers()['content-length'];console.log(((Date.now()-t0)/1000).toFixed(1),'s',u.split('/').pop(),h)}});
await p.route('https://fonts.*/**',r=>r.abort());
await p.goto('http://localhost:8899/#/app/lab',{waitUntil:'load'});
for(let i=0;i<8;i++){await p.waitForTimeout(3000);console.log('t',((Date.now()-t0)/1000).toFixed(0))}
await b.close();srv.close();})();
