const {src,units,declUnit,ast}=require('./an3.cjs');const fs=require('fs');
const imp=ast.body.find(s=>s.type==='ImportDeclaration');const exp=ast.body.find(s=>s.type==='ExportNamedDeclaration');
const impText=src.slice(imp.start,imp.end);
const EXPS=exp.specifiers.map(s=>({local:s.local.name,exported:s.exported.name}));
const CORE_EXPORT=new Set(['A','N','M','j']);
const coreNames=EXPS.filter(e=>CORE_EXPORT.has(e.exported)).map(e=>e.local);
const core=new Set();const st=coreNames.map(n=>declUnit[n]);
while(st.length){const i=st.pop();if(core.has(i))continue;core.add(i);units[i].refs.forEach(j=>st.push(j))}
// Safety: writes across the boundary
let bad=0;units.forEach((u,i)=>{u.writes.forEach(t=>{if(core.has(i)!==core.has(t)){bad++;console.log('CROSS WRITE unit',i,'->',t,src.slice(u.start,u.start+80))}})});
// 3D units referencing core-declared names, and core units referencing 3D (must be none)
units.forEach((u,i)=>{if(core.has(i))u.refs.forEach(t=>{if(!core.has(t)){bad++;console.log('CORE->3D ref',i,t)}})});
const need=new Set();// core-declared names used by 3D units
const nameOf=new Map();for(const [n,u] of Object.entries(declUnit))nameOf.set(u,(nameOf.get(u)||[]).concat(n));
units.forEach((u,i)=>{if(!core.has(i))u.refs.forEach(t=>{if(core.has(t)){(nameOf.get(t)||[]).forEach(n=>need.add(n))}})});
// names declared in core units but only some of them needed: export all needed names (a unit can declare several names via patterns; fine)
// Need to restrict to names actually referenced: recompute precisely using scope references
console.log('core units',core.size,'bytes',[...core].reduce((a,i)=>a+units[i].end-units[i].start,0),'cross problems',bad,'names 3D needs from core',need.size);
fs.writeFileSync('plan.json',JSON.stringify({core:[...core],need:[...need],exports:EXPS,impText}));
