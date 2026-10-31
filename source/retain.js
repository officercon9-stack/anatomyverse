const H=require('./h');H.serve(process.argv[2],9035);
(async()=>{const {b,ctx,pg}=await H.open(9035,390,844,'/app/lab',13000);const c=await ctx.newCDPSession(pg);
for(let i=0;i<2;i++){await pg.evaluate(()=>location.hash='#/app/dashboard');await pg.waitForTimeout(700);await pg.evaluate(()=>location.hash='#/app/lab');await pg.waitForTimeout(2500)}
await pg.evaluate(()=>location.hash='#/app/dashboard');await pg.waitForTimeout(1500);
await c.send('HeapProfiler.enable');await c.send('HeapProfiler.collectGarbage');let chunks=[];c.on('HeapProfiler.addHeapSnapshotChunk',e=>chunks.push(e.chunk));await c.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false});
const s=JSON.parse(chunks.join(''));const m=s.snapshot.meta;const NF=m.node_fields.length,EF=m.edge_fields.length;const nt=m.node_types[0],et=m.edge_types[0];const N=s.nodes,E=s.edges,S=s.strings;
const nName=i=>String(S[N[i*NF+m.node_fields.indexOf('name')]]).replace(/\s+/g,' ').slice(0,70),nType=i=>nt[N[i*NF]],nEc=i=>N[i*NF+m.node_fields.indexOf('edge_count')];
const nodeCount=N.length/NF;const first=new Array(nodeCount);let e=0;for(let i=0;i<nodeCount;i++){first[i]=e;e+=nEc(i)}
const rev=Array.from({length:nodeCount},()=>[]);
for(let i=0;i<nodeCount;i++){for(let k=0;k<nEc(i);k++){const ei=(first[i]+k)*EF;const typ=et[E[ei]];if(typ==='weak')continue;const to=E[ei+2]/NF;const nm=typ==='element'||typ==='hidden'?String(E[ei+1]):S[E[ei+1]];rev[to].push([i,typ,nm])}}
const cans=[];for(let i=0;i<nodeCount;i++){const n=nName(i);if(/HTMLCanvasElement|<canvas/.test(n)&&nType(i)==='native')cans.push(i)}
console.log('canvas nodes',cans.map(i=>nName(i)).join(' | '));
for(const ci of cans.slice(0,6)){ // BFS to a root (synthetic or Window)
 const prev=new Map([[ci,null]]);const q=[ci];let found=null;
 while(q.length&&!found){const x=q.shift();for(const [p,typ,nm] of rev[x]){if(prev.has(p))continue;prev.set(p,[x,typ,nm]);const pn=nName(p);if(/^Window /.test(pn)||/^\(Global handles|^\(Document DOM/.test(pn)){found=p;break}q.push(p)}}
 const path=[];let x=found;while(x!=null&&x!==ci){const [nx,typ,nm]=prev.get(x);path.push(nName(x).slice(0,50)+' -['+typ+':'+String(nm).slice(0,30)+']->');x=nx}
 console.log('\n'+nName(ci)+'\n  '+path.slice(-14).join('\n  '))}
await b.close();process.exit(0)})();
