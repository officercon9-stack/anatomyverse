const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();
await p.goto('http://localhost:8150/#/app/lab');
for(let i=0;i<40;i++){await p.waitForTimeout(3000);const s=await p.evaluate(()=>JSON.stringify(globalThis.__avOvS||null));process.stdout.write(s+' ');if(s&&s!=='null'){const o=JSON.parse(s);if(o.total&&o.loaded>=o.total)break}}
await p.waitForTimeout(4000);
const r=await p.evaluate(()=>{const s=globalThis.__r3s.get();let n=0,v=0;const ud={};const samp=[];s.scene.traverse(o=>{if(!o.isMesh)return;n++;v+=o.geometry.attributes.position.count;for(const k in o.userData)ud[k]=(ud[k]||0)+1;if(samp.length<12&&n%97===0)samp.push({name:o.name,ud:o.userData,par:o.parent&&o.parent.name,mat:o.material&&{c:o.material.color&&o.material.color.getHexString(),o:o.material.opacity,t:o.material.transparent,v:o.visible}})});
 const st=__avStore.getState();return {n,v,ud,samp,sex:st.sex,keys:Object.keys(st).slice(0,80)}});
console.log('\n'+JSON.stringify(r,null,1).slice(0,5000));await b.close();process.exit(0)})()
