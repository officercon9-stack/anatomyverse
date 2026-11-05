// centroid+extent based alignment: moves minor island's centroid to touch the
// main island's nearest surface point, along the centroid-to-centroid axis,
// instead of relying on a single (possibly degenerate) closest vertex pair.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const file=process.argv[2]; const nm=process.argv[3];
const doc=await io.read(file);
for(const n of doc.getRoot().listNodes()){
  if(n.getName()!==nm) continue;
  const me=n.getMesh(); const pr=me.listPrimitives()[0];
  const pos=pr.getAttribute('POSITION'); const ind=pr.getIndices();
  const I=ind.getArray(); const V=pos.getCount();
  const P=new Array(V); for(let i=0;i<V;i++){const p=[0,0,0];pos.getElement(i,p);P[i]=p}
  const key=(p)=>Math.round(p[0]*20000)+','+Math.round(p[1]*20000)+','+Math.round(p[2]*20000);
  const rep=new Map(),id=new Array(V);for(let i=0;i<V;i++){const k=key(P[i]);if(!rep.has(k))rep.set(k,i);id[i]=rep.get(k)}
  const par=[...Array(V).keys()];const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};
  for(let t=0;t<I.length;t+=3){const a=f(id[I[t]]),b=f(id[I[t+1]]),c=f(id[I[t+2]]);par[b]=a;par[c]=a}
  const compVerts=new Map(); for(let i=0;i<V;i++){const r=f(id[i]);if(!compVerts.has(r))compVerts.set(r,[]);compVerts.get(r).push(i)}
  const compTris=new Map(); for(let t=0;t<I.length;t+=3){const r=f(id[I[t]]);compTris.set(r,(compTris.get(r)||0)+1)}
  const roots=[...compTris.keys()].sort((a,b)=>compTris.get(b)-compTris.get(a));
  const mainRoot=roots[0], minorRoot=roots[1];
  const mainVerts=compVerts.get(mainRoot), minorVerts=compVerts.get(minorRoot);
  const centroid=(vs)=>{const c=[0,0,0];for(const v of vs){c[0]+=P[v][0];c[1]+=P[v][1];c[2]+=P[v][2]}return c.map(x=>x/vs.length)};
  const cMain=centroid(mainVerts), cMinor=centroid(minorVerts);
  const axis=[cMinor[0]-cMain[0],cMinor[1]-cMain[1],cMinor[2]-cMain[2]];
  const alen=Math.hypot(...axis); const u=axis.map(x=>x/alen);
  // project each vertex onto axis u, find main's max extent along u and minor's min extent along u
  const proj=(p)=>p[0]*u[0]+p[1]*u[1]+p[2]*u[2];
  let mainMax=-1e9; for(const v of mainVerts) mainMax=Math.max(mainMax, proj(P[v]));
  let minorMin=1e9; for(const v of minorVerts) minorMin=Math.min(minorMin, proj(P[v]));
  const gap = minorMin - mainMax; // how far minor's near edge is beyond main's far edge along axis
  console.log(nm,'axis gap (projected)',gap.toFixed(5));
  const moveAmt = gap - 0.0002; // close to a hair's width of contact
  const off = u.map(x=>-x*moveAmt);
  for(const v of minorVerts){ P[v]=[P[v][0]+off[0],P[v][1]+off[1],P[v][2]+off[2]]; pos.setElement(v,P[v]); }
}
await io.write(file, doc);
console.log('wrote',file);
