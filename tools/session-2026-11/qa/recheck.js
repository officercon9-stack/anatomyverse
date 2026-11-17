const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const U='http://localhost:8160/';const counts=t=>(t.match(/\d+ questions/g)||[]).slice(0,6).join(' ');
for(const app of [false,true]){const c=await b.newContext({...devices['Pixel 5'],serviceWorkers:'block',permissions:['clipboard-read','clipboard-write']});
 if(app)await c.addInitScript(()=>{window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',nativePromise:()=>Promise.reject('none')}});
 const p=await c.newPage();const e=[];p.on('pageerror',x=>e.push(x.message));let dlg='';p.on('dialog',d=>{dlg=d.message();d.accept()});let dl=0;p.on('download',()=>dl++);
 const L=app?'APP':'WEB';const go=async(h,w=2500)=>{await p.goto(U+h);await p.waitForTimeout(w);return p.innerText('body')};
 let t=await go('#/app/fcps',5000);console.log(L,'fcps:',counts(t),'| demo note',t.includes('Free demo'),'| buy',/Unlock all|Restore purchase/.test(t));
 t=await go('#/legal/privacy');console.log(L,'privacy has Payments:',t.includes('Google Play handles the payment'));
 t=await go('#/legal/sources');console.log(L,'sources HuBMAP+MakeHuman:',t.includes('HuBMAP Visible Human reference library')&&t.includes('MakeHuman (CC0)'));
 t=await go('#/legal/terms');console.log(L,'terms updated:',t.includes('HuBMAP (CC BY 4.0) and MakeHuman (CC0)'));
 t=await go('#/app/tutor');console.log(L,'tutor no server text:',!/configured an AI model on the server/.test(t));
 t=await go('#/app/admin');console.log(L,'admin text:',t.includes('reserved for the app'));
 await go('#/app/account');await p.getByText('Export as JSON').click();await p.waitForTimeout(1200);
 console.log(L,'export: dialog=',JSON.stringify(dlg),'downloads=',dl,app?'clipboard chars='+(await p.evaluate(()=>navigator.clipboard.readText().then(x=>x.length,()=>-1))):'');
 t=await go('#/app/lab',9000);console.log(L,'lab credit:',/HuBMAP \(CC BY\), MakeHuman \(CC0\)/.test(t),'errors',e.length,e.slice(0,2));
 await c.close()}
await b.close()})()
