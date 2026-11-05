import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { weld, simplify, reorder, quantize, prune } from '@gltf-transform/functions';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
const [,,inJ,outFull,outLite]=process.argv;const J=JSON.parse(fs.readFileSync(inJ));
const doc=new Document();const buf=doc.createBuffer();const scene=doc.createScene('s');
const mat=doc.createMaterial('Artery').setBaseColorFactor([0.78,0.16,0.16,1]).setRoughnessFactor(0.55).setMetallicFactor(0);const matN=doc.createMaterial('Nerve').setBaseColorFactor([0.93,0.83,0.36,1]).setRoughnessFactor(0.6).setMetallicFactor(0);const matV=doc.createMaterial('Vein').setBaseColorFactor([0.22,0.30,0.65,1]).setRoughnessFactor(0.55).setMetallicFactor(0);
for(const [name,{v,f}] of Object.entries(J)){
 if(!v.length)continue;const nv=v.length;const P=new Float32Array(nv*3);v.forEach((p,i)=>P.set(p,i*3));let I=new Uint32Array(f.length*3);f.forEach((t,i)=>I.set(t,i*3));
 const N=new Float32Array(nv*3);
 for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const k of [a,b,c]){N[k]+=nx;N[k+1]+=ny;N[k+2]+=nz}}
 for(let i=0;i<nv;i++){const l=Math.hypot(N[i*3],N[i*3+1],N[i*3+2])||1;N[i*3]/=l;N[i*3+1]/=l;N[i*3+2]/=l}
 const prim=doc.createPrimitive().setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(P).setBuffer(buf)).setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(N).setBuffer(buf)).setIndices(doc.createAccessor().setType('SCALAR').setArray(I).setBuffer(buf)).setMaterial(/ijv/.test(name)?matV:/^zp_/.test(name)?matN:mat);
 scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
}
const pack=async(file,ratio)=>{await doc.transform(weld({tolerance:1e-5}),simplify({simplifier:MeshoptSimplifier,ratio,error:0.004,lockBorder:false}),prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(file,doc);console.log(file,(fs.statSync(file).size/1024).toFixed(0)+'KB')};
// full first
const lite=await (async()=>{return null})();
await pack(outFull,process.env.RATIO?+process.env.RATIO:0.6);
// lite derived from same doc (simplify again)
await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio:0.5,error:0.004,lockBorder:false}),prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(outLite,doc);console.log(outLite,(fs.statSync(outLite).size/1024).toFixed(0)+'KB');
