import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { reorder, quantize, prune, dequantize } from '@gltf-transform/functions';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});await MeshoptDecoder.ready;await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
const [,,inF,outF]=process.argv;
const T=JSON.parse(fs.readFileSync('/tmp/gx/heartT.json'));
const mulv=(m,x,y,z)=>[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];
async function load(file){const d=await io.read(file);await d.transform(dequantize());const out={};
 for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const W=n.getWorldMatrix();const prims=[];
  for(const p of m.listPrimitives()){const A=p.getAttribute('POSITION').getArray();const I=p.getIndices()?Array.from(p.getIndices().getArray()):Array.from({length:A.length/3},(_,i)=>i);const P=new Float64Array(A.length);for(let i=0;i<A.length;i+=3){const q=mulv(W,A[i],A[i+1],A[i+2]);P[i]=q[0];P[i+1]=q[1];P[i+2]=q[2]}
   prims.push({P,I:Uint32Array.from(I),mat:p.getMaterial()})}
  out[n.getName()]=prims}
 return {doc:d,meshes:out}}
const za=await load(inF),vh=await load('/tmp/ccf/v1.2/models/VH_M_Heart.glb');
// transform VH
const R=T.R,s=T.s,t=T.t;
for(const prims of Object.values(vh.meshes))for(const p of prims){for(let i=0;i<p.P.length;i+=3){const x=p.P[i],y=p.P[i+1],z=p.P[i+2];p.P[i]=s*(R[0][0]*x+R[0][1]*y+R[0][2]*z)+t[0];p.P[i+1]=s*(R[1][0]*x+R[1][1]*y+R[1][2]*z)+t[1];p.P[i+2]=s*(R[2][0]*x+R[2][1]*y+R[2][2]*z)+t[2]}}
const tris=(names,M)=>{const out=[];for(const n of names)for(const p of M[n]){for(let i=0;i<p.I.length;i+=3)out.push([p.P.subarray(p.I[i]*3,p.I[i]*3+3),p.P.subarray(p.I[i+1]*3,p.I[i+1]*3+3),p.P.subarray(p.I[i+2]*3,p.I[i+2]*3+3)])}return out};
const oldT=tris(['za_left_ventricle_1','za_right_ventricle_1','za_left_atrium_1','za_right_atrium_1'],za.meshes);
const newT=tris(['VH_M_heart_left_ventricle','VH_M_heart_right_ventricle','VH_M_left_cardiac_atrium','VH_M_right_cardiac_atrium','VH_M_interventricular_septum'],vh.meshes);
// centre
let c=[0,0,0],cn=0;for(const tr of oldT)for(const v of tr){c[0]+=v[0];c[1]+=v[1];c[2]+=v[2];cn++}c=c.map(x=>x/cn);
// radial maps
const NA=144,NB=72;
function radial(T3){const M=new Float32Array(NA*NB);
 // precompute per-tri ray test via barycentric on direction; brute force
 for(let b=0;b<NB;b++){const th=(b+.5)/NB*Math.PI;const sy=Math.cos(th),r0=Math.sin(th);for(let a=0;a<NA;a++){const ph=a/NA*2*Math.PI;const d=[r0*Math.cos(ph),sy,r0*Math.sin(ph)];let best=0;
  for(const [p0,p1,p2] of T3){// Moller-Trumbore from c along d
   const e1x=p1[0]-p0[0],e1y=p1[1]-p0[1],e1z=p1[2]-p0[2],e2x=p2[0]-p0[0],e2y=p2[1]-p0[1],e2z=p2[2]-p0[2];
   const px=d[1]*e2z-d[2]*e2y,py=d[2]*e2x-d[0]*e2z,pz=d[0]*e2y-d[1]*e2x;const det=e1x*px+e1y*py+e1z*pz;if(Math.abs(det)<1e-14)continue;const inv=1/det;
   const tx=c[0]-p0[0],ty=c[1]-p0[1],tz=c[2]-p0[2];const u=(tx*px+ty*py+tz*pz)*inv;if(u<0||u>1)continue;
   const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x;const v=(d[0]*qx+d[1]*qy+d[2]*qz)*inv;if(v<0||u+v>1)continue;const tt=(e2x*qx+e2y*qy+e2z*qz)*inv;if(tt>best)best=tt}
  M[b*NA+a]=best}}
 return M}
console.time('radial');const Ro=radial(oldT),Rn=radial(newT);console.timeEnd('radial');
const samp=(M,d)=>{const th=Math.acos(Math.max(-1,Math.min(1,d[1])));let ph=Math.atan2(d[2],d[0]);if(ph<0)ph+=2*Math.PI;const fb=th/Math.PI*NB-.5,fa=ph/(2*Math.PI)*NA;const b0=Math.max(0,Math.min(NB-1,Math.floor(fb))),b1=Math.min(NB-1,b0+1),tb=Math.max(0,Math.min(1,fb-b0));const a0=Math.floor(fa)%NA,a1=(a0+1)%NA,ta=fa-Math.floor(fa);
 const g=(b,a)=>M[b*NA+a];return (g(b0,a0)*(1-ta)+g(b0,a1)*ta)*(1-tb)+(g(b1,a0)*(1-ta)+g(b1,a1)*ta)*tb};
// which za parts to drop / refit
const drop=new Set(['za_left_ventricle_1','za_right_ventricle_1','za_left_atrium_1','za_right_atrium_1','za_lv_papillary_1','za_rv_papillary_1','za_rv_papillary_2','za_rv_papillary_3','za_aortic_valve_1','za_aortic_valve_2','za_aortic_valve_3','za_mitral_1','za_tricuspid_1','za_tricuspid_2','za_pulmonary_valve_1','za_pulmonary_valve_2','za_pulmonary_valve_3']);
const W0=+process.env.W0||0.008,W1=+process.env.W1||0.03;
const refit=(P)=>{for(let i=0;i<P.length;i+=3){const dx=P[i]-c[0],dy=P[i+1]-c[1],dz=P[i+2]-c[2];const r=Math.hypot(dx,dy,dz)||1e-9;const d=[dx/r,dy/r,dz/r];const ro=samp(Ro,d),rn=samp(Rn,d);if(!(ro>0&&rn>0))continue;const gap=r-ro;const w=gap<=W0?1:gap>=W1?0:1-(gap-W0)/(W1-W0);if(w<=0)continue;const nr=r+w*(rn-ro);P[i]=c[0]+d[0]*nr;P[i+1]=c[1]+d[1]*nr;P[i+2]=c[2]+d[2]*nr}};
for(const [n,prims] of Object.entries(za.meshes)){if(drop.has(n))continue;for(const p of prims)refit(p.P)}
// assemble output
const out=new Document();const buf=out.createBuffer();const scene=out.createScene();const mats=new Map();
const getMat=(m,name,col)=>{const key=m?m.getName():name;if(mats.has(key))return mats.get(key);const mm=m?out.createMaterial(m.getName()).setBaseColorFactor(m.getBaseColorFactor()).setRoughnessFactor(m.getRoughnessFactor()).setMetallicFactor(0):out.createMaterial(name).setBaseColorFactor([...col,1]).setRoughnessFactor(0.7).setMetallicFactor(0);mats.set(key,mm);return mm};
function addNode(name,P,I,mat){const nv=P.length/3;const Pf=Float32Array.from(P);const N=new Float32Array(nv*3);for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,cc=I[t+2]*3;const ux=Pf[b]-Pf[a],uy=Pf[b+1]-Pf[a+1],uz=Pf[b+2]-Pf[a+2],vx=Pf[cc]-Pf[a],vy=Pf[cc+1]-Pf[a+1],vz=Pf[cc+2]-Pf[a+2];const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const q of [a,b,cc]){N[q]+=nx;N[q+1]+=ny;N[q+2]+=nz}}
 for(let i=0;i<nv;i++){const l=Math.hypot(N[i*3],N[i*3+1],N[i*3+2])||1;N[i*3]/=l;N[i*3+1]/=l;N[i*3+2]/=l}
 const prim=out.createPrimitive().setAttribute('POSITION',out.createAccessor().setType('VEC3').setArray(Pf).setBuffer(buf)).setAttribute('NORMAL',out.createAccessor().setType('VEC3').setArray(N).setBuffer(buf)).setIndices(out.createAccessor().setType('SCALAR').setArray(Uint32Array.from(I)).setBuffer(buf)).setMaterial(mat);
 scene.addChild(out.createNode(name).setMesh(out.createMesh(name).addPrimitive(prim)))}
for(const [n,prims] of Object.entries(za.meshes)){if(drop.has(n))continue;for(const p of prims)addNode(n,p.P,p.I,getMat(p.mat))}
// VH parts (colours from the original Z-Anatomy material families)
const col={wall:[0.40,0.06,0.05],valve:[0.81,0.67,0.42],pap:[0.30,0.04,0.04]};
const mapN=[['VH_M_heart_left_ventricle','za_left_ventricle_1',col.wall],['VH_M_heart_right_ventricle','za_right_ventricle_1',[0.46,0.07,0.06]],['VH_M_left_cardiac_atrium','za_left_atrium_1',[0.50,0.09,0.08]],['VH_M_right_cardiac_atrium','za_right_atrium_1',[0.44,0.08,0.07]],
['VH_M_interventricular_septum','za_ivs_1',col.wall],
['VH_M_aortic_valve','za_aortic_valve_1',col.valve],['VH_M_mitral_valve','za_mitral_1',col.valve],['VH_M_tricuspid_valve','za_tricuspid_1',col.valve],['VH_M_pulmonary_valve','za_pulmonary_valve_1',col.valve],
['VH_M_papillary_muscle_of_heart_anterolateral','za_lv_papillary_1',col.pap],['VH_M_papillary_muscle_of_heart_posteromedial','za_lv_papillary_2',col.pap],
['VH_M_papillary_muscle_of_heart_anterior','za_rv_papillary_1',col.pap],['VH_M_papillary_muscle_of_heart_medial','za_rv_papillary_2',col.pap],['VH_M_papillary_muscle_of_heart_posterior','za_rv_papillary_3',col.pap]];
const BUD=JSON.parse(process.env.BUD||'{}');const RATIO=+process.env.RATIO||0.35;
for(const [vn,nn,cl] of mapN){const p=vh.meshes[vn][0];let I=p.I;const nt=I.length/3;const target=Math.max(120,Math.floor((BUD[nn]??nt*RATIO)))*3;
 if(target<I.length){const [ni]=MeshoptSimplifier.simplify(I,Float32Array.from(p.P),3,target,0.01,[]);I=ni}console.log(nn,nt,'->',I.length/3);addNode(nn,p.P,I,getMat(null,'vh_'+nn,cl))}
await out.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(outF,out);console.log('wrote',outF,(fs.statSync(outF).size/1024).toFixed(0)+'KB');
