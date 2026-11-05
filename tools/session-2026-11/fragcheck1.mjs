import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const doc=await io.read(process.argv[2]);
const target=process.argv[3];
for(const n of doc.getRoot().listNodes()){
 if(n.getName()!==target) continue;
 const me=n.getMesh();if(!me)continue;
 const pr=me.listPrimitives()[0];const pos=pr.getAttribute('POSITION');const ind=pr.getIndices();
 const I=ind.getArray();const V=pos.getCount();
 const key=(i)=>{const p=[0,0,0];pos.getElement(i,p);return Math.round(p[0]*20000)+','+Math.round(p[1]*20000)+','+Math.round(p[2]*20000)};
 const rep=new Map(),id=new Array(V);for(let i=0;i<V;i++){const k=key(i);if(!rep.has(k))rep.set(k,i);id[i]=rep.get(k)}
 const par=[...Array(V).keys()];const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};
 for(let t=0;t<I.length;t+=3){const a=f(id[I[t]]),b=f(id[I[t+1]]),c=f(id[I[t+2]]);par[b]=a;par[c]=a}
 const comp=new Map();for(let t=0;t<I.length;t+=3){const r=f(id[I[t]]);comp.set(r,(comp.get(r)||0)+1)}
 const sizes=[...comp.values()].sort((a,b)=>b-a);
 console.log(target,'tris',I.length/3,'components',sizes.length,'sizes',sizes.join(','));
}
