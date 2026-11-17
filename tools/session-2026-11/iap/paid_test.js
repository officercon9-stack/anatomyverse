const {chromium}=require('playwright');const counts=t=>(t.match(/\d+ questions/g)||[]).slice(0,6).join(' ');
(async()=>{const b=await chromium.launch();const U='http://localhost:8160/#/app/fcps';
for(const app of [false,true]){const c=await b.newContext({serviceWorkers:'block'});if(app)await c.addInitScript(()=>{window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',nativePromise:()=>Promise.reject('none')}});const p=await c.newPage();const e=[];p.on('pageerror',x=>e.push(x.message));await p.goto(U);await p.waitForTimeout(6000);const t=await p.innerText('body');
console.log(app?'APP':'WEB',counts(t),'| demo note',t.includes('Free demo'),'| buy btn',t.includes('Unlock all questions'),'| errors',e.length);await c.close()}
await b.close()})()
