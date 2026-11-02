import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune } from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const [inp,outp]=process.argv.slice(2);const OFF=+(process.env.OFF||0.0035);
const doc=await io.read(inp);const node=doc.getRoot().listNodes().find(n=>n.getName()==='arachnoid');
const M=node.getWorldMatrix();
function inv(a){const o=new Array(16);const b00=a[0]*a[5]-a[1]*a[4],b01=a[0]*a[6]-a[2]*a[4],b02=a[0]*a[7]-a[3]*a[4],b03=a[1]*a[6]-a[2]*a[5],b04=a[1]*a[7]-a[3]*a[5],b05=a[2]*a[7]-a[3]*a[6],b06=a[8]*a[13]-a[9]*a[12],b07=a[8]*a[14]-a[10]*a[12],b08=a[8]*a[15]-a[11]*a[12],b09=a[9]*a[14]-a[10]*a[13],b10=a[9]*a[15]-a[11]*a[13],b11=a[10]*a[15]-a[11]*a[14];let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;d=1/d;
o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*d;o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*d;o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*d;o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*d;o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*d;o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*d;o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*d;o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*d;o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*d;o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*d;o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*d;o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*d;o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*d;o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*d;o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*d;o[15]=(a[8]*b03-a[9]*b01+a[10]*b00)*d;return o}
const IM=inv(M);const tp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
for(const pr of node.getMesh().listPrimitives()){
 const pos=pr.getAttribute('POSITION');const ind=pr.getIndices().getArray();const n=pos.getCount();
 const p=[0,0,0];const P=[];for(let i=0;i<n;i++){pos.getElement(i,p);P.push(tp(M,p))}
 const N=P.map(()=>[0,0,0]);
 for(let t=0;t<ind.length;t+=3){const a=ind[t],b=ind[t+1],c=ind[t+2];const A=P[a],B=P[b],C=P[c];
  const u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];
  const f=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  for(const i of [a,b,c])for(let d=0;d<3;d++)N[i][d]+=f[d]}
 // weld-average
 const key=v=>Math.round(v[0]*20000)+','+Math.round(v[1]*20000)+','+Math.round(v[2]*20000);
 const g=new Map();P.forEach((v,i)=>{const k=key(v);let a=g.get(k);if(!a)g.set(k,a=[]);a.push(i)});
 for(const ids of g.values()){const s=[0,0,0];ids.forEach(i=>{for(let d=0;d<3;d++)s[d]+=N[i][d]});ids.forEach(i=>N[i]=s.slice())}
 const ctr=[0,1,2].map(d=>P.reduce((s,v)=>s+v[d],0)/n);
 let agree=0;for(let i=0;i<n;i++){const r=[P[i][0]-ctr[0],P[i][1]-ctr[1],P[i][2]-ctr[2]];agree+=(N[i][0]*r[0]+N[i][1]*r[1]+N[i][2]*r[2])>0?1:-1}
 const SGN=agree>=0?1:-1;console.log('normal orientation',SGN>0?'outward':'inward(flipping offset)');
 const out=new Float32Array(n*3);
 for(let i=0;i<n;i++){const l=Math.hypot(...N[i])||1;out.set(tp(IM,[P[i][0]+N[i][0]/l*OFF*SGN,P[i][1]+N[i][1]/l*OFF*SGN,P[i][2]+N[i][2]/l*OFF*SGN]),i*3)}
 const acc=pos.clone();acc.setNormalized(false);acc.setArray(out);pr.setAttribute('POSITION',acc);
 const nor=pr.getAttribute('NORMAL');if(nor)pr.setAttribute('NORMAL',null);
}
await doc.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(outp,doc);console.log('arachnoid offset by mm',OFF*1000);
