const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve('live29');
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';let f=path.join(root,p);
 fs.readFile(f,(e,d)=>{if(e&&!path.extname(f)){f=path.join(root,'index.html');return fs.readFile(f,(e2,d2)=>{r.writeHead(200,{'content-type':'text/html'});r.end(d2)})}
 if(e){r.writeHead(404);r.end();return}const t={'.js':'text/javascript','.html':'text/html','.css':'text/css','.glb':'model/gltf-binary','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(d)})}).listen(8141);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});const pg=await c.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8141/#/app/lab',{waitUntil:'load'});await pg.waitForTimeout(24000);
await pg.evaluate(()=>{[...document.querySelectorAll('button')].filter(b=>/got it/i.test(b.textContent)).forEach(b=>b.click())});
const box=await pg.$('input[placeholder*="Search"]');await box.fill('skull');await pg.waitForTimeout(1500);
await pg.evaluate(()=>{const o=[...document.querySelectorAll('button,li,[role=option]')].find(e=>/^skull/i.test(e.textContent.trim())&&e.offsetParent);if(o)o.click()});
await pg.waitForTimeout(2200);
await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/^\s*isolate/i.test(b.textContent));if(b)b.click()});
await pg.waitForTimeout(3500);
// close the floating info card so it doesn't cover the skull
await pg.evaluate(()=>{[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&/^×$|close/i.test((b.textContent||'')+(b.getAttribute('aria-label')||''))).slice(0,1).forEach(b=>b.click())});
await pg.waitForTimeout(800);
await pg.screenshot({path:'ph_iso2.png'});
const nm=()=>pg.evaluate(()=>{let best=null,fs=0;for(const d of document.querySelectorAll('h1,h2,h3,div,span')){if(!d.offsetParent||d.children.length)continue;const r=d.getBoundingClientRect();if(r.left<900||r.top>140||r.top<50)continue;const f=parseFloat(getComputedStyle(d).fontSize);if(f>fs&&d.textContent.trim()){fs=f;best=d.textContent.trim()}}return best||'(none)'});
await pg.screenshot({path:'ph_iso3.png'});
await pg.evaluate(()=>{[...document.querySelectorAll('#av-skull-tools button')].find(b=>b.textContent==='Open jaw').click()});await pg.waitForTimeout(2200);await pg.screenshot({path:'ph_open.png'});
await pg.evaluate(()=>{[...document.querySelectorAll('#av-skull-tools button')].find(b=>b.textContent==='Open jaw').click();[...document.querySelectorAll('#av-skull-tools button')].find(b=>b.textContent==='Labels').click()});await pg.waitForTimeout(3500);await pg.screenshot({path:'ph_labels.png'});
console.log('bar present',await pg.evaluate(()=>!!document.getElementById('av-skull-tools')));
console.log('ERRS',errs.slice(0,3));
await c.close();await b.close();srv.close()})();
