const acorn=require('./fontsrc/node_modules/acorn'),walk=require('./fontsrc/node_modules/acorn-walk'),fs=require('fs'),glob=fs.readdirSync('live29/assets').find(f=>/^assetManifest-.*\.js$/.test(f));
const src=fs.readFileSync('live29/assets/'+glob,'utf8');
const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'module'});
const lit=n=>{if(!n)return undefined;if(n.type==='Literal')return n.value;if(n.type==='TemplateLiteral'&&n.expressions.length===0)return n.quasis[0].value.cooked;return undefined};
const out=[];
walk.simple(ast,{ObjectExpression(o){const m={};for(const p of o.properties){if(p.type!=='Property')continue;const k=p.key.name||p.key.value;const v=lit(p.value);if(v!==undefined)m[k]=v}
 if(m.id&&m.latinName&&m.name&&m.system)out.push(m)}});
const seen=new Set(),u=out.filter(r=>!seen.has(r.id)&&seen.add(r.id));
fs.writeFileSync('records.json',JSON.stringify(u));console.log(u.length,'records;',u.filter(r=>r.description).length,'with description;',u.filter(r=>r.reviewStatus).length,'reviewStatus');
const c={};u.forEach(r=>c[r.reviewStatus]=(c[r.reviewStatus]||0)+1);console.log(c);
