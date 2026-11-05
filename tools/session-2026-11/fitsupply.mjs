// Pull limb supply tubes that stray outside the limb section back to just inside it.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune, dequantize } from '@gltf-transform/functions';
import { outside } from './hullchk.mjs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const [,, inF, outF, ...only]=process.argv;
const MARGIN=m=>/vein/.test(m)?0.003:0.005; // veins sit nearer the surface than nerves
const doc=await io.read(inF);await doc.transform(dequantize());
const inv3=(a,b,c,d,e,f,g,h,i)=>{const det=a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g);
 return [(e*i-f*h)/det,(c*h-b*i)/det,(b*f-c*e)/det,(f*g-d*i)/det,(a*i-c*g)/det,(c*d-a*f)/det,(d*h-e*g)/det,(b*g-a*h)/det,(a*e-b*d)/det]}; // row-major inverse
for(const n of doc.getRoot().listNodes()){const nm=n.getName();const me=n.getMesh();if(!me)continue;if(only.length&&!only.includes(nm))continue;
 const w=n.getWorldMatrix();const J=inv3(w[0],w[4],w[8],w[1],w[5],w[9],w[2],w[6],w[10]); // inverse linear (row-major of col-major block)
 for(const pr of me.listPrimitives()){const pos=pr.getAttribute('POSITION');const V=pos.getCount();const p=[0,0,0];
  const W=[],S=new Array(V).fill(null);
  for(let i=0;i<V;i++){pos.getElement(i,p);W.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]])}
  // raw shift per vertex (world xz)
  const cell0=0.008,G0=new Map();const key0=v=>Math.floor(v[0]/cell0)+','+Math.floor(v[1]/cell0)+','+Math.floor(v[2]/cell0);
  W.forEach((v,i)=>{const k=key0(v);(G0.get(k)||G0.set(k,[]).get(k)).push(i)});
  const CL=W.map(v=>{let a=[0,0,0],c=0;const cx=Math.floor(v[0]/cell0),cy=Math.floor(v[1]/cell0),cz=Math.floor(v[2]/cell0);
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){const g=G0.get((cx+dx)+','+(cy+dy)+','+(cz+dz));if(g)for(const j of g){if(Math.hypot(W[j][0]-v[0],W[j][1]-v[1],W[j][2]-v[2])<cell0){a[0]+=W[j][0];a[1]+=W[j][1];a[2]+=W[j][2];c++}}}
   return [a[0]/c,a[1]/c,a[2]/c]});
  const isVein=/vein/.test(nm);
  const sh=CL.map(v=>{const r=outside(v);if(r.d===null)return [0,0];
   const H=r.H;const cx=H.reduce((s,q)=>s+q[0],0)/H.length,cz=H.reduce((s,q)=>s+q[1],0)/H.length;
   let area=0;for(let i=0;i<H.length;i++){const a=H[i],b=H[(i+1)%H.length];area+=a[0]*b[1]-b[0]*a[1]}area=Math.abs(area)/2;const half=Math.sqrt(area/Math.PI);
   const want=isVein?0.003:Math.min(0.012,0.22*half); // metres inside the limb surface
   if(r.d===0){const din=r.din;if(din>=want)return [0,0];const L=Math.hypot(cx-v[0],cz-v[2])||1;const k=Math.min(want-din,L);return [(cx-v[0])/L*k,(cz-v[2])/L*k]}
   let best=1e9,bp=null;for(let i=0;i<H.length;i++){const a=H[i],b=H[(i+1)%H.length];const dx=b[0]-a[0],dy=b[1]-a[1];const t=Math.max(0,Math.min(1,((v[0]-a[0])*dx+(v[2]-a[1])*dy)/(dx*dx+dy*dy||1)));const q=[a[0]+t*dx,a[1]+t*dy];const d=Math.hypot(v[0]-q[0],v[2]-q[1]);if(d<best){best=d;bp=q}}
   const L=Math.hypot(cx-bp[0],cz-bp[1])||1;
   return [bp[0]+(cx-bp[0])/L*want-v[0],bp[1]+(cz-bp[1])/L*want-v[2]]});
  // smooth shifts over neighbours within 25 mm (3 passes) so the tube stays smooth
  const cell=0.04,G=new Map();const key=v=>Math.floor(v[0]/cell)+','+Math.floor(v[1]/cell)+','+Math.floor(v[2]/cell);
  W.forEach((v,i)=>{const k=key(v);(G.get(k)||G.set(k,[]).get(k)).push(i)});
  let cur=sh;for(let pass=0;pass<6;pass++){cur=cur.map((s,i)=>{const v=W[i];let ax=0,az=0,c=0;const cx=Math.floor(v[0]/cell),cy=Math.floor(v[1]/cell),cz=Math.floor(v[2]/cell);
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){const a=G.get((cx+dx)+','+(cy+dy)+','+(cz+dz));if(a)for(const j of a){if(Math.hypot(W[j][0]-v[0],W[j][1]-v[1],W[j][2]-v[2])<cell){ax+=cur[j][0];az+=cur[j][1];c++}}}
   return [ax/c,az/c]})}
  // never shrink a correction below the raw requirement
  let moved=0,mx=0;
  for(let i=0;i<V;i++){let s=cur[i];if(Math.hypot(s[0],s[1])<1e-5)continue;moved++;mx=Math.max(mx,Math.hypot(s[0],s[1]));
   const dw=[s[0],0,s[1]];const dl=[J[0]*dw[0]+J[1]*dw[1]+J[2]*dw[2],J[3]*dw[0]+J[4]*dw[1]+J[5]*dw[2],J[6]*dw[0]+J[7]*dw[1]+J[8]*dw[2]];
   pos.getElement(i,p);pos.setElement(i,[p[0]+dl[0],p[1]+dl[1],p[2]+dl[2]])}
  if(moved)console.log(nm.padEnd(34),'moved',moved,'of',V,'max shift mm',(mx*1000).toFixed(0));
 }}
await doc.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());
await io.write(outF,doc);console.log('wrote',outF);
