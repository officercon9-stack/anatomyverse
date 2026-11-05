import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
await MeshoptDecoder.ready;
const [file,name]=process.argv.slice(2);
const doc=await io.read(file);const n=doc.getRoot().listNodes().find(x=>x.getName()===name);
const w=n.getWorldMatrix();const prim=n.getMesh().listPrimitives()[0];const pos=prim.getAttribute('POSITION'),ind=prim.getIndices();
const V=pos.getCount();const P=[];const p=[0,0,0];
for(let i=0;i<V;i++){pos.getElement(i,p);P.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}
// weld by position to connect split vertices
const key=v=>v.map(x=>Math.round(x*20000)).join(',');const rep=new Map(),id=[];
P.forEach((v,i)=>{const k=key(v);if(!rep.has(k))rep.set(k,i);id[i]=rep.get(k)});
const par=[...Array(V).keys()];const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};
const I=ind.getArray();for(let t=0;t<I.length;t+=3){const a=f(id[I[t]]),b=f(id[I[t+1]]),c=f(id[I[t+2]]);par[b]=a;par[c]=a}
const comp=new Map();for(let t=0;t<I.length;t+=3){const r=f(id[I[t]]);const c=comp.get(r)||comp.set(r,{tris:0,mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]}).get(r);c.tris++;for(let k=0;k<3;k++){const v=P[I[t+k]];for(let d=0;d<3;d++){c.mn[d]=Math.min(c.mn[d],v[d]);c.mx[d]=Math.max(c.mx[d],v[d])}}}
const arr=[...comp.values()].sort((a,b)=>b.mx[1]-a.mx[1]);
console.log(name,'verts',V,'tris',I.length/3,'components',arr.length);
arr.forEach((c,i)=>console.log(i,c.tris,c.mn.map(v=>v.toFixed(3)).join(','),'|',c.mx.map(v=>v.toFixed(3)).join(',')));
