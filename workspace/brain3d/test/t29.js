const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/home/claude/av-build';
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const PORT=8900+Math.floor(Math.random()*90);
const srv = http.createServer((q, r) => { let u=q.url.split('?')[0]; let f=path.join(root,u==='/'?'index.html':u); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()) f=path.join(root,'index.html'); r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r); }).listen(PORT);
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
  const p=await b.newPage({viewport:{width:1360,height:900}});
  await p.route('https://fonts.*/**',r=>r.abort());
  await p.goto(`http://localhost:${PORT}/#/app/lab`,{waitUntil:'load'}); await p.waitForTimeout(9000);
  const r=await p.evaluate(()=>{const c=document.querySelector('canvas');const k=Object.keys(c).find(k=>k.startsWith('__r3f'));const st=c[k]?.store?.getState?.()||c[k]?.fiber?.getState?.();if(!st)return 'nostore:'+Object.keys(c).join(',');const out=[];st.scene.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox;const cx=(bb.min.x+bb.max.x)/2,cy=(bb.min.y+bb.max.y)/2;if(Math.abs(cx)>.27||cy<.3)out.push([o.name,o.userData.structureId,o.parent&&o.parent.name,+cx.toFixed(2),+cy.toFixed(2)])}});return JSON.stringify(out.slice(0,30))});
  console.log(r); await b.close(); srv.close();
})();
