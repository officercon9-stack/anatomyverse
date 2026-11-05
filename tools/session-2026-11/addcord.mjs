import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune, dequantize } from '@gltf-transform/functions';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const [,,outF]=process.argv;const S=+(process.env.S||0.935),T=(process.env.T||'0.003,0.834,-0.028').split(',').map(Number);
const d=await io.read('/tmp/ccf/v1.2/models/VH_M_Spinal_Cord.glb');await d.transform(dequantize());
const out=new Document();const buf=out.createBuffer();const scene=out.createScene();
const mat=out.createMaterial('Neural tissue').setBaseColorFactor([0.90,0.84,0.62,1]).setRoughnessFactor(0.7).setMetallicFactor(0);
const ZT=[[1.08,-.013],[1.14,-.023],[1.20,-.037],[1.26,-.056],[1.32,-.058],[1.36,-.060],[1.40,-.053],[1.44,-.033],[1.48,-.017],[1.55,-.012]];
const interp0=(y)=>{if(y<=ZT[0][0])return ZT[0][1];for(let i=1;i<ZT.length;i++)if(y<=ZT[i][0]){const t=(y-ZT[i-1][0])/(ZT[i][0]-ZT[i-1][0]);return ZT[i-1][1]*(1-t)+ZT[i][1]*t}return ZT[ZT.length-1][1]};
const interp=(y)=>{let a=0,c=0;for(let o=-4;o<=4;o++){a+=interp0(y+o*0.01);c++}return a/c};
// current centre z per 1 cm slice (after scale/translate), gathered across all parts
const sl={};for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;for(const p of m.listPrimitives()){const A=p.getAttribute('POSITION').getArray();for(let i=0;i<A.length;i+=3){const y=A[i+1]*S+T[1],z=A[i+2]*S+T[2];const b=Math.round(y/0.01);(sl[b]??=[1e9,-1e9]);sl[b][0]=Math.min(sl[b][0],z);sl[b][1]=Math.max(sl[b][1],z)}}}
const keys=Object.keys(sl).map(Number).sort((a,b)=>a-b);const ctr={};for(const b of keys)ctr[b]=(sl[b][0]+sl[b][1])/2;
const sm={};for(const b of keys){let a=0,c=0;for(let o=-4;o<=4;o++){if(ctr[b+o]!==undefined){a+=ctr[b+o];c++}}sm[b]=a/c}
const cz=(y)=>{const f=y/0.01,b0=Math.floor(f),t=f-b0;const a=sm[b0]??sm[b0+1]??0,c=sm[b0+1]??a;return a*(1-t)+c*t};
let k=0;for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;for(const p of m.listPrimitives()){
 const A=p.getAttribute('POSITION').getArray(),I=Uint32Array.from(p.getIndices().getArray());const nv=A.length/3,P=new Float32Array(nv*3);
 for(let i=0;i<nv;i++){P[i*3]=A[i*3]*S+T[0];P[i*3+1]=A[i*3+1]*S+T[1];{const y=A[i*3+1]*S+T[1];P[i*3+2]=A[i*3+2]*S+T[2]+(process.env.FIT?(interp(y)-cz(y)):0)}}
 const N=new Float32Array(nv*3);for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const q of [a,b,c]){N[q]+=nx;N[q+1]+=ny;N[q+2]+=nz}}
 for(let i=0;i<nv;i++){const l=Math.hypot(N[i*3],N[i*3+1],N[i*3+2])||1;N[i*3]/=l;N[i*3+1]/=l;N[i*3+2]/=l}
 const nm='hm_spinal_cord'+(k++?'_'+k:'');
 scene.addChild(out.createNode(nm).setMesh(out.createMesh(nm).addPrimitive(out.createPrimitive().setAttribute('POSITION',out.createAccessor().setType('VEC3').setArray(P).setBuffer(buf)).setAttribute('NORMAL',out.createAccessor().setType('VEC3').setArray(N).setBuffer(buf)).setIndices(out.createAccessor().setType('SCALAR').setArray(I).setBuffer(buf)).setMaterial(mat))));console.log(nm,nv)}}
await out.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(outF,out);console.log('wrote',outF,(fs.statSync(outF).size/1024).toFixed(0)+'KB');
