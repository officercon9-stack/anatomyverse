// Robust version: closes gap with a generous overlap margin (in WORLD units,
// converted to local via node scale) to survive meshopt re-quantization on write.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const file=process.argv[2]; const targets=process.argv.slice(3);
const WORLD_OVERLAP_M = 0.002; // 2mm world-space overlap margin to survive requantization
const doc=await io.read(file);
for(const n of doc.getRoot().listNodes()){
  if(!targets.includes(n.getName())) continue;
  const scale=n.getScale(); const avgScale=(Math.abs(scale[0])+Math.abs(scale[1])+Math.abs(scale[2]))/3;
  const localOverlap = WORLD_OVERLAP_M/avgScale;
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
  const compTris=new Map(); for(let t=0;t<I.length;t+=3){const r=f(id[I[t]]);compTris.set(r,(compTris.get(r)||0)+1)}
  const totalTris=I.length/3;
  const roots=[...compTris.keys()].sort((a,b)=>compTris.get(b)-compTris.get(a));
  const mainRoot=roots[0]; const mainVerts=compVerts.get(mainRoot);
  console.log(n.getName(),'components',roots.length,'sizes',roots.map(r=>compTris.get(r)).join(','),'localOverlap',localOverlap.toFixed(5));
  const dropTriIdx=new Set();
  for(let ri=1;ri<roots.length;ri++){
    const r=roots[ri]; const tris=compTris.get(r); const verts=compVerts.get(r);
    if(tris<8){ for(let t=0;t<I.length;t+=3){ if(f(id[I[t]])===r) dropTriIdx.add(t); } console.log('  drop noise',r,tris); continue; }
    if(tris < totalTris*0.03){ console.log('  leave small island',r,tris); continue; }
    const centroid=(vs)=>{const c=[0,0,0];for(const v of vs){c[0]+=P[v][0];c[1]+=P[v][1];c[2]+=P[v][2]}return c.map(x=>x/vs.length)};
    const cMain=centroid(mainVerts), cMinor=centroid(verts);
    const axis=[cMinor[0]-cMain[0],cMinor[1]-cMain[1],cMinor[2]-cMain[2]];
    const alen=Math.hypot(...axis); const u=axis.map(x=>x/alen);
    const proj=(p)=>p[0]*u[0]+p[1]*u[1]+p[2]*u[2];
    let mainMax=-1e9; for(const v of mainVerts) mainMax=Math.max(mainMax, proj(P[v]));
    let minorMin=1e9; for(const v of verts) minorMin=Math.min(minorMin, proj(P[v]));
    const gap = minorMin - mainMax;
    const moveAmt = gap + localOverlap; // close gap AND overlap by the margin
    const off = u.map(x=>-x*moveAmt);
    console.log('  major island',r,tris,'axisGap',gap.toFixed(5),'moving by',moveAmt.toFixed(5));
    for(const v of verts){ P[v]=[P[v][0]+off[0],P[v][1]+off[1],P[v][2]+off[2]]; pos.setElement(v,P[v]); }
  }
  if(dropTriIdx.size>0){
    const newI=[]; for(let t=0;t<I.length;t+=3){ if(!dropTriIdx.has(t)){ newI.push(I[t],I[t+1],I[t+2]); } }
    ind.setArray(new origIndType(newI));
    console.log('  dropped',dropTriIdx.size,'noise tris');
  }
}
await io.write(file, doc);
console.log('wrote',file);
