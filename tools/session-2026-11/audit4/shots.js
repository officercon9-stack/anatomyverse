// Screenshot harness: node shots.js spec.json   (spec = {sex, steps:[{out, sex?, isolate?, focus?, select?, cam, tgt, skin?, reset?, eval?}]})
const {chromium}=require('playwright');const fs=require('fs');
const spec=JSON.parse(fs.readFileSync(process.argv[2]));
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:spec.viewport||{width:1000,height:800}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
await p.goto('http://localhost:'+(spec.port||8150)+'/#/app/lab');
const wait=async()=>{let last=-1,same=0;for(let i=0;i<80;i++){await p.waitForTimeout(2500);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total){if(o.total===last){if(++same>=2)break}else{last=o.total;same=0}}}};
await wait();for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:800}).catch(()=>{})}
await p.evaluate(s=>__avStore.getState().setSex(s),spec.sex||'male');
if(spec.allGates!==false){await p.evaluate(()=>globalThis.__avb.set({ld_jlo:!0,ld_jup:!0,ld_bur:!0,ld_lyu:!0,ld_lyl:!0,vessels:!0,csf:!0,fossae:!0,tracts:!0,mening:!0,dia:!0}));await p.evaluate(()=>window.dispatchEvent(new Event('avgo')));}
await wait();await p.waitForTimeout(2000);
for(const s of spec.steps){
  if(s.sex){await p.evaluate(x=>__avStore.getState().setSex(x),s.sex);await wait()}
  await p.evaluate(s=>{const z=__avStore.getState();if(s.reset!==false){z.resetAll&&z.resetAll()}
    const z2=__avStore.getState();if(s.labels===false)z2.setLabels(false);
    if(s.skin!=null)z2.setLayerOpacity('skin',s.skin);
    if(s.layers){for(const k in s.layers)z2.setLayerVisible(k,s.layers[k])}
    if(s.isolate)z2.isolate(s.isolate);if(s.focus)z2.setSystemFocus(s.focus);if(s.select!==undefined)z2.select(s.select);if(s.hide)for(const h of s.hide)z2.hideStructure(h);
    if(s.eval)(0,eval)(s.eval)},s);
  await p.waitForTimeout(s.wait||1500);
  if(s.cam){await p.evaluate(s=>{const st=globalThis.__r3s.get();const c=st.controls;c.enableDamping=false;st.camera.position.set(...s.cam);c.target.set(...s.tgt);st.camera.near=0.005;st.camera.updateProjectionMatrix();c.update();st.invalidate&&st.invalidate()},s);await p.waitForTimeout(900);
    await p.evaluate(s=>{const st=globalThis.__r3s.get();const c=st.controls;st.camera.position.set(...s.cam);c.target.set(...s.tgt);c.update();st.invalidate&&st.invalidate()},s);await p.waitForTimeout(1200)}
  if(s.info){console.log(s.out,JSON.stringify(await p.evaluate(s.info)))}
  await p.screenshot({path:s.out+'.png'});console.log('shot',s.out)}
console.log('errors',errs.slice(0,3));await b.close();process.exit(0)})()
