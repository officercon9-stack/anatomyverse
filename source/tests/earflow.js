const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve('live29'),port=8250,Q=process.argv[2],TAG=process.argv[3],TOOLS=process.argv[4].split(','),W=+process.argv[5]||1280,H=+process.argv[6]||900;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';let f=path.join(root,p);
 fs.readFile(f,(e,d)=>{if(e&&!path.extname(f)){return fs.readFile(path.join(root,'index.html'),(e2,d2)=>{r.writeHead(200,{'content-type':'text/html'});r.end(d2)})}
 if(e){r.writeHead(404);r.end();return}const t={'.js':'text/javascript','.html':'text/html','.css':'text/css','.glb':'model/gltf-binary','.json':'application/json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(d)})}).listen(port);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:W,height:H},hasTouch:W<600,isMobile:W<600});const pg=await c.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('response',r=>{if(r.status()>=400)errs.push('R'+r.status()+' '+r.url())});pg.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,300))});
await pg.goto(`http://localhost:${port}/#/app/lab`);await pg.waitForTimeout(24000);
await pg.evaluate(()=>{[...document.querySelectorAll('button')].filter(b=>/got it/i.test(b.textContent)).forEach(b=>b.click())});
console.log('pre-search errs',errs.slice(0,3));const box=await pg.$('input[placeholder*="Search"]');if(!box){console.log(await pg.evaluate(()=>document.body.innerText.slice(0,200)));process.exit(1)}await box.fill(Q);await pg.waitForTimeout(1500);
await pg.evaluate(q=>{const o=[...document.querySelectorAll('button,li,[role=option]')].find(e=>new RegExp('^'+q,'i').test(e.textContent.trim())&&e.offsetParent);if(o)o.click()},Q);
await pg.waitForTimeout(2200);
console.log('panel title:',await pg.evaluate(()=>{let best='',fs=0;for(const d of document.querySelectorAll('h1,h2,h3')){if(!d.offsetParent)continue;const r=d.getBoundingClientRect();const f=parseFloat(getComputedStyle(d).fontSize);if(r.left>800&&f>fs){fs=f;best=d.textContent}}return best}));
await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/^\s*isolate/i.test(b.textContent));if(b)b.click()});await pg.waitForTimeout(2500);
await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/focus camera/i.test(b.textContent));if(b)b.click()});await pg.waitForTimeout(3500);
await pg.evaluate(()=>{[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&/^×$|close/i.test((b.textContent||'')+(b.getAttribute('aria-label')||''))).slice(0,1).forEach(b=>b.click())});await pg.waitForTimeout(800);
console.log('tools:',await pg.evaluate(()=>{const e=document.getElementById('av-skull-tools');return e?getComputedStyle(e).display+' '+[...e.querySelectorAll('button')].filter(b=>b.style.display!=='none').map(b=>b.textContent).join(','):'none'}));
await pg.screenshot({path:TAG+'_0.png'});
for(const t of TOOLS){await pg.evaluate(t=>{const b=document.querySelector('#av-skull-tools button[data-tool="'+t+'"]');if(b&&b.style.display!=='none')b.click()},t);await pg.waitForTimeout(2500);await pg.screenshot({path:TAG+'_'+t+'.png'})}
console.log('POP',await pg.evaluate(()=>{const t=document.body.textContent;return ['Tarsal plates','Zonular','Eyelids and lens','Optic nerve'].map(k=>k+':'+t.includes(k)).join(' ')}));console.log('ERRS',errs.slice(0,3));await b.close();srv.close()})();
