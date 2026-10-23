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
  const r=await p.evaluate(()=>{const out=[];globalThis.__scn.traverse(o=>{if(o.isMesh&&/lobe|diaphragm|bronchial/.test(o.userData.structureId||'')){o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox;const m=Array.isArray(o.material)?o.material[0]:o.material;let vis=true,q=o;while(q){if(!q.visible)vis=false;q=q.parent}out.push([o.userData.structureId,vis,m.opacity,m.transparent,m.side,m.depthWrite,[bb.min.x,bb.min.y,bb.min.z,bb.max.x,bb.max.y,bb.max.z].map(v=>+v.toFixed(2)),o.renderOrder])}});return JSON.stringify(out)});
  console.log(r); await b.close(); srv.close();
})();
