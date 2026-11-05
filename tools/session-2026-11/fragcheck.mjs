import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const doc=await io.read(process.argv[2]);
const out=[];
for(const n of doc.getRoot().listNodes()){const me=n.getMesh();if(!me||!/^[tm]_/.test(n.getName()))continue;
 const pr=me.listPrimitives()[0];const pos=pr.getAttribute('POSITION');const ind=pr.getIndices();if(!ind)continue;
 const I=ind.getArray();const V=pos.getCount();
 const key=(i)=>{const p=[0,0,0];pos.getElement(i,p);return Math.round(p[0]*20000)+','+Math.round(p[1]*20000)+','+Math.round(p[2]*20000)};
 const rep=new Map(),id=new Array(V);for(let i=0;i<V;i++){const k=key(i);if(!rep.has(k))rep.set(k,i);id[i]=rep.get(k)}
 const par=[...Array(V).keys()];const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};
 for(let t=0;t<I.length;t+=3){const a=f(id[I[t]]),b=f(id[I[t+1]]),c=f(id[I[t+2]]);par[b]=a;par[c]=a}
 const comp=new Map();for(let t=0;t<I.length;t+=3){const r=f(id[I[t]]);comp.set(r,(comp.get(r)||0)+1)}
 const sizes=[...comp.values()].sort((a,b)=>b-a);
 const tris=I.length/3;
 // "fragmented" = more than 1 component AND at least 2 components each hold a non-trivial share (not just 1 stray triangle)
 const major=sizes.filter(s=>s>=tris*0.03).length;
 if(major>=2) out.push({name:n.getName(),tris,components:sizes.length,majorComponents:major,sizes:sizes.slice(0,6)});
}
out.sort((a,b)=>b.majorComponents-a.majorComponents);
console.log('t_/m_ meshes with >=2 major disconnected pieces:',out.length,'of total t_/m_ meshes:',[...doc.getRoot().listNodes()].filter(n=>n.getMesh()&&/^[tm]_/.test(n.getName())).length);
out.forEach(o=>console.log(o.name.padEnd(40),'tris',o.tris,'majorPieces',o.majorComponents,'sizes',o.sizes.join(',')));
