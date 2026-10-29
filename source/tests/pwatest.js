const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve('live29'),port=8280;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';let f=path.join(root,p);fs.readFile(f,(e,d)=>{if(e&&!path.extname(f))return fs.readFile(path.join(root,'index.html'),(e2,d2)=>{r.writeHead(200,{'content-type':'text/html'});r.end(d2)});if(e){r.writeHead(404);r.end();return}const t={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.woff2':'font/woff2','.glb':'model/gltf-binary','.svg':'image/svg+xml'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(d)})}).listen(port);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:390,height:800},hasTouch:true,isMobile:true});const pg=await ctx.newPage();const errs=[],ext=[];
pg.on('pageerror',e=>errs.push(e.message));pg.on('request',r=>{if(!r.url().startsWith('http://localhost'))ext.push(r.url())});
await pg.goto(`http://localhost:${port}/#/app/lab`);await pg.waitForTimeout(12000);
await pg.screenshot({path:'pw_first.png'});
console.log('banner:',await pg.evaluate(()=>!!document.querySelector('[role=dialog][aria-label="Educational use notice"]')));
await pg.evaluate(()=>{[...document.querySelectorAll('button')].filter(b=>/I understand/.test(b.textContent)).forEach(b=>b.click())});
console.log('seen flag:',await pg.evaluate(()=>localStorage.getItem('av.disclaimerSeen')));
console.log('sw:',await pg.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return !!r.active}));
console.log('manifest:',await pg.evaluate(async()=>(await (await fetch('./manifest.webmanifest')).json()).name));
console.log('external requests:',ext);
await pg.waitForTimeout(9000);
await ctx.setOffline(true);await pg.reload();await pg.waitForTimeout(9000);
console.log('offline title:',await pg.title(),'| body has Anatomy:',await pg.evaluate(()=>/Anatomy|Skeletal/.test(document.body.innerText)));
await pg.screenshot({path:'pw_offline.png'});
for(const h of ['privacy','terms','contact','disclaimer']){await ctx.setOffline(false);await pg.goto(`http://localhost:${port}/#/legal/${h}`);await pg.waitForTimeout(7000);console.log(h,'->',(await pg.evaluate(()=>document.body.innerText)).slice(0,160).replace(/\n/g,' | '))}
console.log('ERRS',errs.slice(0,3));await b.close();srv.close();process.exit(0)})();
