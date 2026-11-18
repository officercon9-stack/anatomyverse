const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:3,isMobile:true,hasTouch:true,serviceWorkers:'block'});
await c.addInitScript(()=>{window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',nativePromise:()=>Promise.reject('none')}});
const p=await c.newPage();const U='http://localhost:8160/';
await p.goto(U+'#/app/lab');let last=-1;for(let i=0;i<60;i++){await p.waitForTimeout(2500);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total&&o.total===last)break;if(o)last=o.total}
for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:600}).catch(()=>{})}
await p.waitForTimeout(1500);await p.screenshot({path:'n-body.png'});
await p.evaluate(()=>{const z=__avStore.getState();z.resetAll();z.setSystemFocus('muscular')});await p.waitForTimeout(2500);await p.screenshot({path:'n-muscle.png'});
await p.evaluate(()=>{const z=__avStore.getState();z.resetAll();z.select('heart')});await p.waitForTimeout(3000);await p.screenshot({path:'n-heart.png'});
for(const [h,n] of [['#/app/fcps','n-fcps'],['#/app/systems','n-systems'],['#/app/clinical','n-clinical'],['#/app/lessons','n-lessons']]){await p.goto(U+h);await p.waitForTimeout(3500);await p.screenshot({path:n+'.png'})}
await p.goto(U+'#/app/fcps');await p.waitForTimeout(3000);
const qb=p.getByText(/question bank/i).first();await qb.click({timeout:3000}).catch(()=>console.log('no qb'));await p.waitForTimeout(2500);await p.screenshot({path:'n-qbank.png'});
await b.close()})()
