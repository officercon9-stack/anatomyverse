import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';import {dequantize,quantize,reorder} from '@gltf-transform/functions';
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const world=(n)=>{const m=n.getWorldMatrix();const V=[];for(const p of n.getMesh().listPrimitives()){const a=p.getAttribute('POSITION');const e=[0,0,0];for(let i=0;i<a.getCount();i++){a.getElement(i,e);V.push([m[0]*e[0]+m[4]*e[1]+m[8]*e[2]+m[12],m[1]*e[0]+m[5]*e[1]+m[9]*e[2]+m[13],m[2]*e[0]+m[6]*e[1]+m[10]*e[2]+m[14]])}}return V};
const cen=v=>[0,1,2].map(k=>v.reduce((s,p)=>s+p[k],0)/v.length);const sub=(a,b)=>a.map((x,i)=>x-b[i]);const nrm=a=>{const l=Math.hypot(...a);return a.map(x=>x/l)};
function endInfo(V,side,which){ // which: 'lat' tip of subclavian (max |x|) or 'med' tip of axillary (min |x|)
 const sx=side==='L'?1:-1;const xs=V.map(p=>p[0]*sx);const tipx=which==='lat'?Math.max(...xs):Math.min(...xs);
 const near=V.filter(p=>Math.abs(p[0]*sx-tipx)<0.006);const c=cen(near);
 const rad=near.reduce((s,p)=>s+Math.hypot(p[1]-c[1],p[2]-c[2]),0)/near.length;
 const inner=V.filter(p=>which==='lat'?(p[0]*sx<tipx-0.012&&p[0]*sx>tipx-0.022):(p[0]*sx>tipx+0.012&&p[0]*sx<tipx+0.022));
 const c2=cen(inner.length?inner:near);const t=nrm(which==='lat'?sub(c,c2):sub(c2,c));return {c,t,rad:Math.max(rad,0.002)}}
function tube(P0,T0,r0,P1,T1,r1,seg=28,rs=12){const L=Math.hypot(...sub(P1,P0));const pos=[],idx=[],nor=[];
 const H=t=>{const t2=t*t,t3=t2*t,h1=2*t3-3*t2+1,h2=-2*t3+3*t2,h3=t3-2*t2+t,h4=t3-t2;return [0,1,2].map(k=>h1*P0[k]+h2*P1[k]+h3*T0[k]*L*1.1+h4*T1[k]*L*1.1)};
 let prevN=null;for(let i=0;i<=seg;i++){const t=i/seg,c=H(t),c2=H(Math.min(1,t+0.01)),c1=H(Math.max(0,t-0.01));const T=nrm(sub(c2,c1));
  let u=Math.abs(T[1])<0.9?[0,1,0]:[1,0,0];const cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const N=nrm(cr(T,u)),B=cr(T,N);const r=r0+(r1-r0)*t;
  for(let j=0;j<rs;j++){const a=2*Math.PI*j/rs;pos.push(c[0]+r*(Math.cos(a)*N[0]+Math.sin(a)*B[0]),c[1]+r*(Math.cos(a)*N[1]+Math.sin(a)*B[1]),c[2]+r*(Math.cos(a)*N[2]+Math.sin(a)*B[2]));nor.push(Math.cos(a)*N[0]+Math.sin(a)*B[0],Math.cos(a)*N[1]+Math.sin(a)*B[1],Math.cos(a)*N[2]+Math.sin(a)*B[2])}}
 for(let i=0;i<seg;i++)for(let j=0;j<rs;j++){const a=i*rs+j,b=i*rs+(j+1)%rs,c=(i+1)*rs+j,d=(i+1)*rs+(j+1)%rs;idx.push(a,c,b,b,c,d)}return {pos,idx,nor,len:L}}
const [,,orgF,limbF,outF]=process.argv;
const od=await io.read(orgF);await od.transform(dequantize());const ld=await io.read(limbF);await ld.transform(dequantize());
const find=(d,n)=>d.getRoot().listNodes().find(x=>x.getName()===n);
const log=[];
for(const [sn,an,side] of [['subclavian_artery_L','axillary_artery_L','L'],['subclavian_artery_R','axillary_artery_R','R'],['subclavian_vein_L','axillary_vein_L','L'],['subclavian_vein_R','axillary_vein_R','R']]){
 const s=find(od,sn),a=find(ld,an);if(!s||!a){log.push('missing '+sn+' or '+an);continue}
 const SV=world(s),AV=world(a);const e0=endInfo(SV,side,'lat'),e1=endInfo(AV,side,'med');
 const r=Math.min(e0.rad,e1.rad)>0.0015?(e0.rad+e1.rad)/2:Math.max(e0.rad,e1.rad);
 const T=tube(e0.c,e0.t,e0.rad,e1.c,e1.t,e1.rad);
 // to local space of s: inverse of world (affine)
 const m=s.getWorldMatrix();const det=m[0]*(m[5]*m[10]-m[9]*m[6])-m[4]*(m[1]*m[10]-m[9]*m[2])+m[8]*(m[1]*m[6]-m[5]*m[2]);
 const inv=(p)=>{const x=p[0]-m[12],y=p[1]-m[13],z=p[2]-m[14];const a=[[m[0],m[4],m[8]],[m[1],m[5],m[9]],[m[2],m[6],m[10]]];
  const c00=a[1][1]*a[2][2]-a[1][2]*a[2][1],c01=a[0][2]*a[2][1]-a[0][1]*a[2][2],c02=a[0][1]*a[1][2]-a[0][2]*a[1][1],c10=a[1][2]*a[2][0]-a[1][0]*a[2][2],c11=a[0][0]*a[2][2]-a[0][2]*a[2][0],c12=a[0][2]*a[1][0]-a[0][0]*a[1][2],c20=a[1][0]*a[2][1]-a[1][1]*a[2][0],c21=a[0][1]*a[2][0]-a[0][0]*a[2][1],c22=a[0][0]*a[1][1]-a[0][1]*a[1][0];
  return [(c00*x+c01*y+c02*z)/det,(c10*x+c11*y+c12*z)/det,(c20*x+c21*y+c22*z)/det]};
 const loc=[];for(let i=0;i<T.pos.length;i+=3)loc.push(...inv([T.pos[i],T.pos[i+1],T.pos[i+2]]));
 const prim0=s.getMesh().listPrimitives()[0];const P0=prim0.getAttribute('POSITION'),N0=prim0.getAttribute('NORMAL'),I0=prim0.getIndices();
 const n0=P0.getCount();const pa=new Float32Array(P0.getArray().length+loc.length);pa.set(P0.getArray());pa.set(loc,P0.getArray().length);
 // normals: local-space normal = (transpose of inverse linear) * world normal; approximate with the inverse-linear applied to the world normal then normalised
 const ln=[];for(let i=0;i<T.nor.length;i+=3){const v=inv([T.nor[i]+m[12],T.nor[i+1]+m[13],T.nor[i+2]+m[14]]),o=inv([m[12],m[13],m[14]]);const q=[v[0]-o[0],v[1]-o[1],v[2]-o[2]],l=Math.hypot(...q)||1;ln.push(q[0]/l,q[1]/l,q[2]/l)}
 const na=new Float32Array(N0.getArray().length+ln.length);na.set(N0.getArray());na.set(ln,N0.getArray().length);
 const ia0=I0.getArray();const ia=new Uint32Array(ia0.length+T.idx.length);ia.set(ia0);for(let k=0;k<T.idx.length;k++)ia[ia0.length+k]=T.idx[k]+n0;
 P0.setArray(pa);N0.setArray(na);I0.setArray(ia);
 log.push(sn+': tube from ['+e0.c.map(v=>v.toFixed(3))+'] r='+(e0.rad*1000).toFixed(1)+'mm to ['+e1.c.map(v=>v.toFixed(3))+'] r='+(e1.rad*1000).toFixed(1)+'mm, length '+(T.len*100).toFixed(1)+' cm')}
console.log(log.join('\n'));
await od.transform(reorder({encoder:MeshoptEncoder}),quantize());await io.write(outF,od);console.log('wrote',outF);
