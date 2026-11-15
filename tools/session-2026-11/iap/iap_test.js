const {chromium}=require('playwright');
const mock=(owned,pending)=>`(()=>{let own=${owned};window.__calls=[];window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',nativePromise:(p,m,o)=>{__calls.push(m);
 if(m==='getProducts')return Promise.resolve({products:[{identifier:'fcps_full_access',priceString:'Rs 1,500'}]});
 if(m==='getPurchases')return Promise.resolve({purchases:(own||sessionStorage.bought)?[{productIdentifier:'fcps_full_access',purchaseState:'1'}]:[]});
 if(m==='restorePurchases')return Promise.resolve();
 if(m==='purchaseProduct'){if(${pending})return Promise.resolve({productIdentifier:'fcps_full_access',purchaseState:'2'});sessionStorage.bought=1;return Promise.resolve({productIdentifier:'fcps_full_access',purchaseState:'1'})}
 return Promise.reject('no')}}})()`;
const counts=t=>(t.match(/\d+ questions/g)||[]).slice(0,6).join(' ');
(async()=>{const b=await chromium.launch();const U='http://localhost:8160/#/app/fcps';
async function ctx(init){const c=await b.newContext({serviceWorkers:'block'});if(init)await c.addInitScript(init);const p=await c.newPage();const e=[];p.on('pageerror',x=>e.push(x.message));return [c,p,e]}
let [c,p,e]=await ctx(null);await p.goto(U);await p.waitForTimeout(5000);let t=await p.innerText('body');console.log('WEB      :',counts(t),'| demo note',t.includes('Free demo'),'| buy btn',t.includes('Unlock all questions'),e);await c.close();
[c,p,e]=await ctx(mock(false,false));await p.goto(U);await p.waitForTimeout(5000);t=await p.innerText('body');console.log('APP free :',counts(t),'| buy btn',t.includes('Unlock all questions · Rs 1,500'),e);
await p.click('[data-testid=fcps-buy]');await p.waitForTimeout(6000);t=await p.innerText('body');console.log('APP paid :',counts(t),'| buy btn gone',!t.includes('Unlock all questions'),'| owned',await p.evaluate(()=>localStorage.avFcpsOwned));
await p.reload();await p.waitForTimeout(5000);t=await p.innerText('body');console.log('APP reopen:',counts(t),e);await c.close();
[c,p,e]=await ctx(mock(false,true));await p.goto(U);await p.waitForTimeout(4000);await p.click('[data-testid=fcps-buy]');await p.waitForTimeout(1500);t=await p.innerText('body');console.log('PENDING  :',t.includes('Payment is pending'),counts(t));await c.close();
[c,p,e]=await ctx(mock(true,false));await p.goto(U);await p.waitForTimeout(4000);await p.waitForTimeout(7000);t=await p.innerText('body');console.log('REINSTALL (auto-restore):',counts(t));await c.close();
[c,p,e]=await ctx(mock(false,false)+';try{if(!sessionStorage.seeded){sessionStorage.seeded=1;localStorage.avFcpsOwned="1"}}catch(e){}');await p.goto(U);await p.waitForTimeout(9000);t=await p.innerText('body');console.log('REFUNDED :',counts(t),'| buy btn back',t.includes('Unlock all questions'));await c.close();
await b.close()})()
