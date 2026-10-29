const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve('live29'),port=8270;
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);let f=path.join(root,p);fs.readFile(f,(e,d)=>{if(e&&!path.extname(f))return fs.readFile(path.join(root,'index.html'),(e2,d2)=>{r.writeHead(200,{'content-type':'text/html'});r.end(d2)});if(e){r.writeHead(404);r.end();return}const t={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(d)})}).listen(port);
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();
await pg.goto(`http://localhost:${port}/#/legal/sources`);await pg.waitForTimeout(6000);
console.log(await pg.evaluate(()=>document.body.innerText.slice(0,6000)));await pg.screenshot({path:'legal.png',fullPage:true});await b.close();process.exit(0)})();
