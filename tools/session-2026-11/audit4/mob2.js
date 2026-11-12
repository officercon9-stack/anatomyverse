const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({...devices['Pixel 5']});const p=await c.newPage();
await p.goto('http://localhost:8150/#/app/lab');
const wait=async()=>{let last=-1,same=0;for(let i=0;i<60;i++){await p.waitForTimeout(2500);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total){if(o.total===last){if(++same>=2)break}else{last=o.total;same=0}}}};
await wait();for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:800}).catch(()=>{})}
await p.evaluate(()=>{__avStore.getState().select('skin')});await p.waitForTimeout(2500);
await p.evaluate(()=>{const st=__r3s.get();st.controls.enableDamping=false;st.camera.position.set(0,1.6,0.5);st.controls.target.set(0,1.6,0);st.controls.update()});await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(()=>{const r=[];__r3s.get().scene.traverse(o=>{if(o.isMesh&&/skin_/.test(o.name)){const m=o.material;r.push([o.name,m.type,m.opacity,m.transparent,m.depthWrite,m.depthTest,m.side,o.renderOrder,o.visible])}});return {low:__avStore.getState().lowPower,r}})));
await p.screenshot({path:'mob2.png'});await b.close();process.exit(0)})()
