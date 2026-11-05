import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { dequantize } from '@gltf-transform/functions';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const mulv=(m,x,y,z)=>[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];
async function load(file){const d=await io.read(file);await d.transform(dequantize());const out={};
 for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const W=n.getWorldMatrix();let P=[],F=[];let off=0;
  for(const p of m.listPrimitives()){const A=p.getAttribute('POSITION').getArray();const I=p.getIndices()?Array.from(p.getIndices().getArray()):Array.from({length:A.length/3},(_,i)=>i);
   for(let i=0;i<A.length;i+=3)P.push(mulv(W,A[i],A[i+1],A[i+2]));for(let i=0;i<I.length;i++)F.push(I[i]+off);off=P.length}
  out[n.getName()]={P,F}}
 return out}
const cen=(o,names)=>{let s=[0,0,0],c=0;for(const n of names){for(const p of o[n].P){s[0]+=p[0];s[1]+=p[1];s[2]+=p[2];c++}}return s.map(x=>x/c)};
const za=await load('../ghclone/models/zanatomy-heart.glb');
const vh=await load('/tmp/ccf/v1.2/models/VH_M_Heart.glb');
const zn=Object.keys(za).filter(k=>/aortic_valve|mitral|tricuspid|pulmonary_valve|left_ventricle|right_ventricle|left_atrium|right_atrium/.test(k));
console.log(zn.join(' '));
const pairs=[['aortic',zn.filter(k=>/aortic_valve/.test(k)),['VH_M_aortic_valve']],['mitral',zn.filter(k=>/mitral/.test(k)),['VH_M_mitral_valve']],['tricuspid',zn.filter(k=>/tricuspid/.test(k)),['VH_M_tricuspid_valve']],['pulmonary',zn.filter(k=>/pulmonary_valve/.test(k)),['VH_M_pulmonary_valve']],['LV',['za_left_ventricle_1'],['VH_M_heart_left_ventricle']],['RV',['za_right_ventricle_1'],['VH_M_heart_right_ventricle']],['LA',['za_left_atrium_1'],['VH_M_left_cardiac_atrium']],['RA',['za_right_atrium_1'],['VH_M_right_cardiac_atrium']]];
const A=[],B=[];for(const [n,a,b] of pairs){const ca=cen(za,a),cb=cen(vh,b);console.log(n,'ZA',ca.map(x=>+x.toFixed(4)),'VH',cb.map(x=>+x.toFixed(4)));A.push(ca);B.push(cb)}
// Umeyama: B(VH) -> A(ZA)
const n=A.length,mu=(X)=>[0,1,2].map(k=>X.reduce((s,p)=>s+p[k],0)/n);const ma=mu(A),mb=mu(B);
const H=[[0,0,0],[0,0,0],[0,0,0]];let vb=0;for(let i=0;i<n;i++){for(let r=0;r<3;r++)for(let c=0;c<3;c++)H[r][c]+=(B[i][r]-mb[r])*(A[i][c]-ma[c]);vb+=[0,1,2].reduce((s,k)=>s+(B[i][k]-mb[k])**2,0)}
fs.writeFileSync('/tmp/gx/heartH.json',JSON.stringify({H,ma,mb,vb,n}));
