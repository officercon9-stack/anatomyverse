import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const R=process.env.HULL_DIR||'../live37/models/';
const load=async f=>{const doc=await io.read(R+f);const out=[];
 for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const w=n.getWorldMatrix();const p=[0,0,0];const P=[];
  for(const pr of m.listPrimitives()){const pos=pr.getAttribute('POSITION');for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}}
  out.push({name:n.getName(),P});}return out;};
export const sup=await load('anatomyverse-limbsupply.glb');
const limbs=await load('anatomyverse-limbs.glb');
const tissue=[].concat(...limbs.filter(s=>/^(m|b|t)_/.test(s.name)&&!/masseter|temporalis|pterygoid|digastric|mandible|skull/.test(s.name)).map(s=>s.P));
const BIN=0.02;const G=new Map();
for(const v of tissue){const k=Math.round(v[1]/BIN);(G.get(k)||G.set(k,[]).get(k)).push(v)}
const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
const hull=pts=>{pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const lo=[];for(const p of pts){while(lo.length>=2&&cross(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
 const up=[];for(const p of pts.reverse()){while(up.length>=2&&cross(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}return lo.slice(0,-1).concat(up.slice(0,-1))};
const segd=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1];const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)};
const HC=new Map();
export function slice(v){ // returns hull (xz) of the limb section containing/nearest to v
 const k=Math.round(v[1]/BIN);const key=k+'|'+Math.round(v[0]/0.1)+'|'+Math.round(v[2]/0.1);
 return null}
export function outside(v){const k=Math.round(v[1]/BIN);const pts=[];
 for(let kk=k-1;kk<=k+1;kk++){const a=G.get(kk);if(a)for(const q of a)if(Math.hypot(q[0]-v[0],q[2]-v[2])<0.13)pts.push([q[0],q[2]])}
 if(pts.length<6)return {d:null};
 const H=hull(pts);
 // inside test
 let inside=true;for(let i=0;i<H.length;i++){if(cross(H[i],H[(i+1)%H.length],[v[0],v[2]])<0){inside=false;break}}
 if(inside){let mi=1e9;for(let i=0;i<H.length;i++)mi=Math.min(mi,segd([v[0],v[2]],H[i],H[(i+1)%H.length]));return {d:0,din:mi,H}}let m=1e9;for(let i=0;i<H.length;i++)m=Math.min(m,segd([v[0],v[2]],H[i],H[(i+1)%H.length]));return {d:m,H}}
const rows=[];
for(const s of sup){let out=0,mx=0,none=0,n=0;for(let i=0;i<s.P.length;i+=2){const r=outside(s.P[i]);n++;if(r.d===null){none++;continue}if(r.d>0.006)out++;mx=Math.max(mx,r.d)}
 rows.push({name:s.name,n,out:out/n,none:none/n,max:mx*1000})}
rows.sort((a,b)=>b.out-a.out);
if(process.argv[1].endsWith('hullchk.mjs'))rows.forEach(r=>console.log(r.name.padEnd(36),'outside>6mm',(r.out*100).toFixed(0)+'%','nolimb',(r.none*100).toFixed(0)+'%','max',r.max.toFixed(0)+'mm'));
