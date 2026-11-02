import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune } from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const tp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
const det=m=>m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])+m[8]*(m[1]*m[6]-m[2]*m[5]);
// analyse: per mesh, weld verts by position, build edge map, report closed? and signed volume
function analyse(node){const me=node.getMesh();const m=node.getWorldMatrix();const flipW=det(m)<0;
 const P=[],T=[];const p=[0,0,0];let off=0;
 for(const pr of me.listPrimitives()){const pos=pr.getAttribute('POSITION');const ind=pr.getIndices();
  for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push(tp(m,p))}
  const I=ind?ind.getArray():[...Array(pos.getCount()).keys()];for(let t=0;t<I.length;t+=3)T.push([I[t]+off,I[t+1]+off,I[t+2]+off]);off+=pos.getCount()}
 if(!T.length)return null;
 const key=v=>Math.round(v[0]*20000)+','+Math.round(v[1]*20000)+','+Math.round(v[2]*20000);
 const rep=new Map(),id=[];P.forEach((v,i)=>{const k=key(v);if(!rep.has(k))rep.set(k,i);id[i]=rep.get(k)});
 const E=new Map();let nonmanifold=0;
 for(const [a,b,c] of T){for(const [x,y] of [[a,b],[b,c],[c,a]]){const u=id[x],v=id[y];const k=u<v?u+'_'+v:v+'_'+u;const e=E.get(k)||{f:0,d:0};e.f++;e.d+=(u<v?1:-1);E.set(k,e)}}
 let boundary=0;for(const e of E.values()){if(e.f===1)boundary++;else if(e.f!==2)nonmanifold++;}
 let vol=0;for(const [a,b,c] of T){const A=P[a],B=P[b],C=P[c];vol+=(A[0]*(B[1]*C[2]-B[2]*C[1])-A[1]*(B[0]*C[2]-B[2]*C[0])+A[2]*(B[0]*C[1]-B[1]*C[0]))/6}
 if(flipW)vol=-vol;
 return {closed:boundary===0&&nonmanifold===0,boundary,nonmanifold,vol,tris:T.length};}
const mode=process.argv[2]; // 'report' | 'fix'
for(const f of process.argv.slice(3)){const doc=await io.read(f);const hits=[];let closed=0,open=0;
 for(const n of doc.getRoot().listNodes()){if(!n.getMesh())continue;const r=analyse(n);if(!r)continue;
  if(r.closed)closed++;else open++;
  if(r.closed&&r.vol<0)hits.push(n);}
 console.log(f.split('/').pop(),'closed',closed,'open',open,'INSIDE-OUT(closed,neg vol)',hits.length);
 hits.slice(0,40).forEach(n=>console.log('   ',n.getName()));
 if(mode==='fix'&&hits.length){for(const node of hits){for(const pr of node.getMesh().listPrimitives()){
   const ind=pr.getIndices();if(ind){const a=ind.getArray().slice();for(let t=0;t<a.length;t+=3){const x=a[t+1];a[t+1]=a[t+2];a[t+2]=x}
     const c=ind.clone();c.setArray(a);pr.setIndices(c)}
   const nor=pr.getAttribute('NORMAL');if(nor){const c=nor.clone();const v=[0,0,0];for(let i=0;i<c.getCount();i++){c.getElement(i,v);c.setElement(i,[-v[0],-v[1],-v[2]])}pr.setAttribute('NORMAL',c)}}}
  await doc.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(f,doc);console.log('   -> rewrote',hits.length);}}
