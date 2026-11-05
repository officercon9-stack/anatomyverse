import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
await MeshoptDecoder.ready;
const files=process.argv.slice(2);
const S=[]; // {name,P,comp:[ids]}
for(const f of files){const doc=await io.read(f);
 for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const w=n.getWorldMatrix();const p=[0,0,0];
  const P=[];const tris=[];let off=0;
  for(const pr of m.listPrimitives()){const pos=pr.getAttribute('POSITION');const ind=pr.getIndices();
   for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}
   const I=ind?ind.getArray():[...Array(pos.getCount()).keys()];for(let t=0;t<I.length;t++)tris.push(I[t]+off);off+=pos.getCount();}
  S.push({name:n.getName(),P,tris});}}
const key=v=>v.map(x=>Math.round(x*20000)).join(',');
// components
for(const s of S){const V=s.P.length;const rep=new Map(),id=[];s.P.forEach((v,i)=>{const k=key(v);if(!rep.has(k))rep.set(k,i);id[i]=rep.get(k)});
 const par=[...Array(V).keys()];const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};
 for(let t=0;t<s.tris.length;t+=3){const a=f(id[s.tris[t]]),b=f(id[s.tris[t+1]]),c=f(id[s.tris[t+2]]);par[b]=a;par[c]=a}
 s.cid=s.P.map((_,i)=>f(id[i]));}
// spatial hash of all vertices, cell 6mm
const C=0.006;const H=new Map();const ck=(x,y,z)=>Math.floor(x/C)+','+Math.floor(y/C)+','+Math.floor(z/C);
S.forEach((s,si)=>s.P.forEach((v,i)=>{if(i%1!==0)return;const k=ck(...v);let a=H.get(k);if(!a)H.set(k,a=[]);a.push([si,i])}));
function nearOther(si,v,r){const cx=Math.floor(v[0]/C),cy=Math.floor(v[1]/C),cz=Math.floor(v[2]/C);const R=Math.ceil(r/C);let best=1e9;
 for(let x=-R;x<=R;x++)for(let y=-R;y<=R;y++)for(let z=-R;z<=R;z++){const a=H.get((cx+x)+','+(cy+y)+','+(cz+z));if(!a)continue;for(const [sj,j] of a){if(sj===si)continue;const q=S[sj].P[j];const d=Math.hypot(q[0]-v[0],q[1]-v[1],q[2]-v[2]);if(d<best)best=d}}return best}
const out=[];const R=0.012;
S.forEach((s,si)=>{if(!/^[mtf]_/.test(s.name))return;
 const byc=new Map();s.P.forEach((v,i)=>{const c=s.cid[i];let a=byc.get(c);if(!a)byc.set(c,a=[]);a.push(i)});
 for(const [c,idx] of byc){ if(idx.length<4)continue; let mind=1e9;const step=Math.max(1,Math.floor(idx.length/60));
  for(let k=0;k<idx.length;k+=step){const d=nearOther(si,s.P[idx[k]],R);if(d<mind)mind=d;if(mind<0.0015)break}
  if(mind>0.0045){let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];idx.forEach(i=>{for(let d=0;d<3;d++){lo[d]=Math.min(lo[d],s.P[i][d]);hi[d]=Math.max(hi[d],s.P[i][d])}});
   out.push({name:s.name,verts:idx.length,mind:+(mind*1000).toFixed(1),lo:lo.map(v=>+v.toFixed(3)),hi:hi.map(v=>+v.toFixed(3)),ncomp:byc.size});}}});
fs.writeFileSync('float.json',JSON.stringify(out,null,0));
console.log(out.length);out.sort((a,b)=>b.verts-a.verts).slice(0,60).forEach(o=>console.log(o.name.padEnd(36),o.verts,'d>',o.mind,'mm','y',o.lo[1],o.hi[1],'x',o.lo[0],o.hi[0],'comps',o.ncomp));
