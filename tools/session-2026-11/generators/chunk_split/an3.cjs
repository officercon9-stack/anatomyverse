const acorn=require('acorn'),es=require('eslint-scope'),fs=require('fs');
const file=process.argv[2]||'../ghclone/assets/three-Bl2eHk-_-b70.js';
const src=fs.readFileSync(file,'utf8');
const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'module',ranges:true});
const sm=es.analyze(ast,{ecmaVersion:2022,sourceType:'module'});
const mod=sm.globalScope.childScopes[0];// module scope
const units=[];
for(const s of ast.body){
 if(s.type==='VariableDeclaration')s.declarations.forEach(d=>units.push({start:d.start,end:d.end,kind:'decl'}));
 else units.push({start:s.start,end:s.end,kind:s.type==='FunctionDeclaration'||s.type==='ClassDeclaration'?'fn':s.type});
}
const unitAt=pos=>{let lo=0,hi=units.length-1;while(lo<=hi){const m=(lo+hi)>>1;if(pos<units[m].start)hi=m-1;else if(pos>=units[m].end)lo=m+1;else return m}return -1};
const declUnit={};
for(const v of mod.variables){for(const d of v.defs){const u=unitAt(d.name.start);declUnit[v.name]=u}}
units.forEach(u=>u.refs=new Set());
units.forEach(u=>u.writes=[]);
function visit(scope){for(const r of scope.references){const v=r.resolved;if(!v||v.scope!==mod)continue;const from=unitAt(r.identifier.start);const to=declUnit[v.name];if(from<0||to===undefined||from===to)continue;units[from].refs.add(to);if(r.isWrite()&&!(r.init)){units[from].writes.push(to)}}scope.childScopes.forEach(visit)}
visit(mod);
module.exports={src,units,declUnit,ast};
if(require.main===module){
function closure(names){const seen=new Set();const st=names.map(n=>declUnit[n]);while(st.length){const i=st.pop();if(seen.has(i)||i===undefined)continue;seen.add(i);units[i].refs.forEach(j=>st.push(j))}return seen}
for(const names of [['y'],['i'],['u'],['_'],['y','i','u','_']]){const c=closure(names);let sz=0;c.forEach(i=>sz+=units[i].end-units[i].start);console.log(names.join(','),'units',c.size,'bytes',sz)}
let w=0;units.forEach((u,i)=>{if(u.writes.length)w++});console.log('units with cross-unit writes',w, 'total units',units.length);
}
