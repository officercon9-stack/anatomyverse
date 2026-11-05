import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { reorder, quantize, prune, dequantize } from '@gltf-transform/functions';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
const [,,outF,lite]=process.argv;
const S=+(process.env.S||0.94),T=(process.env.T||'0.008,0.8775,0.0755').split(',').map(Number);
const RX=+(process.env.RX||0); // pitch (deg) about x through uterus centre
const src={U:'VH_F_Uterus',OL:'VH_F_Ovary_L',OR:'VH_F_Ovary_R',TL:'VH_F_Fallopian_Tube_L',TR:'VH_F_Fallopian_Tube_R'};
const pick=[ // file, node, out name, material
['U','VH_F_body_of_uterus','hm_uterus_body','muscle'],['U','VH_F_fundus_of_uterus','hm_uterus_fundus','muscle'],['U','VH_F_cornua','hm_uterus_cornua','muscle'],['U','VH_F_lower_uterine_segment','hm_uterus_lower','muscle'],
['U','VH_F_cervix','hm_cervix','cervix'],['U','VH_F_internal_cervical_os','hm_cervix_int_os','cervix'],['U','VH_F_external_cervical_os','hm_cervix_ext_os','cervix'],
['U','VH_F_abdominal_ostium_of_uterine_tube','hm_tube_intramural','tube'],
['OL','VH_F_left_ovary','hm_ovary_l','ovary'],['OR','VH_F_right_ovary','hm_ovary_r','ovary'],
['TL','VH_F_ampulla_of_uterine_tube_L','hm_tube_ampulla_l','tube'],['TL','VH_F_isthmus_of_fallopian_tube_L','hm_tube_isthmus_l','tube'],['TL','VH_F_uterine_tube_infundibulum_L','hm_tube_infundibulum_l','tube'],['TL','VH_F_fibria_of_uterine_tube_L','hm_fimbriae_l','fimbria'],
['TR','VH_F_ampulla_of_uterine_tube_R','hm_tube_ampulla_r','tube'],['TR','VH_F_isthmus_of_fallopian_tube_R','hm_tube_isthmus_r','tube'],['TR','VH_F_uterine_tube_infundibulum_R','hm_tube_infundibulum_r','tube'],['TR','VH_F_fibria_of_uterine_tube_R','hm_fimbriae_r','fimbria']];
const matC={muscle:[0.70,0.34,0.36],cervix:[0.76,0.42,0.42],tube:[0.80,0.50,0.48],fimbria:[0.86,0.52,0.50],ovary:[0.82,0.66,0.58]};
const out=new Document();const buf=out.createBuffer();const scene=out.createScene();const mats={};
// pivot for pitch: uterus centre in VH coords
const piv=[-0.012,0.032,-0.055];const c=Math.cos(RX*Math.PI/180),sn=Math.sin(RX*Math.PI/180);
const docs={};for(const k of Object.keys(src)){docs[k]=await io.read('/tmp/ccf/v1.2/models/'+src[k]+'.glb');await docs[k].transform(dequantize())}
for(const [k,nn,name,mt] of pick){
 const n=docs[k].getRoot().listNodes().find(x=>x.getName()===nn);if(!n){console.log('MISSING',nn);continue}
 const p=n.getMesh().listPrimitives()[0];const A=p.getAttribute('POSITION').getArray();const I=p.getIndices().getArray();
 const nv=A.length/3;const P=new Float32Array(nv*3);
 for(let i=0;i<nv;i++){let x=A[i*3]-piv[0],y=A[i*3+1]-piv[1],z=A[i*3+2]-piv[2];const y2=y*c-z*sn,z2=y*sn+z*c;x+=piv[0];y=y2+piv[1];z=z2+piv[2];
  P[i*3]=x*S+T[0];P[i*3+1]=y*S+T[1];P[i*3+2]=z*S+T[2]}
 let idx=Uint32Array.from(I);
 const N=new Float32Array(nv*3);for(let t=0;t<idx.length;t+=3){const a=idx[t]*3,b=idx[t+1]*3,cc=idx[t+2]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[cc]-P[a],vy=P[cc+1]-P[a+1],vz=P[cc+2]-P[a+2];const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const q of [a,b,cc]){N[q]+=nx;N[q+1]+=ny;N[q+2]+=nz}}
 for(let i=0;i<nv;i++){const l=Math.hypot(N[i*3],N[i*3+1],N[i*3+2])||1;N[i*3]/=l;N[i*3+1]/=l;N[i*3+2]/=l}
 const mat=mats[mt]||(mats[mt]=out.createMaterial(mt).setBaseColorFactor([...matC[mt],1]).setRoughnessFactor(0.75).setMetallicFactor(0));
 const prim=out.createPrimitive().setAttribute('POSITION',out.createAccessor().setType('VEC3').setArray(P).setBuffer(buf)).setAttribute('NORMAL',out.createAccessor().setType('VEC3').setArray(N).setBuffer(buf)).setIndices(out.createAccessor().setType('SCALAR').setArray(idx).setBuffer(buf)).setMaterial(mat);
 scene.addChild(out.createNode(name).setMesh(out.createMesh(name).addPrimitive(prim)));
}
if(lite){ // decimate for lite
 for(const m of out.getRoot().listMeshes())for(const p of m.listPrimitives()){const pos=p.getAttribute('POSITION').getArray();const ind=p.getIndices().getArray();const tgt=Math.max(300,Math.floor(ind.length*0.4/3)*3);
  const [ni]=MeshoptSimplifier.simplify(Uint32Array.from(ind),pos,3,tgt,0.02,['ErrorAbsolute']);p.getIndices().setArray(ni)}}
await out.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());
await io.write(outF,out);console.log('wrote',outF,(fs.statSync(outF).size/1024).toFixed(0)+'KB');
