const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:1100,height:800}});const p=await c.newPage();
await p.goto('http://localhost:8150/#/app/lab');await p.waitForTimeout(9000);
const k=await p.evaluate(()=>{const s=__avStore.getState();const o={};for(const k in s){const v=s[k];o[k]=typeof v==='function'?'fn('+v.length+')':JSON.stringify(v)?.slice(0,140)}return o});
console.log(JSON.stringify(k,null,0).replace(/","/g,'",\n"'));
const r=await p.evaluate(()=>{const s=globalThis.__r3s.get();return {cam:s.camera.position.toArray(),ctl:s.controls?Object.keys(s.controls).slice(0,40):null,tgt:s.controls&&s.controls.target?s.controls.target.toArray():null,gl:Object.keys(globalThis).filter(k=>k.startsWith('__av'))}});console.log(JSON.stringify(r));
await b.close();process.exit(0)})()
