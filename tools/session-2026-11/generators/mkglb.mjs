import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { weld, simplify, reorder, quantize, prune } from '@gltf-transform/functions';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
const [,,inJ,outFull,outLite,rF,rL]=process.argv;const J=JSON.parse(fs.readFileSync(inJ));
const doc=new Document();const buf=doc.createBuffer();const scene=doc.createScene('s');
for(const [name,{v,f,c,rough,alpha}] of Object.entries(J)){
 if(!v.length)continue;const nv=v.length;const P=new Float32Array(nv*3);v.forEach((p,i)=>P.set(p,i*3));let I=new Uint32Array(f.length*3);f.forEach((t,i)=>I.set(t,i*3));
 // orient outward via signed volume
 let vol=0;for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,d=I[t+2]*3;vol+=P[a]*(P[b+1]*P[d+2]-P[b+2]*P[d+1])-P[a+1]*(P[b]*P[d+2]-P[b+2]*P[d])+P[a+2]*(P[b]*P[d+1]-P[b+1]*P[d])}
 if(vol<0&&!J[name].open)for(let t=0;t<I.length;t+=3){const x=I[t+1];I[t+1]=I[t+2];I[t+2]=x}
 const N=new Float32Array(nv*3);
 for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,d=I[t+2]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[d]-P[a],vy=P[d+1]-P[a+1],vz=P[d+2]-P[a+2];const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const k of [a,b,d]){N[k]+=nx;N[k+1]+=ny;N[k+2]+=nz}}
 for(let i=0;i<nv;i++){const l=Math.hypot(N[i*3],N[i*3+1],N[i*3+2])||1;N[i*3]/=l;N[i*3+1]/=l;N[i*3+2]/=l}
 const mat=doc.createMaterial(name).setBaseColorFactor([...(c||[0.8,0.6,0.55]),alpha||1]).setRoughnessFactor(rough??0.6).setMetallicFactor(0);if(alpha&&alpha<1)mat.setAlphaMode('BLEND');if(J[name].ds)mat.setDoubleSided(true);
 const prim=doc.createPrimitive().setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(P).setBuffer(buf)).setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(N).setBuffer(buf)).setIndices(doc.createAccessor().setType('SCALAR').setArray(I).setBuffer(buf)).setMaterial(mat);
 scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
}
const pack=async(file,ratio,err)=>{await doc.transform(weld({tolerance:1e-5}),simplify({simplifier:MeshoptSimplifier,ratio,error:err,lockBorder:false}),prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(file,doc);console.log(file,(fs.statSync(file).size/1024).toFixed(0)+'KB')};
await pack(outFull,+(rF||0.3),0.0008);
await pack(outLite,+(rL||0.5),0.0015);
