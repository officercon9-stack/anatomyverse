const H=require('./h');const port=9400+Math.floor(Math.random()*90);H.serve('ghclone',port);
(async()=>{const {b,pg,errs}=await H.open(port,900,760,'/app/lab',14000);
await pg.evaluate(()=>{const a=globalThis.__avb;const s=a.get();const o={};for(const k of Object.keys(s)){if(typeof s[k]==='boolean')o[k]=true}a.set(o)});
await pg.waitForTimeout(30000);
const r=await pg.evaluate(()=>{const THREE=null;const out=[];const sc=globalThis.__r3s.get().scene;sc.updateMatrixWorld(true);
sc.traverse(x=>{if(!x.isMesh||!x.geometry)return;let v=true,p=x;while(p){if(p.visible===false){v=false;break}p=p.parent}if(!v)return;
const g=x.geometry;const pos=g.attributes.position;if(!pos||pos.count<20)return;const m=x.matrixWorld.elements;let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9],c=[0,0,0];
const step=Math.max(1,Math.floor(pos.count/400));let n=0;for(let i=0;i<pos.count;i+=step){const px=pos.getX(i),py=pos.getY(i),pz=pos.getZ(i);const w=[m[0]*px+m[4]*py+m[8]*pz+m[12],m[1]*px+m[5]*py+m[9]*pz+m[13],m[2]*px+m[6]*py+m[10]*pz+m[14]];for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],w[k]);hi[k]=Math.max(hi[k],w[k]);c[k]+=w[k]}n++}
out.push({name:x.name||x.parent&&x.parent.name||'?',par:x.parent?x.parent.name:'',lo,hi,c:c.map(q=>q/n),n:pos.count})});return out});
require('fs').writeFileSync('/tmp/jx/vis.json',JSON.stringify(r));console.log(r.length,'ERR',errs.slice(0,3));await b.close();process.exit(0)})();
