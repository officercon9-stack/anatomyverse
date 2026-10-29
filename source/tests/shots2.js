const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve('live29'),port=8291;
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';let f=path.join(root,p);fs.readFile(f,(e,d)=>{if(e&&!path.extname(f))return fs.readFile(path.join(root,'index.html'),(e2,d2)=>{r.writeHead(200,{'content-type':'text/html'});r.end(d2)});if(e){r.writeHead(404);r.end();return}const t={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.glb':'model/gltf-binary','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(d)})}).listen(port);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:3,hasTouch:true,isMobile:true});await ctx.addInitScript(()=>{try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}});
const pg=await ctx.newPage();
const go=async(h,w)=>{await pg.goto(`http://localhost:${port}/#${h}`);await pg.waitForTimeout(w||9000);await pg.evaluate(()=>{[...document.querySelectorAll('button')].filter(b=>/got it|dismiss|I understand/i.test(b.textContent)).forEach(b=>b.click())});await pg.waitForTimeout(800)};

for(const [q,n] of [['eye','3_eye_plain']]){
 await go('/app/lab',14000);const box=await pg.$('input[placeholder*="Search"]');await box.fill(q);await pg.waitForTimeout(1500);
 await pg.evaluate(q=>{const o=[...document.querySelectorAll('button,li,[role=option]')].find(e=>new RegExp('^'+q,'i').test(e.textContent.trim())&&e.offsetParent);if(o)o.click()},q);await pg.waitForTimeout(2200);
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/^\s*isolate/i.test(b.textContent));if(b)b.click()});await pg.waitForTimeout(2500);
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/focus camera/i.test(b.textContent));if(b)b.click()});await pg.waitForTimeout(3500);
 await pg.evaluate(()=>{[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&/^×$|close/i.test((b.textContent||'')+(b.getAttribute('aria-label')||''))).slice(0,1).forEach(b=>b.click())});await pg.waitForTimeout(800);
 await pg.waitForTimeout(2500);await pg.screenshot({path:`shots/${n}.png`})}
await b.close();process.exit(0)})();
