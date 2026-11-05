import { sup, outside } from './hullchk.mjs';
const s=sup.find(x=>x.name==='great_saphenous_vein_L');const b={};
for(const v of s.P){const r=outside(v);const k=(Math.round(v[1]/0.1)/10).toFixed(1);b[k]=b[k]||[0,0,0];b[k][0]++;if(r.d>0.006){b[k][1]++;b[k][2]=Math.max(b[k][2],r.d)}}
for(const k of Object.keys(b).sort())console.log(k,b[k][0],'out',b[k][1],'max',(b[k][2]*1000).toFixed(0));
