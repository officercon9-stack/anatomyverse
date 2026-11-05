import { sup, outside } from './hullchk.mjs';
const s=sup.find(x=>x.name==='great_saphenous_vein_L');
const a=s.P.filter(v=>Math.abs(v[1]-0.2)<0.004).slice(0,6);
for(const v of a){const r=outside(v);console.log(v.map(x=>x.toFixed(3)).join(','),'d',r.d&&(r.d*1000).toFixed(1),'hullpts',r.H&&r.H.length, r.H&&('x '+Math.min(...r.H.map(h=>h[0])).toFixed(3)+'..'+Math.max(...r.H.map(h=>h[0])).toFixed(3)+' z '+Math.min(...r.H.map(h=>h[1])).toFixed(3)+'..'+Math.max(...r.H.map(h=>h[1])).toFixed(3)));}
