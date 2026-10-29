const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const Z='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/zanat/Assets/Models/1.0 Models/';
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);let f=p.startsWith('/fbx/')?Z+p.slice(5):path.join(__dirname,p==='/'?'bb.html':p);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}const t={'.js':'text/javascript','.html':'text/html'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(d)})}).listen(8301);
(async()=>{const b=await chromium.launch();const pg=await b.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));await pg.goto('http://localhost:8301/');await pg.waitForFunction('window.ready');
const r=await pg.evaluate(([f,n])=>window.bbs('/fbx/'+f,n),[process.argv[2],process.argv.slice(3)]);
console.log(JSON.stringify(r,(k,v)=>typeof v==='number'?+v.toFixed(4):v,0));await b.close();srv.close()})();
