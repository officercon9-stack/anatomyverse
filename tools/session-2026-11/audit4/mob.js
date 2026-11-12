const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({...devices['Pixel 5']});const p=await c.newPage();
await p.goto('http://localhost:8150/#/app/lab');
const wait=async()=>{let last=-1,same=0;for(let i=0;i<60;i++){await p.waitForTimeout(2500);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total){if(o.total===last){if(++same>=2)break}else{last=o.total;same=0}}}};
await wait();for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:800}).catch(()=>{})}
const info=()=>p.evaluate(()=>{const out=[];__r3s.get().scene.traverse(o=>{if(!o.isMesh)return;const sid=o.userData.structureId||'';const nm=(o.parent&&o.parent.name)+'/'+o.name;if(!/skin|breast|mammary|scrot|penis|vulva|labia|testis|hair/i.test(nm+sid))return;let v=true;for(let q=o;q;q=q.parent)if(!q.visible)v=false;const m=Array.isArray(o.material)?o.material[0]:o.material;if(v&&m.opacity>0.02)out.push(nm+':'+m.opacity.toFixed(2))});const z=__avStore.getState();return {sex:z.sex,low:z.lowPower,skinOp:z.layerOpacity.skin,out}});
console.log('load',JSON.stringify(await info()));await p.screenshot({path:'mob_0.png'});
let i=1;for(const sx of ['Male','Female','Male']){const ok=await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].find(b=>b.title===t+' body');if(b){b.click();return true}return false},sx);await p.waitForTimeout(7000);await p.evaluate(()=>__avStore.getState().setLayerOpacity('skin',1));await p.waitForTimeout(1500);console.log(sx,'btn',ok,JSON.stringify(await info()));await p.screenshot({path:'mob_'+(i++)+'.png'})}
await b.close();process.exit(0)})()
