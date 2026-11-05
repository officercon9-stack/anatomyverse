import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const doc=await io.read(process.argv[2]);
const nm=process.argv[3];
for(const n of doc.getRoot().listNodes()){
  if(n.getName()!==nm) continue;
  const me=n.getMesh();const pr=me.listPrimitives()[0];
  const pos=pr.getAttribute('POSITION');const ind=pr.getIndices();
  const I=ind.getArray();const V=pos.getCount();
  const P=new Array(V); for(let i=0;i<V;i++){const p=[0,0,0];pos.getElement(i,p);P[i]=p}
  const key=(p)=>Math.round(p[0]*20000)+','+Math.round(p[1]*20000)+','+Math.round(p[2]*20000);
  const rep=new Map(),id=new Array(V);for(let i=0;i<V;i++){const k=key(P[i]);if(!rep.has(k))rep.set(k,i);id[i]=rep.get(k)}
  const par=[...Array(V).keys()];const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};
  for(let t=0;t<I.length;t+=3){const a=f(id[I[t]]),b=f(id[I[t+1]]),c=f(id[I[t+2]]);par[b]=a;par[c]=a}
  const compVerts=new Map(); for(let i=0;i<V;i++){const r=f(id[i]);if(!compVerts.has(r))compVerts.set(r,[]);compVerts.get(r).push(i)}
  const roots=[...compVerts.keys()];
  // find all pairwise distances, show min 10
  const pairs=[];
  for(const vi of compVerts.get(roots[0])) for(const vj of compVerts.get(roots[1])){
    const dx=P[vi][0]-P[vj][0],dy=P[vi][1]-P[vj][1],dz=P[vi][2]-P[vj][2];
    pairs.push(Math.hypot(dx,dy,dz));
  }
  pairs.sort((a,b)=>a-b);
  console.log(nm,'10 smallest cross-pair distances (local):', pairs.slice(0,10).map(x=>x.toFixed(4)));
  console.log(nm,'median cross-pair distance:', pairs[Math.floor(pairs.length/2)].toFixed(4));
}
