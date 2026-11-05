import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune, dequantize } from '@gltf-transform/functions';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const [,,inF,outF]=process.argv;
const J=Object.assign({},...process.env.JSONS.split(',').map(f=>JSON.parse(fs.readFileSync(f))));
const doc=await io.read(inF);await doc.transform(dequantize());
const buf=doc.getRoot().listBuffers()[0];const scene=doc.getRoot().listScenes()[0];
const matSpec={za2_corpus_cavernosum:['Erectile tissue',[0.74,0.42,0.40]],za2_corpus_spongiosum:['Erectile tissue',[0.74,0.42,0.40]],za2_glans_penis:['Glans',[0.80,0.44,0.44]],za2_urinary_bladder:['Bladder',[0.80,0.62,0.50]],bp_rectum:['Rectum',[0.72,0.45,0.38]],za2_thyroid_cartilage:['Cartilage',[0.86,0.84,0.78]],za2_cricoid_cartilage:['Cartilage',[0.86,0.84,0.78]],za2_epiglottis:['Cartilage',[0.86,0.84,0.78]],za2_arytenoid_l:['Cartilage',[0.86,0.84,0.78]],za2_arytenoid_r:['Cartilage',[0.86,0.84,0.78]],za2_corniculate_l:['Cartilage',[0.86,0.84,0.78]],za2_corniculate_r:['Cartilage',[0.86,0.84,0.78]],za2_thyroid_gland:['Thyroid',[0.62,0.36,0.30]],za2_trachea:['Airway',[0.88,0.74,0.66]]};
const mats={};const gland=doc.getRoot().listMaterials().find(m=>m.getName()==='Gland');
for(const [name,{v,f}] of Object.entries(J)){
 if(doc.getRoot().listNodes().some(n=>n.getName()===name)){console.log('already has',name);continue}
 const nv=v.length;const P=new Float32Array(nv*3);v.forEach((p,i)=>P.set(p,i*3));
 let I=new Uint32Array(f.length*3);f.forEach((t,i)=>I.set(t,i*3));
 // signed volume -> flip if inside-out
 let vol=0;for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;vol+=(P[a]*(P[b+1]*P[c+2]-P[b+2]*P[c+1])-P[a+1]*(P[b]*P[c+2]-P[b+2]*P[c])+P[a+2]*(P[b]*P[c+1]-P[b+1]*P[c]))/6}
 if(vol<0){for(let t=0;t<I.length;t+=3){const x=I[t+1];I[t+1]=I[t+2];I[t+2]=x}console.log(name,'flipped winding (vol',vol.toFixed(8),')')}else console.log(name,'winding ok vol',vol.toFixed(8));
 const N=new Float32Array(nv*3);
 for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];
  const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const k of [a,b,c]){N[k]+=nx;N[k+1]+=ny;N[k+2]+=nz}}
 for(let i=0;i<nv;i++){const l=Math.hypot(N[i*3],N[i*3+1],N[i*3+2])||1;N[i*3]/=l;N[i*3+1]/=l;N[i*3+2]/=l}
 let mat=gland;if(matSpec[name]){const [mn,col]=matSpec[name];mat=mats[mn]||(mats[mn]=doc.createMaterial(mn).setBaseColorFactor([...col,1]).setRoughnessFactor(0.7).setMetallicFactor(0));}
 const prim=doc.createPrimitive().setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(P).setBuffer(buf)).setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(N).setBuffer(buf)).setIndices(doc.createAccessor().setType('SCALAR').setArray(I).setBuffer(buf)).setMaterial(mat);
 const mesh=doc.createMesh(name.replace('za2_','')).addPrimitive(prim);
 const node=doc.createNode(name).setMesh(mesh);scene.addChild(node);
}
await doc.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());
await io.write(outF,doc);console.log('wrote',outF,(fs.statSync(outF).size/1024).toFixed(0)+'KB');
