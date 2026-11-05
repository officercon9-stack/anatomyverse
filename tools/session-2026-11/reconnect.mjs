// Reconnect disjoint mesh islands of a named node: keep largest component fixed,
// translate other "major" islands (>=3% tris) to touch it (closing real gaps),
// and drop tiny noise islands (<8 tris) as stray debris.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const file=process.argv[2];
const targets=process.argv.slice(3);
const doc=await io.read(file);
for(const n of doc.getRoot().listNodes()){
  if(!targets.includes(n.getName())) continue;
  const me=n.getMesh(); const pr=me.listPrimitives()[0];
  const pos=pr.getAttribute('POSITION'); const ind=pr.getIndices();
  const origIndType=ind.getArray().constructor;
  const I=Array.from(ind.getArray()); const V=pos.getCount();
  const P=new Array(V); for(let i=0;i<V;i++){const p=[0,0,0];pos.getElement(i,p);P[i]=p}
  const key=(p)=>Math.round(p[0]*20000)+','+Math.round(p[1]*20000)+','+Math.round(p[2]*20000);
  const rep=new Map(),id=new Array(V);for(let i=0;i<V;i++){const k=key(P[i]);if(!rep.has(k))rep.set(k,i);id[i]=rep.get(k)}
  const par=[...Array(V).keys()];const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};
  for(let t=0;t<I.length;t+=3){const a=f(id[I[t]]),b=f(id[I[t+1]]),c=f(id[I[t+2]]);par[b]=a;par[c]=a}
  const compVerts=new Map(); for(let i=0;i<V;i++){const r=f(id[i]);if(!compVerts.has(r))compVerts.set(r,[]);compVerts.get(r).push(i)}
  const compTris=new Map(); for(let t=0;t<I.length;t+=3){const r=f(id[I[t]]);if(!compTris.has(r))compTris.set(r,0);compTris.set(r,compTris.get(r)+1)}
  const totalTris=I.length/3;
  const roots=[...compTris.keys()].sort((a,b)=>compTris.get(b)-compTris.get(a));
  const mainRoot=roots[0];
  const mainVerts=compVerts.get(mainRoot);
  console.log(n.getName(),'components',roots.length,'sizes',roots.map(r=>compTris.get(r)).join(','));
  const dropTriIdx=new Set();
  const movedVerts=new Set();
  for(let ri=1;ri<roots.length;ri++){
    const r=roots[ri]; const tris=compTris.get(r); const verts=compVerts.get(r);
    if(tris<8){
      for(let t=0;t<I.length;t+=3){ if(f(id[I[t]])===r) dropTriIdx.add(t); }
      console.log('  drop noise island root',r,'tris',tris);
      continue;
    }
    if(tris < totalTris*0.03){
      console.log('  leaving small-but-not-tiny island root',r,'tris',tris,'(below major threshold - no change)');
      continue;
    }
    let best=null;
    for(const vi of verts){
      const p=P[vi];
      for(const mvi of mainVerts){
        const mp=P[mvi];
        const dx=p[0]-mp[0],dy=p[1]-mp[1],dz=p[2]-mp[2];
        const d2=dx*dx+dy*dy+dz*dz;
        if(!best||d2<best.d2) best={d2,dx,dy,dz};
      }
    }
    const d=Math.sqrt(best.d2);
    console.log('  major island root',r,'tris',tris,'local gap',d.toFixed(5));
    const shrink = Math.max(0, d-0.0001)/d;
    const off=[-best.dx*shrink,-best.dy*shrink,-best.dz*shrink];
    for(const vi of verts){ P[vi]=[P[vi][0]+off[0],P[vi][1]+off[1],P[vi][2]+off[2]]; movedVerts.add(vi); }
  }
  // write back positions via setElement (preserves accessor componentType/quantization)
  for(const vi of movedVerts){ pos.setElement(vi, P[vi]); }
  // rebuild indices dropping noise triangles, preserving original typed array type
  if(dropTriIdx.size>0){
    const newI=[];
    for(let t=0;t<I.length;t+=3){ if(!dropTriIdx.has(t)){ newI.push(I[t],I[t+1],I[t+2]); } }
    ind.setArray(new origIndType(newI));
    console.log('  dropped',dropTriIdx.size,'triangles of noise');
  }
}
await io.write(file, doc);
console.log('wrote', file);
