const H=require('./h');H.serve(process.argv[2],8940);const W=+process.argv[3]||390,Hh=+process.argv[4]||844;
(async()=>{const {b,ctx,pg}=await H.open(8940,W,Hh,'/app/lab',13000);const c=await ctx.newCDPSession(pg);await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:200});
const cv=await pg.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/3}});
await c.send('Profiler.start');const t=Date.now();
await pg.mouse.move(cv.x,cv.y);await pg.mouse.down();for(let i=0;i<40;i++){await pg.mouse.move(cv.x+i*4,cv.y+(i%5));await pg.waitForTimeout(25)}await pg.mouse.up();await pg.waitForTimeout(800);
const {profile}=await c.send('Profiler.stop');const dt=Date.now()-t;
const self={};const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const cnt={};profile.samples.forEach(s=>cnt[s]=(cnt[s]||0)+1);
for(const id in cnt){const n=byId[id];const f=n.callFrame;const k=(f.functionName||'(anon)')+' '+f.url.split('/').pop().slice(0,30)+':'+f.lineNumber+':'+f.columnNumber;self[k]=(self[k]||0)+cnt[id]}
const tot=profile.samples.length;console.log('wall ms',dt,'samples',tot);Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,25).forEach(([k,v])=>console.log((100*v/tot).toFixed(1)+'%',k));
await b.close();process.exit(0)})();
