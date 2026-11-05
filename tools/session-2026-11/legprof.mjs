import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const R='../live37/models/';
const load=async f=>{const doc=await io.read(R+f);const out=[];
 for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const w=n.getWorldMatrix();const p=[0,0,0];const P=[];
  for(const pr of m.listPrimitives()){const pos=pr.getAttribute('POSITION');for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}}
  out.push({name:n.getName(),P});}return out;};
const bones=await load('zanatomy-limbbones.glb');
const limbs=await load('anatomyverse-limbs.glb');
const sup=await load('anatomyverse-limbsupply.glb');
console.log('bone names with tib/fib:',bones.filter(s=>/tib|fib|patella|femur/i.test(s.name)).map(s=>s.name).join(' '));
const side=process.argv[2]||'L';
const sl=y=>Math.round(y/0.04)*0.04;
const cen=(P,lo,hi)=>{const a=P.filter(v=>v[1]>=lo&&v[1]<hi);if(a.length<3)return null;return [a.reduce((s,v)=>s+v[0],0)/a.length,a.reduce((s,v)=>s+v[2],0)/a.length,a.length]};
const pick=re=>[].concat(...limbs.filter(s=>re.test(s.name)&&s.name.endsWith('_'+side)).map(s=>s.P));
const tib=pick(/tibia/i),fib=pick(/fibula/i);
console.log('tib pts',tib.length,'fib pts',fib.length);
const names=sup.filter(s=>new RegExp('_'+side+'$').test(s.name)&&/tibial|fibular|saphenous|popliteal/.test(s.name));
const muscles=[].concat(...limbs.filter(s=>/^m_/.test(s.name)&&s.name.endsWith('_'+side)).map(s=>s.P));
for(let y=0.04;y<0.5;y+=0.06){
 const lo=y-0.03,hi=y+0.03;const t=cen(tib,lo,hi),f=cen(fib,lo,hi);
 const mu=muscles.filter(v=>v[1]>=lo&&v[1]<hi&&v[0]*(side==='L'?1:-1)>0.02&&v[0]*(side==='L'?1:-1)<0.3);
 const mx=mu.length?[Math.min(...mu.map(v=>v[0])),Math.max(...mu.map(v=>v[0])),Math.min(...mu.map(v=>v[2])),Math.max(...mu.map(v=>v[2]))]:null;
 console.log('y',y.toFixed(2),'tib',t&&t.slice(0,2).map(x=>x.toFixed(3)),'fib',f&&f.slice(0,2).map(x=>x.toFixed(3)),'muscle x',mx&&mx.slice(0,2).map(x=>x.toFixed(3)),'z',mx&&mx.slice(2).map(x=>x.toFixed(3)));
 for(const s of names){const c=cen(s.P,lo,hi);if(c)console.log('   ',s.name.padEnd(28),c.slice(0,2).map(x=>x.toFixed(3)).join(','));}
}
