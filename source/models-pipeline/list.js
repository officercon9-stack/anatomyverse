const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const Z='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/zanat/Assets/Models/1.0 Models/';
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);let f=p.startsWith('/fbx/')?Z+p.slice(5):path.join(__dirname,p==='/'?'list.html':p);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}const t={'.js':'text/javascript','.html':'text/html'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(d)})}).listen(8300);
(async()=>{const b=await chromium.launch();const pg=await b.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));await pg.goto('http://localhost:8300/');await pg.waitForFunction('window.ready');
const re=new RegExp(process.argv[3]||'.','i');
const r=await pg.evaluate(f=>window.loadList('/fbx/'+f),process.argv[2]);
console.log(process.argv[2],r.length);console.log(r.filter(x=>re.test(x[0])).map(x=>x.join(':')).join('\n'));await b.close();srv.close()})();
