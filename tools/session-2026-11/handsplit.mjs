/* Split a hand-bones mesh into its 27 separate bones and name them. Usage: node handsplit.mjs <glb> <node> <L|R> [--write] [--json out] */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize } from '@gltf-transform/functions';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const [file,nodeName,side]=process.argv.slice(2);const WRITE=process.argv.includes('--write');
const jo=process.argv.includes('--json')?process.argv[process.argv.indexOf('--json')+1]:null;
const REF=process.argv.includes('--ref')?JSON.parse(fs.readFileSync(process.argv[process.argv.indexOf('--ref')+1])):null;
const sg=side==='L'?1:-1;
const doc=await io.read(file);const root=doc.getRoot(),scene=root.listScenes()[0];
const node=root.listNodes().find(x=>x.getName()===nodeName);const mesh=node.getMesh();const w=node.getWorldMatrix();
const prim=mesh.listPrimitives()[0],pos=prim.getAttribute('POSITION'),ind=prim.getIndices();const V=pos.getCount();
const P=[];const p=[0,0,0];for(let i=0;i<V;i++){pos.getElement(i,p);P.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}
const key=v=>v.map(x=>Math.round(x*20000)).join(',');const rep=new Map(),id=[];P.forEach((v,i)=>{const k=key(v);if(!rep.has(k))rep.set(k,i);id[i]=rep.get(k)});
const par=[...Array(V).keys()];const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};
const I=ind.getArray();for(let t=0;t<I.length;t+=3){const a=f(id[I[t]]),b=f(id[I[t+1]]),c=f(id[I[t+2]]);par[b]=a;par[c]=a}
const cm=new Map();for(let t=0;t<I.length;t+=3){const r=f(id[I[t]]);const c=cm.get(r)||cm.set(r,{tris:[],verts:new Set()}).get(r);c.tris.push(I[t],I[t+1],I[t+2]);for(let k=0;k<3;k++)c.verts.add(I[t+k])}
const all=[...cm.values()];const TH=REF?9:60;const big=all.filter(c=>c.tris.length>=TH),small=all.filter(c=>c.tris.length<TH);
const cen0=c=>{const a=[...c.verts].map(i=>P[i]);return [0,1,2].map(d=>a.reduce((s,v)=>s+v[d],0)/a.length)};
for(const sm of small){const q=cen0(sm);let b=null,bd=1e9;for(const c of big){const r=cen0(c);const d=Math.hypot(q[0]-r[0],q[1]-r[1],q[2]-r[2]);if(d<bd){bd=d;b=c}}b.tris.push(...sm.tris)}
const C=big.map(c=>{const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];const pts=[...c.verts].map(i=>P[i]);for(const v of pts)for(let d=0;d<3;d++){mn[d]=Math.min(mn[d],v[d]);mx[d]=Math.max(mx[d],v[d])}
  const ctr=mn.map((v,d)=>(v+mx[d])/2);const sz=mn.map((v,d)=>mx[d]-v);const ys=pts.map(v=>v[1]).sort((a,b)=>a-b);const k=Math.max(3,Math.floor(pts.length*0.15));
  const avg=A=>[0,1,2].map(d=>A.reduce((s,v)=>s+v[d],0)/A.length);const top=avg(pts.filter(v=>v[1]>=ys[ys.length-k])),bot=avg(pts.filter(v=>v[1]<=ys[k-1]));
  return {tris:c.tris,ctr,sz,ex:sg*ctr[0],vol:sz[0]*sz[1]*sz[2],diag:Math.hypot(...sz),top,bot};});
let name=new Map();
if(REF){const names=Object.keys(REF);if(C.length!==names.length)throw new Error('ref count '+C.length+' vs '+names.length);const pairs=[];for(const c of C)for(const n of names)pairs.push([Math.hypot(c.ctr[0]-REF[n].ctr[0],c.ctr[1]-REF[n].ctr[1],c.ctr[2]-REF[n].ctr[2]),c,n]);pairs.sort((a,b)=>a[0]-b[0]);const uc=new Set(),un=new Set();for(const [d,c,n] of pairs){if(uc.has(c)||un.has(n))continue;uc.add(c);un.add(n);name.set(c,n)}}else{
if(C.length!==27)throw new Error('expected 27 bones, got '+C.length);
name=new Map();const set=(c,s)=>name.set(c,s);
const carpals=C.filter(c=>c.ctr[1]>0.845);if(carpals.length!==8)throw new Error('carpals '+carpals.length);
const rest=C.filter(c=>!carpals.includes(c));
const pisi=[...carpals].sort((a,b)=>a.vol-b.vol)[0];set(pisi,'pisiform');
let rem=carpals.filter(c=>c!==pisi);
const byY=[...rem].sort((a,b)=>b.ctr[1]-a.ctr[1]);const prox2=byY.slice(0,2).sort((a,b)=>b.ex-a.ex);set(prox2[0],'scaphoid');set(prox2[1],'lunate');
rem=rem.filter(c=>!prox2.includes(c));const tri=[...rem].sort((a,b)=>a.ex-b.ex)[0];set(tri,'triquetrum');rem=rem.filter(c=>c!==tri).sort((a,b)=>b.ex-a.ex);
['trapezium','trapezoid','capitate','hamate'].forEach((n,i)=>set(rem[i],n));
const mcs=[...rest].sort((a,b)=>b.diag-a.diag).slice(0,5).sort((a,b)=>a.ex-b.ex); // little..thumb
const FING=['little','ring','middle','index','thumb'];const MCN=[5,4,3,2,1];
mcs.forEach((c,i)=>set(c,'metacarpal-'+MCN[i]));
let ph=rest.filter(c=>!mcs.includes(c));if(ph.length!==14)throw new Error('phalanges '+ph.length);
const chain=FING.map((n,i)=>({f:n,tip:mcs[i].bot,list:[]}));
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
for(let round=0;round<3;round++){const act=chain.filter(c=>c.f!=='thumb'||round<2);const pairs=[];for(const c of act)for(const q of ph)pairs.push([dist(c.tip,q.top),c,q]);pairs.sort((a,b)=>a[0]-b[0]);const used=new Set(),done=new Set();for(const [d,c,q] of pairs){if(used.has(q)||done.has(c))continue;used.add(q);done.add(c);c.list.push(q);c.tip=q.bot}ph=ph.filter(q=>!used.has(q))}
for(const c of chain){const nm=c.f==='thumb'?['proximal','distal']:['proximal','middle','distal'];c.list.forEach((q,i)=>set(q,nm[i]+'-phalanx-of-'+(c.f==='thumb'?'thumb':c.f+'-finger')))}
}
const out={};for(const [c,n] of name){out[n]={ctr:c.ctr.map(v=>+v.toFixed(3)),tris:c.tris.length/3}}
console.log(side,Object.keys(out).length,'named');for(const n of Object.keys(out).sort())console.log(' ',n.padEnd(34),out[n].ctr.join(','));
if(jo)fs.writeFileSync(jo,JSON.stringify(out));
if(WRITE){for(const [c,n] of name){const nm=doc.createMesh(nodeName+'__'+n);const np=doc.createPrimitive().setMode(prim.getMode()).setMaterial(prim.getMaterial());for(const s of prim.listSemantics())np.setAttribute(s,prim.getAttribute(s));np.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(c.tris)));nm.addPrimitive(np);
  const nn=doc.createNode(nodeName+'__'+n).setMesh(nm);nn.setTranslation(node.getTranslation()).setRotation(node.getRotation()).setScale(node.getScale());scene.addChild(nn)}
  node.dispose();await doc.transform(reorder({encoder:MeshoptEncoder}),quantize());await io.write(file,doc);console.log('written')}
