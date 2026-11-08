const acorn=require('acorn'),es=require('eslint-scope'),fs=require('fs');
const f=process.argv[2];const src=fs.readFileSync(f,'utf8');
const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'module',ranges:true});
const sm=es.analyze(ast,{ecmaVersion:2022,sourceType:'module',ranges:true});const mod=sm.globalScope.childScopes[0];
const exp=ast.body.find(s=>s.type==='ExportNamedDeclaration');
const E={};exp.specifiers.forEach(s=>E[s.exported.name]=s.local.name);console.log(JSON.stringify(E));
const want=process.argv.slice(3);
const units=[];for(const s of ast.body){if(s.type==='VariableDeclaration')s.declarations.forEach(d=>units.push({start:d.start,end:d.end,k:'d'}));else units.push({start:s.start,end:s.end,k:s.type})}
const at=p=>units.findIndex(u=>p>=u.start&&p<u.end);
const du={};for(const v of mod.variables)for(const d of v.defs)du[v.name]=at(d.name.start);
units.forEach(u=>u.refs=new Set());
const ext=new Set();
(function vis(s){for(const r of s.references){const v=r.resolved;if(!v||v.scope!==mod)continue;const fr=at(r.identifier.start),to=du[v.name];if(fr>=0&&to!==undefined&&fr!==to)units[fr].refs.add(to)}s.childScopes.forEach(vis)})(mod);
const seen=new Set();const st=want.map(w=>du[E[w]]);while(st.length){const i=st.pop();if(seen.has(i))continue;seen.add(i);units[i].refs.forEach(j=>st.push(j))}
let sz=0;const imps=[];seen.forEach(i=>{sz+=units[i].end-units[i].start;if(units[i].k==='ImportDeclaration')imps.push(src.slice(units[i].start,units[i].end).slice(0,160))});
console.log('closure units',seen.size,'bytes',sz,imps);
for(const w of want){const u=units[du[E[w]]];console.log(w,E[w],JSON.stringify(src.slice(u.start,u.start+300)))}
