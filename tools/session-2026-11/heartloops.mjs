import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { dequantize } from '@gltf-transform/functions';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const T=JSON.parse(fs.readFileSync('/tmp/gx/heartT.json'));const R=T.R,s=T.s,t=T.t;
const d=await io.read('/tmp/ccf/v1.2/models/VH_M_Heart.glb');await d.transform(dequantize());
const res={};
for(const n of d.getRoot().listNodes()){const nm=n.getName();if(!/(left_cardiac_atrium|right_cardiac_atrium|left_ventricle|right_ventricle)$/.test(nm))continue;const p=n.getMesh().listPrimitives()[0];const A=p.getAttribute('POSITION').getArray(),I=p.getIndices().getArray();
 const P=[];for(let i=0;i<A.length;i+=3){const x=A[i],y=A[i+1],z=A[i+2];P.push([s*(R[0][0]*x+R[0][1]*y+R[0][2]*z)+t[0],s*(R[1][0]*x+R[1][1]*y+R[1][2]*z)+t[1],s*(R[2][0]*x+R[2][1]*y+R[2][2]*z)+t[2]])}
 // weld by position
 const key=v=>v.map(x=>Math.round(x*1e5)).join(',');const idmap=new Map();const W=P.map(v=>{const k=key(v);if(!idmap.has(k))idmap.set(k,idmap.size);return idmap.get(k)});
 const E=new Map();for(let i=0;i<I.length;i+=3){for(let k=0;k<3;k++){const a=W[I[i+k]],b=W[I[i+(k+1)%3]];const kk=a<b?a+'_'+b:b+'_'+a;E.set(kk,(E.get(kk)||0)+1)}}
 const adj=new Map();const pos=[];P.forEach((v,i)=>{pos[W[i]]=v});
 for(const [k,c] of E){if(c!==1)continue;const [a,b]=k.split('_').map(Number);(adj.get(a)||adj.set(a,[]).get(a)).push(b);(adj.get(b)||adj.set(b,[]).get(b)).push(a)}
 // components over boundary vertices
 const seen=new Set();const loops=[];for(const v of adj.keys()){if(seen.has(v))continue;const st=[v],comp=[];seen.add(v);while(st.length){const u=st.pop();comp.push(u);for(const w of adj.get(u))if(!seen.has(w)){seen.add(w);st.push(w)}}loops.push(comp)}
 let cm=[0,0,0];for(const v of pos){cm[0]+=v[0];cm[1]+=v[1];cm[2]+=v[2]}cm=cm.map(x=>x/pos.length);
 const out=[];for(const comp of loops){if(comp.length<8)continue;const c=[0,0,0];for(const u of comp){c[0]+=pos[u][0];c[1]+=pos[u][1];c[2]+=pos[u][2]}const ce=c.map(x=>x/comp.length);let r=0;for(const u of comp)r+=Math.hypot(pos[u][0]-ce[0],pos[u][1]-ce[1],pos[u][2]-ce[2]);r/=comp.length;
  // normal via PCA-lite: use cross of two spread vectors; fallback outward from centroid
  const o=[ce[0]-cm[0],ce[1]-cm[1],ce[2]-cm[2]];const ol=Math.hypot(...o);out.push({n:comp.length,c:ce.map(x=>+x.toFixed(4)),r:+r.toFixed(4),out:o.map(x=>+(x/ol).toFixed(3))})}
 res[nm]=out;console.log(nm,JSON.stringify(out))}
fs.writeFileSync('/tmp/gx/heartloops.json',JSON.stringify(res));
