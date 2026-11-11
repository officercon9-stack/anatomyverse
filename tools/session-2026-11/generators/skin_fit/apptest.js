const {chromium}=require('playwright');
const W=+process.argv[2]||1280,H=+process.argv[3]||900,tag=process.argv[4]||'d';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:W,height:H},isMobile:W<700,hasTouch:W<700});
await c.addInitScript(()=>{try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));const bad=[];p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url().slice(-50))});
await p.goto('http://localhost:8150/#/app/lab');
for(let i=0;i<50;i++){await p.waitForTimeout(3000);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total)break}
for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:1000}).catch(()=>{})}
const info=async()=>p.evaluate(()=>{const s=globalThis.__r3s.get();const out=[];s.scene.traverse(o=>{if(o.isMesh&&(o.userData.structureId==='skin')){let v=true;for(let q=o;q;q=q.parent)if(!q.visible)v=false;out.push(o.name+':'+(v?'vis':'hid')+':'+(o.material.opacity||0).toFixed(2)+':'+o.geometry.attributes.position.count)}});return {sex:__avStore.getState().sex,skin:out,ov:globalThis.__avOvS}});
for(const sx of ['male','female']){
 await p.evaluate(x=>__avStore.getState().setSex(x),sx);await p.waitForTimeout(9000);
 console.log(JSON.stringify(await info()));
 await p.screenshot({path:`app_${tag}_${sx}_ghost.png`});
 await p.evaluate(()=>__avStore.getState().setLayerOpacity('skin',1));await p.waitForTimeout(2500);
 await p.screenshot({path:`app_${tag}_${sx}_solid.png`});
 await p.evaluate(()=>__avStore.getState().setLayerOpacity('skin',0.12));await p.waitForTimeout(800);
}
console.log('errors',errs,'bad',bad);await b.close();process.exit(0)})()
