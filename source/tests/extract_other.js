const acorn=require('./fontsrc/node_modules/acorn'),walk=require('./fontsrc/node_modules/acorn-walk'),fs=require('fs');
const f=fs.readdirSync('live29/assets').find(f=>/^index-DAxCahJm.*\.js$/.test(f));const src=fs.readFileSync('live29/assets/'+f,'utf8');
const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'module'});
const lit=n=>{if(!n)return undefined;if(n.type==='Literal')return n.value;if(n.type==='TemplateLiteral'&&n.expressions.length===0)return n.quasis[0].value.cooked;if(n.type==='ArrayExpression'){const a=n.elements.map(lit);return a.every(x=>x!==undefined)?a:undefined}if(n.type==='ObjectExpression'){const o={};for(const p of n.properties){if(p.type!=='Property')continue;const v=lit(p.value);if(v!==undefined)o[p.key.name||p.key.value]=v}return o}return undefined};
const out=[];walk.simple(ast,{ObjectExpression(o){const m=lit(o);if(m&&m.reviewStatus)out.push(m)}});
fs.writeFileSync('other_records.json',JSON.stringify(out));console.log(out.length);console.log(JSON.stringify(out[0]).slice(0,600));console.log(JSON.stringify(out[30]).slice(0,600));
