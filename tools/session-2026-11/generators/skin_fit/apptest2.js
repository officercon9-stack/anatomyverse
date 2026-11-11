const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({...devices['Pixel 5']});await c.addInitScript(()=>{try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));const bad=[];p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url().slice(-50))});
await p.goto('http://localhost:8150/#/app/lab');
for(let i=0;i<60;i++){await p.waitForTimeout(3000);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total)break}
for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:1000}).catch(()=>{})}
const st=()=>p.evaluate(()=>{const s=globalThis.__r3s.get();let vis=0,skin=null;s.scene.traverse(o=>{if(!o.isMesh)return;let v=true;for(let q=o;q;q=q.parent)if(!q.visible)v=false;if(o.userData.structureId==='skin')skin=[o.name,v,+o.material.opacity.toFixed(2)];else if(v&&o.material.visible!==false)vis++});const z=__avStore.getState();return {sex:z.sex,sel:z.selectedId,skin,innerVisible:vis,ov:globalThis.__avOvS}});
await p.evaluate(()=>__avStore.getState().setSex('female'));await p.waitForTimeout(8000);
console.log('ghost ',JSON.stringify(await st()));await p.screenshot({path:'m_f_ghost.png'});
await p.evaluate(()=>__avStore.getState().setLayerOpacity('skin',1));await p.waitForTimeout(2500);
console.log('solid ',JSON.stringify(await st()));await p.screenshot({path:'m_f_solid.png'});
// tap the body: should select skin
await p.touchscreen.tap(196,330);await p.waitForTimeout(2500);console.log('tapped',JSON.stringify(await st()));await p.screenshot({path:'m_f_tap.png'});
await p.evaluate(()=>__avStore.getState().select(null));await p.waitForTimeout(800);
await p.evaluate(()=>__avStore.getState().select('liver'));await p.waitForTimeout(3000);console.log('liver ',JSON.stringify(await st()));await p.screenshot({path:'m_f_liver.png'});
await p.evaluate(()=>__avStore.getState().select(null));await p.waitForTimeout(800);
await p.evaluate(()=>__avStore.getState().setSex('male'));await p.waitForTimeout(9000);console.log('male  ',JSON.stringify(await st()));await p.screenshot({path:'m_m_solid.png'});
console.log('errors',errs,'bad',bad);await b.close();process.exit(0)})()
