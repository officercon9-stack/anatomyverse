const { chromium } = require('playwright-core');
const http=require('http'),fs=require('fs'),path=require('path');
const root='/home/claude/av-build';const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const PORT=9000+Math.floor(Math.random()*90);
const srv=http.createServer((q,r)=>{let u=q.url.split('?')[0];let f=path.join(root,u==='/'?'index.html':u);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(PORT);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
const p=await b.newPage({viewport:{width:1360,height:900}});p.on('console',m=>{if(m.type()==='error')console.log('CE',m.text().slice(0,400))});p.on('pageerror',e=>console.log('PAGEERR',e.message));await p.route('https://fonts.*/**',r=>r.abort());
p.on('requestfailed',r=>console.log('REQFAIL',r.url().slice(0,100)));p.on('response',r=>{if(r.status()>=400)console.log('HTTP',r.status(),r.url().slice(0,100))});
for(const [r,act] of [['app/lab',null],['app/flashcards',null],['app/quiz','button:has-text("Start practice quiz")'],['app/lessons',null],['app/clinical','a:has-text("Mid-shaft")'],['app/dictionary',null],['app/account',null],['app/dashboard',null]]){
 const q=await b.newPage({viewport:{width:1360,height:900}});q.on('console',m=>{if(m.type()==='error'&&!/Failed to load/.test(m.text()))console.log('CE',r,m.text().slice(0,200))});await q.route('https://fonts.*/**',x=>x.abort());
 await q.goto(`http://localhost:${PORT}/#/${r}`,{waitUntil:'load'});await q.waitForTimeout(r==='app/lab'?6000:2000);
 if(act){try{await q.click(act,{timeout:3000});await q.waitForTimeout(2000)}catch(e){console.log('NOCLICK',r)}}
 await q.screenshot({path:'c_'+r.replace('/','_')+'.png'});await q.close();}
await b.close();srv.close();})();
