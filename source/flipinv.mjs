import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune } from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const tp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
const det=m=>m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])+m[8]*(m[1]*m[6]-m[2]*m[5]);
const [inp,outp,ref]=process.argv.slice(2); // ref: file whose volumes decide (full model); default inp
async function vols(f){const doc=await io.read(f);const V={};for(const n of doc.getRoot().listNodes()){if(!n.getMesh())continue;const m=n.getWorldMatrix(),d=det(m);let vol=0;const p=[0,0,0];
 for(const pr of n.getMesh().listPrimitives()){const pos=pr.getAttribute('POSITION');const ind=pr.getIndices();const I=ind?ind.getArray():[...Array(pos.getCount()).keys()];const P=[];for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push(tp(m,p))}
  for(let t=0;t<I.length;t+=3){const a=P[I[t]],b=P[I[t+1]],c=P[I[t+2]];vol+=(a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6}}
 V[n.getName()]=d<0?-vol:vol}return V}
const V=await vols(ref||inp);const flip=new Set();
for(const k of Object.keys(V)){let o=null;if(/_L(_|$)/.test(k))o=k.replace(/_L(_|$)/,'_R$1');else if(/_1(_|$|__)/.test(k)&&k.startsWith('za_'))o=k.replace(/_1(_|$|__)/,'_2$1');if(!o||!(o in V))continue;
 const a=V[k],b=V[o];if(Math.sign(a)!==Math.sign(b)&&Math.abs(a)>1e-9&&Math.abs(Math.abs(a)-Math.abs(b))/Math.max(Math.abs(a),Math.abs(b))<(+process.env.TOL||0.2)){flip.add(a<0?k:o)}}
console.log('flipping',flip.size);
const doc=await io.read(inp);let n=0;
for(const node of doc.getRoot().listNodes()){if(!node.getMesh()||!flip.has(node.getName()))continue;
 for(const pr of node.getMesh().listPrimitives()){const ind=pr.getIndices();if(ind){const a=ind.getArray().slice();for(let t=0;t<a.length;t+=3){const x=a[t+1];a[t+1]=a[t+2];a[t+2]=x}ind.setArray(a)}
  for(const sem of ['NORMAL','TANGENT']){const acc=pr.getAttribute(sem);if(!acc)continue;const cnt=acc.getCount();const e=sem==='NORMAL'?3:4;const v=new Array(e).fill(0);for(let i=0;i<cnt;i++){acc.getElement(i,v);acc.setElement(i,sem==='NORMAL'?[-v[0],-v[1],-v[2]]:[v[0],v[1],v[2],v[3]])}}}n++}
console.log('flipped nodes',n);
await doc.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(outp,doc);
