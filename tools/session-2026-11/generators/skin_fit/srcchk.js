const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8150/#/legal/sources');await p.waitForTimeout(4000);const t=await p.locator('body').innerText();
const i=t.indexOf('Body surface');console.log(i<0?'NOT LISTED':t.slice(i,i+520));
for(const r of ['#/','#/app/fcps','#/app/quiz']){await p.goto('http://localhost:8150/'+r);await p.waitForTimeout(2500)}
console.log('errors',errs);await b.close();process.exit(0)})()
