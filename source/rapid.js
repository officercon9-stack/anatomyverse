const H=require('./h');H.serve(process.argv[2],9024);
(async()=>{const {b,ctx,pg,errs}=await H.open(9024,390,844,'/app/lab',13000);const c=await ctx.newCDPSession(pg);await c.send('Emulation.setCPUThrottlingRate',{rate:4});
await pg.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>__lt.push(Math.round(e.duration)))).observe({entryTypes:['longtask']})});
const inp=pg.locator('input[placeholder^="Search"]').first();await inp.click();
const t0=Date.now();for(const ch of 'cerebellum'){await inp.type(ch,{delay:0})}const tType=Date.now()-t0;await pg.waitForTimeout(600);
console.log('typing 10 chars took',tType,'ms; results',await pg.evaluate(()=>document.querySelectorAll('[role=option]').length),'longtasks during typing',JSON.stringify(await pg.evaluate(()=>__lt.splice(0))));
for(const q of ['femr','hart','cerebelum','scapular','tibia bone','xyzq']){await inp.fill(q);await pg.waitForTimeout(500);console.log('search',JSON.stringify(q),'->',JSON.stringify(await pg.evaluate(()=>[...document.querySelectorAll('[role=option]')].slice(0,3).map(e=>e.textContent.trim().split(/\s{2,}|3D/)[0].slice(0,24)))),'empty msg:',await pg.evaluate(()=>{const t=document.body.innerText.match(/No (structures|results|matches)[^\n]*/i);return t?t[0].slice(0,60):''}))}
await inp.fill('');await pg.keyboard.press('Escape');
// rapid taps: animate button and tools FAB and sex toggle
for(let i=0;i<8;i++){await pg.getByRole('button',{name:'Male'}).last().click({force:true}).catch(()=>{});await pg.getByRole('button',{name:'Female'}).last().click({force:true}).catch(()=>{})}
await pg.waitForTimeout(1500);console.log('after 16 rapid sex toggles: sex',await pg.evaluate(()=>__avStore.getState().sex),'longtasks',JSON.stringify(await pg.evaluate(()=>__lt.splice(0).slice(0,10))));
for(let i=0;i<6;i++)await pg.locator('#avux-fab').click({force:true}).catch(()=>{});await pg.waitForTimeout(500);console.log('sheets open after 6 FAB taps',await pg.evaluate(()=>document.querySelectorAll('#avux-sheet').length));
await pg.keyboard.press('Escape');
console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(0)})();
