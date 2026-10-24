// node tools/gen-chunk-config.cjs <chunkDir> <outModule> '<json local-name map>' [extraModulesJson]
// Writes tools/<chunk>.decompiled.js + tools/<chunk>.config.json for tools/split.mjs
const fs=require('fs'),p=require('@babel/parser');
const [,, dir, outMod, mapJson, modsJson]=process.argv;
const OUT='/tmp/wk/out/';
const idx=JSON.parse(fs.readFileSync(__dirname+'/index.config.json','utf8'));
const idxSrc=fs.readFileSync(OUT+'index-DAxCahJm/deobfuscated.js','utf8');
const exp=idxSrc.match(/export \{([^}]*)\};?\s*$/)[1].split(',').map(s=>s.trim().split(/\s+as\s+/));
const idxExport={}; for(const [local,ex] of exp) idxExport[ex]=local;
const idxModuleOf={}; for(const [m,ns] of Object.entries(idx.modules)) for(const n of ns) idxModuleOf[n]=m;
const am={a:'structures',c:'getStructure',d:'openstax',f:'createLucideIcon',i:'structuresInModel',l:'chapters',n:'models',o:'structureById',r:'modelById',s:'structureWithDescendants',t:'SCHEMATIC_MODEL_ID',u:'sources'};
const av={a:['EyeOff','lucide-react'],i:['HeartPulse','lucide-react'],n:['useLoadStatus','@/viewer/viewFlags'],r:['RotateCcw','lucide-react'],t:['AnatomyViewer','@/viewer/AnatomyViewer']};
const src=fs.readFileSync(OUT+dir+'/deobfuscated.js','utf8');
const base=dir.split('-')[0];
fs.writeFileSync(__dirname+'/'+base+'.decompiled.js',src);
const ast=p.parse(src,{sourceType:'module',plugins:['jsx']});
const rename={},externals={},remove=[];const names=JSON.parse(mapJson);
let jsxLocal=null,reactImp=null,iconFn=null;
for(const n of ast.program.body){ if(n.type!=='ImportDeclaration')continue; const f=n.source.value;
 for(const s of n.specifiers){ const imp=s.imported.name,loc=s.local.name;
  if(f.includes('three-')){ if(imp==='A')jsxLocal=loc; if(imp==='N')reactImp=loc; continue; }
  if(f.includes('rolldown'))continue;
  let final,from;
  if(f.includes('assetManifest')){ final=am[imp]; from='@/data'; if(imp==='f'){iconFn=loc;continue;} }
  else if(f.includes('AnatomyViewer')){ [final,from]=av[imp]; }
  else if(f.includes('SearchBox')){ final='SearchBox'; from='@/components/SearchBox'; }
  else if(f.includes('info-')){ final='Info'; from='lucide-react'; }
  else if(f.includes('index-')){ const l=idxExport[imp]; if(!l) throw new Error('no export '+imp); final=idx.rename[l]||l; if(idx.externals[final]) from=idx.externals[final].from; else if(idxModuleOf[final]) from='@/'+idxModuleOf[final].replace(/\.tsx?$/,''); else throw new Error('unresolved '+final+' ('+imp+')'); }
  else throw new Error(f);
  rename[loc]=final; externals[final]={from};
 }}
// react / jsx / lucide icon boilerplate
const objName={};
const nameOf=o=>{const nm=o.properties.find(x=>x.key&&x.key.name==='name'); return nm.value.value??nm.value.quasis[0].value.cooked;};
const pascal=s=>s.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join('');
for(const n of ast.program.body){ if(n.type!=='VariableDeclaration')continue; for(const d of n.declarations){ const i=d.init; if(!i)continue;
  if(i.type==='ObjectExpression'&&i.properties.find(x=>x.key&&x.key.name==='node')&&i.properties.find(x=>x.key&&x.key.name==='name')) objName[d.id.name]=nameOf(i);
  if(i.type==='CallExpression'&&i.callee.name===jsxLocal&&i.arguments.length===0) remove.push(d.id.name);
  if(i.type==='CallExpression'&&i.callee.name==='e'&&i.arguments[0]&&i.arguments[0].callee&&i.arguments[0].callee.name===reactImp){ remove.push(d.id.name); rename[d.id.name]='React'; }
 }}
for(const n of ast.program.body){ if(n.type!=='VariableDeclaration')continue; for(const d of n.declarations){ const i=d.init; if(i&&i.type==='CallExpression'&&i.callee.name===iconFn&&objName[i.arguments[0].name]){ const P=pascal(objName[i.arguments[0].name]); rename[d.id.name]=P; externals[P]={from:'lucide-react'}; remove.push(d.id.name,i.arguments[0].name);} }}
// name map for local declarations
for(const [k,v] of Object.entries(JSON.parse(mapJson))) rename[k]=v;
const declNames=n=>n.type==='VariableDeclaration'?n.declarations.map(d=>d.id.name):(n.type==='FunctionDeclaration'&&n.id?[n.id.name]:[]);
const rm=new Set(remove);
const own=[];
for(const n of ast.program.body) for(const x of declNames(n)) if(!rm.has(x)) own.push(x);
let modules={}; const extra=modsJson?JSON.parse(modsJson):{};
const claimed=new Set();
for(const [m,ns] of Object.entries(extra)){modules[m]=ns.map(k=>rename[k]||k); ns.forEach(k=>claimed.add(k));}
modules[outMod]=[...(modules[outMod]||[]),...own.filter(x=>!claimed.has(x)).map(k=>rename[k]||k)];
externals.React={from:'react',ns:true}; delete externals.React;
const cfg={input:'tools/'+base+'.decompiled.js',outDir:'src',rename,modules,externals,remove};
fs.writeFileSync(__dirname+'/'+base+'.config.json',JSON.stringify(cfg,null,1));
console.log(base,'->',outMod,'own:',own.join(','));
