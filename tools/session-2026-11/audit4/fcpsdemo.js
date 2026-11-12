const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const cap of [false,true]){const c=await b.newContext({viewport:{width:900,height:1000}});if(cap)await c.addInitScript(()=>{globalThis.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android'}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('http://localhost:8150/#/app/fcps');await p.waitForTimeout(6000);
const t=await p.evaluate(()=>document.body.innerText);const m=t.match(/[\d,]+ questions?/g);
console.log(cap?'APP':'WEB','demo note:',t.includes('Free demo'),'counts:',(m||[]).slice(0,8).join(' | '),'errors',errs);
await p.screenshot({path:'fcps_'+(cap?'app':'web')+'.png'});await c.close()}
await b.close();process.exit(0)})()
