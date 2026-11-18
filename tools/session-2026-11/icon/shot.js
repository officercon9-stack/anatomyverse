const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1024,height:1024}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>m.type()==='error'&&console.log('CON',m.text()));
for(const [m,az,el,k] of [['heart',-22,-6,1.2]]){await p.goto(`http://localhost:8170/r.html?m=${m}&az=${az}&el=${el}&k=${k}&s=1024`);await p.waitForFunction(()=>document.title==='done',null,{timeout:60000});await p.waitForTimeout(300);
 await (await p.$('canvas')).screenshot({path:'r_'+m+'.png',omitBackground:true});console.log('ok',m)}
await b.close()})()
