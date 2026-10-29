// node sh2.js ROOT PORT TAG isolatedJSON  views JSON [[name,pos,tgt],...]
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(process.argv[2]),port=+process.argv[3],tag=process.argv[4],iso=JSON.parse(process.argv[5]),views=JSON.parse(process.argv[6]),pre=process.argv[7]||'';
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';let f=path.join(root,p);
 fs.readFile(f,(e,d)=>{if(e&&!path.extname(f)){return fs.readFile(path.join(root,'index.html'),(e2,d2)=>{r.writeHead(200,{'content-type':'text/html'});r.end(d2)})}
 if(e){r.writeHead(404);r.end();return}const t={'.js':'text/javascript','.html':'text/html','.css':'text/css','.glb':'model/gltf-binary','.json':'application/json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(d)})}).listen(port);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const pg=await (await b.newContext({viewport:{width:900,height:900}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto(`http://localhost:${port}/#/app/lab`);await pg.waitForTimeout(24000);
await pg.evaluate(()=>{[...document.querySelectorAll('button')].filter(b=>/got it/i.test(b.textContent)).forEach(b=>b.click())});

if(pre)console.log(await pg.evaluate(pre));
await pg.waitForTimeout(2500);
for(const [n,p,t] of views){await pg.evaluate(([p,t])=>{const R=globalThis.__r3;R.camera.position.set(...p);if(R.controls&&R.controls.target){R.controls.target.set(...t);R.controls.update&&R.controls.update()}R.camera.lookAt(...t);R.camera.updateProjectionMatrix();R.invalidate()},[p,t]);await pg.waitForTimeout(1500);await pg.screenshot({path:`${tag}_${n}.png`})}
console.log('ERRS',errs.slice(0,3));await b.close();srv.close()})();
