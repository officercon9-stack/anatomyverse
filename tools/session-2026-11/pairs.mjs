import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const tp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
const det=m=>m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])+m[8]*(m[1]*m[6]-m[2]*m[5]);
for(const f of process.argv.slice(2)){const doc=await io.read(f);const V={};
 for(const n of doc.getRoot().listNodes()){if(!n.getMesh())continue;const m=n.getWorldMatrix();const d=det(m);let vol=0,area=0;const p=[0,0,0];
  for(const pr of n.getMesh().listPrimitives()){const pos=pr.getAttribute('POSITION');const ind=pr.getIndices();const I=ind?ind.getArray():[...Array(pos.getCount()).keys()];const P=[];for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push(tp(m,p))}
   for(let t=0;t<I.length;t+=3){const a=P[I[t]],b=P[I[t+1]],c=P[I[t+2]];vol+=(a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
    const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];area+=Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])/2}}
  V[n.getName()]={vol:(d<0?-vol:vol),area}}
 const res=[];const seen=new Set();
 for(const k of Object.keys(V)){let o=null;if(/_L(_|$)/.test(k))o=k.replace(/_L(_|$)/,'_R$1');else if(/-left/.test(k))o=k.replace('-left','-right');else if(/_1(_|$)/.test(k)&&k.startsWith('za_'))o=k.replace(/_1(_|$)/,'_2$1');if(!o||!V[o])continue;
  const a=V[k],b=V[o];const sa=Math.sign(a.vol),sb=Math.sign(b.vol);if(sa!==sb){const bad=sa<0?k:o;const ratio=Math.abs(sa<0?a.vol:b.vol)/(a.area||1);res.push(bad+' (vol '+(a.vol*1e6).toFixed(1)+' / '+(b.vol*1e6).toFixed(1)+')')}}
 console.log(f.split('/').pop(),'pairs with opposite sign:',res.length);res.forEach(r=>console.log('  ',r));}
