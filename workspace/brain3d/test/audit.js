const { chromium } = require('playwright-core');
const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/av-build';const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const PORT=8900+Math.floor(Math.random()*90);
const srv=http.createServer((q,r)=>{let u=q.url.split('?')[0];let f=path.join(root,u==='/'?'index.html':u);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(PORT);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
const p=await b.newPage({viewport:{width:1360,height:900}});p.on('pageerror',e=>console.log('PAGEERR',e.message));await p.route('https://fonts.*/**',r=>r.abort());
for(const r of ['','app/dashboard','app/systems','app/lessons','app/quiz','app/flashcards','app/clinical','app/tutor','app/dictionary','app/account','app/admin']){
 await p.goto(`http://localhost:${PORT}/#/${r}`,{waitUntil:'load'});await p.waitForTimeout(2500);
 const items=await p.evaluate(()=>[...document.querySelectorAll('main button, main a, [role=main] button, #root button, #root a')].map(e=>(e.tagName[0]+':'+(e.innerText||e.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,40)+(e.disabled?' [disabled]':''))).filter((v,i,a)=>a.indexOf(v)===i));
 console.log('==',r,'\n',items.join(' | '));
 await p.screenshot({path:'a_'+(r.replace('/','_')||'home')+'.png'});}
await b.close();srv.close();})();
