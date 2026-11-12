const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();
await p.goto('http://localhost:8150/#/app/lab');await p.waitForTimeout(25000);for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:800}).catch(()=>{})}
const recs=JSON.parse(fs.readFileSync('manifest.json')).records;
for(const sy of ['respiratory','urinary','reproductive','endocrine','digestive','integumentary']){const v=await p.evaluate(s=>{const z=__avStore.getState();z.resetAll();__avStore.getState().setSystemFocus(s);return new Promise(r=>setTimeout(()=>{const out=[];__r3s.get().scene.traverse(o=>{if(!o.isMesh||!o.userData.structureId)return;for(let q=o;q;q=q.parent)if(!q.visible)return;const m=Array.isArray(o.material)?o.material[0]:o.material;if(m.opacity>0.5)out.push(o.userData.structureId)});r(out)},900))},sy);console.log(sy,v.length,v.filter(i=>!recs[i]||recs[i].system!==sy).map(i=>i+':'+(recs[i]&&recs[i].system)))}
await p.evaluate(()=>__avStore.getState().resetAll());await p.waitForTimeout(500);
const bt=await p.evaluate(()=>[...document.querySelectorAll('button')].map(b=>(b.innerText||'').trim().slice(0,18)+'|'+(b.title||'')+'|'+(b.getAttribute('aria-label')||'')).filter(s=>s.length>2).slice(0,70));console.log(bt.join('  ;  '));
const inp=await p.evaluate(()=>[...document.querySelectorAll('input')].map(i=>i.placeholder+'|'+i.type));console.log(inp);
await p.locator('input').first().fill('gallbladder');await p.waitForTimeout(1200);console.log(await p.evaluate(()=>[...document.querySelectorAll('li,button,[role=option]')].map(e=>e.innerText.trim().replace(/\n/g,' / ').slice(0,50)).filter(t=>/allbladder/i.test(t)).slice(0,6)));
await b.close();process.exit(0)})()
