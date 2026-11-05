import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune, weld, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
const [inp,outp,outerJson]=process.argv.slice(2);
const {P:OP,T:OT}=JSON.parse(fs.readFileSync(outerJson));
// vertex normals of outer surface
const N=OP.map(()=>[0,0,0]);
for(const [a,b,c] of OT){const A=OP[a],B=OP[b],C=OP[c];const u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];
 const f=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];for(const i of [a,b,c])for(let d=0;d<3;d++)N[i][d]+=f[d]}
// weld-aware: average normals across coincident verts
const key=v=>Math.round(v[0]*20000)+','+Math.round(v[1]*20000)+','+Math.round(v[2]*20000);
const grp=new Map();OP.forEach((v,i)=>{const k=key(v);let a=grp.get(k);if(!a)grp.set(k,a=[]);a.push(i)});
for(const ids of grp.values()){const s=[0,0,0];ids.forEach(i=>{for(let d=0;d<3;d++)s[d]+=N[i][d]});ids.forEach(i=>{N[i]=s.slice()})}
const OFF=+(process.env.OFF||0.0005);
const NP=OP.map((v,i)=>{const n=N[i];const l=Math.hypot(...n)||1;return [v[0]+n[0]/l*OFF,v[1]+n[1]/l*OFF,v[2]+n[2]/l*OFF]});
const doc=await io.read(inp);
const node=doc.getRoot().listNodes().find(n=>n.getName()==='pia');
// invert node world matrix to store in local space
const m=node.getWorldMatrix();
function inv(a){const o=new Array(16);const b00=a[0]*a[5]-a[1]*a[4],b01=a[0]*a[6]-a[2]*a[4],b02=a[0]*a[7]-a[3]*a[4],b03=a[1]*a[6]-a[2]*a[5],b04=a[1]*a[7]-a[3]*a[5],b05=a[2]*a[7]-a[3]*a[6],b06=a[8]*a[13]-a[9]*a[12],b07=a[8]*a[14]-a[10]*a[12],b08=a[8]*a[15]-a[11]*a[12],b09=a[9]*a[14]-a[10]*a[13],b10=a[9]*a[15]-a[11]*a[13],b11=a[10]*a[15]-a[11]*a[14];let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;d=1/d;
o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*d;o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*d;o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*d;o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*d;o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*d;o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*d;o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*d;o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*d;o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*d;o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*d;o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*d;o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*d;o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*d;o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*d;o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*d;o[15]=(a[8]*b03-a[9]*b01+a[10]*b00)*d;return o}
const im=inv(m);const tp=(M,p)=>[M[0]*p[0]+M[4]*p[1]+M[8]*p[2]+M[12],M[1]*p[0]+M[5]*p[1]+M[9]*p[2]+M[13],M[2]*p[0]+M[6]*p[1]+M[10]*p[2]+M[14]];
// keep old pia spinal part (y < -0.05 world)
const prim0=node.getMesh().listPrimitives()[0];
const pos0=prim0.getAttribute('POSITION');const ind0=prim0.getIndices().getArray();
const p=[0,0,0];const W=[];for(let i=0;i<pos0.getCount();i++){pos0.getElement(i,p);W.push(tp(m,p))}
const keepV=new Map();const spinalT=[];
for(let t=0;t<ind0.length;t+=3){const a=ind0[t],b=ind0[t+1],c=ind0[t+2];
 if(W[a][1]<-0.05&&W[b][1]<-0.05&&W[c][1]<-0.05){const q=[a,b,c].map(i=>{if(!keepV.has(i))keepV.set(i,keepV.size);return keepV.get(i)});spinalT.push(q)}}
const spinalP=new Array(keepV.size);for(const [o,n2] of keepV)spinalP[n2]=W[o];
console.log('new cortical pia verts',NP.length,'tris',OT.length,'| spinal kept verts',spinalP.length,'tris',spinalT.length);
// combine
const allP=[...NP,...spinalP];const base=NP.length;
const allT=[...OT,...spinalT.map(t=>t.map(i=>i+base))];
// to local space
const L=allP.map(v=>tp(im,v));
const posArr=new Float32Array(L.length*3);L.forEach((v,i)=>posArr.set(v,i*3));
const idxArr=(L.length>65535?new Uint32Array(allT.length*3):new Uint16Array(allT.length*3));
allT.forEach((t,i)=>idxArr.set(t,i*3));
const buf=doc.getRoot().listBuffers()[0];
const posAcc=doc.createAccessor().setType('VEC3').setArray(posArr).setBuffer(buf);
const idxAcc=doc.createAccessor().setType('SCALAR').setArray(idxArr).setBuffer(buf);
const prim=doc.createPrimitive().setAttribute('POSITION',posAcc).setIndices(idxAcc).setMaterial(prim0.getMaterial());
const mesh=doc.createMesh('pia').addPrimitive(prim);
node.setMesh(mesh);
await doc.transform(weld(),prune(),reorder({encoder:MeshoptEncoder}),quantize());
await io.write(outp,doc);
console.log('wrote',outp);
