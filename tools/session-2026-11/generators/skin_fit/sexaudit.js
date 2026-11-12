const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({...devices['Pixel 5']});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));const reqs=[];p.on('request',r=>{if(/\.glb/.test(r.url()))reqs.push(r.url().split('/').pop())});
await p.goto('http://localhost:8150/#/app/lab');
const wait=async()=>{for(let i=0;i<60;i++){await p.waitForTimeout(2500);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total)break}await p.waitForTimeout(2500)};
await wait();for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:1000}).catch(()=>{})}
await p.evaluate(async()=>{const m=await import('/assets/assetManifest-D3o27EUe-b163.js');for(const k in m){const v=m[k];if(v&&typeof v==='object'&&v.skin&&v.skin.layer==='skin'){globalThis.__recs=v;break}}});
const audit=()=>p.evaluate(()=>{const R=globalThis.__recs;const sexOf=t=>{let i=0;for(let r=R[t];r&&i<8;r=R[r.parentId],i++)if(r.sex)return r.sex;return null};const s=globalThis.__r3s.get();const z=__avStore.getState();const wrong=[],right=new Set();let drawn=0;
 s.scene.traverse(o=>{if(!o.isMesh)return;let v=true;for(let q=o;q;q=q.parent)if(!q.visible)v=false;const m=o.material;if(!(v&&m.visible!==false&&m.opacity>0.02))return;drawn++;const sid=o.userData.structureId;const sx=sid&&sexOf(sid);if(sx&&sx!==z.sex)wrong.push(o.name+'|'+sid);else if(sx)right.add(sid);if(/skin_body_(male|female)/.test(o.name)&&!o.name.endsWith(z.sex))wrong.push(o.name)});
 return {sex:z.sex,sel:z.selectedId,drawn,wrongSex:wrong,ownSexParts:[...right]}});
console.log('first load',JSON.stringify(await audit()));
console.log('glb requests so far',reqs.filter(x=>/skin|scrot|vulva|urethra/.test(x)));
await p.screenshot({path:'aud_f.png'});
await p.evaluate(()=>__avStore.getState().setSex('male'));await wait();console.log('male',JSON.stringify(await audit()));await p.screenshot({path:'aud_m.png'});
await p.evaluate(()=>__avStore.getState().select('skin'));await p.waitForTimeout(3000);console.log('male, skin selected',JSON.stringify(await audit()));await p.screenshot({path:'aud_m_skin.png'});
await p.evaluate(()=>__avStore.getState().select(null));
await p.evaluate(()=>__avStore.getState().setSex('female'));await wait();console.log('female again',JSON.stringify(await audit()));
await p.evaluate(()=>__avStore.getState().select('skin'));await p.waitForTimeout(3000);console.log('female, skin selected',JSON.stringify(await audit()));await p.screenshot({path:'aud_f_skin.png'});
await p.evaluate(()=>__avStore.getState().select('uterus'));await p.waitForTimeout(3000);console.log('female, uterus',JSON.stringify(await audit()).slice(0,200));
await p.evaluate(()=>__avStore.getState().select('prostate'));await p.waitForTimeout(8000);console.log('select prostate from female',JSON.stringify(await audit()).slice(0,260));
console.log('errors',errs);await b.close();process.exit(0)})()
