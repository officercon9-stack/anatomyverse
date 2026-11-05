import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { reorder, quantize, prune } from '@gltf-transform/functions';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
const [,,inF,outF,lite,mapF]=process.argv;
const J=JSON.parse(fs.readFileSync(inF));
const doc=new Document();const buf=doc.createBuffer();const scene=doc.createScene();const mats={};
const col=(id)=>/node/.test(id)?['Lymph node',[0.52,0.78,0.52]]:/bursa/.test(id)?['Bursa',[0.66,0.80,0.88]]:/meniscus|labrum|disc|symphysis|cartilage/.test(id)?['Fibrocartilage',[0.80,0.82,0.80]]:/fat-pad/.test(id)?['Fat',[0.90,0.78,0.42]]:/capsule/.test(id)?['Capsule',[0.84,0.76,0.66]]:/membrane/.test(id)?['Membrane',[0.80,0.74,0.64]]:['Ligament',[0.90,0.86,0.74]];
const count={};const map={};
for(const [key,{v,f}] of Object.entries(J)){
 const [sid,side]=key.split('|');const nv=v.length;const P=new Float32Array(nv*3);v.forEach((p,i)=>P.set(p,i*3));let I=new Uint32Array(f.length*3);f.forEach((t,i)=>I.set(t,i*3));
 if(lite){const tgt=Math.max(90,Math.floor(I.length/3*0.5))*3;if(tgt<I.length){const [ni]=MeshoptSimplifier.simplify(I,P,3,tgt,0.03,[]);I=ni}}
 const N=new Float32Array(nv*3);for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const q of [a,b,c]){N[q]+=nx;N[q+1]+=ny;N[q+2]+=nz}}
 for(let i=0;i<nv;i++){const l=Math.hypot(N[i*3],N[i*3+1],N[i*3+2])||1;N[i*3]/=l;N[i*3+1]/=l;N[i*3+2]/=l}
 const [mn,cl]=col(sid);const mat=mats[mn]||(mats[mn]=doc.createMaterial(mn).setBaseColorFactor([...cl,1]).setRoughnessFactor(0.75).setMetallicFactor(0).setDoubleSided(true));
 const k=sid+'_'+(side||'m');count[k]=(count[k]||0)+1;const name='zj_'+sid.replace(/-/g,'_')+'_'+(side||'m')+'_'+count[k];
 map[name]=side==='l'?sid+'-left':side==='r'?sid+'-right':sid;
 scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(doc.createPrimitive().setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(P).setBuffer(buf)).setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(N).setBuffer(buf)).setIndices(doc.createAccessor().setType('SCALAR').setArray(I).setBuffer(buf)).setMaterial(mat))));
}
await doc.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(outF,doc);console.log(outF,(fs.statSync(outF).size/1024).toFixed(0)+'KB',Object.keys(map).length);
if(mapF)fs.writeFileSync(mapF,JSON.stringify(map));
