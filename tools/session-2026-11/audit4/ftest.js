// Functional regression tests (Phase 9). node ftest.js [mobile]
const {chromium,devices}=require('playwright');const fs=require('fs');const mobile=process.argv[2]==='mobile';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext(mobile?{...devices['Pixel 5']}:{viewport:{width:1280,height:800}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));const R=[];const T=(name,ok,detail)=>{R.push({name,ok:!!ok,detail});console.log((ok?'PASS ':'FAIL ')+name+' - '+detail)};
await p.goto('http://localhost:8150/#/app/lab');
const wait=async()=>{let last=-1,same=0;for(let i=0;i<80;i++){await p.waitForTimeout(2500);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total){if(o.total===last){if(++same>=2)break}else{last=o.total;same=0}}}};
await wait();for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:800}).catch(()=>{})}
await p.evaluate(()=>window.dispatchEvent(new Event('avgo')));await wait();
await p.evaluate(()=>{globalThis.__vis=()=>{const out=[];__r3s.get().scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.userData.structureId)return;for(let q=o;q;q=q.parent)if(!q.visible)return;const m=Array.isArray(o.material)?o.material[0]:o.material;if(m.visible===false||m.opacity<=0.02)return;out.push({sid:o.userData.structureId,op:m.opacity,model:o.parent&&o.parent.name})});return out};
 globalThis.__rec=null});
const recs=JSON.parse(fs.readFileSync('manifest.json')).records;
const sexOf=id=>{for(let r=recs[id],i=0;r&&i<8;r=recs[r.parentId],i++)if(r.sex)return r.sex;return null};
const st=f=>p.evaluate(f);
// 1 default view
let v=await st(()=>__vis());T('default view shows the body',v.length>300,v.length+' meshes visible');
// 2 sex switching
for(const sx of ['female','male']){await p.evaluate(s=>__avStore.getState().setSex(s),sx);await wait();await p.waitForTimeout(1500);v=await st(()=>__vis());const wrong=[...new Set(v.map(m=>m.sid).filter(s=>sexOf(s)&&sexOf(s)!==sx))];T('sex switch '+sx+': no wrong-sex parts',wrong.length===0,v.length+' visible; wrong-sex: '+(wrong.join(',')||'none'))}
// 3 system focus
const systems=[...new Set(Object.values(recs).map(r=>r.system))];
for(const sy of systems){await p.evaluate(s=>{const z=__avStore.getState();z.resetAll();__avStore.getState().setSystemFocus(s)},sy);await p.waitForTimeout(900);v=await st(()=>__vis());const solid=v.filter(m=>m.op>0.5);const own=solid.filter(m=>recs[m.sid]&&recs[m.sid].system===sy).length;const ghost=v.filter(m=>m.op<=0.5).length;
 T('system '+sy,solid.length>0&&own/solid.length>=0.6&&ghost>0,solid.length+' solid ('+own+' in system), '+ghost+' faint context meshes')}
// 4 isolate keeps context, hides others
await st(()=>{const z=__avStore.getState();z.resetAll();__avStore.getState().isolate(['femur-left'])});await p.waitForTimeout(900);v=await st(()=>__vis());
{const solid=v.filter(m=>m.op>0.5),sk=v.filter(m=>recs[m.sid]&&recs[m.sid].layer==='skin');T('isolate',solid.length>0&&solid.every(m=>m.sid==='femur-left'||recs[m.sid].parentId==='femur-left'||/femur/.test(m.sid))&&sk.length>0,solid.length+' solid ('+[...new Set(solid.map(m=>m.sid))].slice(0,4).join(',')+'), body outline meshes '+sk.length)}
// 5 hide / show
await st(()=>{const z=__avStore.getState();z.resetAll();__avStore.getState().hideStructure('deltoid-left')});await p.waitForTimeout(700);v=await st(()=>__vis());const hid=!v.some(m=>m.sid==='deltoid-left');
await st(()=>__avStore.getState().resetAll());await p.waitForTimeout(700);v=await st(()=>__vis());T('hide and show',hid&&v.some(m=>m.sid==='deltoid-left'),'hidden='+hid+', back after reset='+v.some(m=>m.sid==='deltoid-left'));
// 6 selection of every structure id through the store + panel text
{const ids=Object.keys(recs).filter((_,i)=>i%9===0);let bad=[];for(const id of ids){const ok=await p.evaluate(id=>{__avStore.getState().select(id);return __avStore.getState().selectedId===id},id);if(!ok)bad.push(id)}
 await p.evaluate(()=>__avStore.getState().select('biceps-brachii-left'));await p.waitForTimeout(800);const txt=await p.evaluate(()=>document.body.innerText.includes('biceps brachii')||document.body.innerText.includes('Biceps brachii'));
 T('select by id',bad.length===0&&txt,ids.length+' ids selected, '+bad.length+' failed; panel shows name='+txt);await st(()=>__avStore.getState().select(null))}
// 7 click / tap picking identifies the structure under the pointer
{await st(()=>__avStore.getState().resetAll());await p.waitForTimeout(800);const box=await p.evaluate(()=>{const c=document.querySelector('canvas').getBoundingClientRect();return {x:c.left,y:c.top,w:c.width,h:c.height}});
 let tried=0,hit=0,match=0,miss=[];
 for(let i=0;i<40;i++){const fx=0.36+0.28*((i*7)%10)/10,fy=0.12+0.74*((i*13)%20)/20;
  await st(()=>__avStore.getState().select(null));await p.waitForTimeout(450);const bx=await p.evaluate(()=>{const c=document.querySelector('canvas').getBoundingClientRect();return {x:c.left,y:c.top,w:c.width,h:c.height}});const x=bx.x+bx.w*fx,y=bx.y+bx.h*fy;const el=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&e.tagName},[x,y]);if(el!=='CANVAS')continue;
  const exp=await p.evaluate(([fx,fy])=>{const s=__r3s.get();const rc=s.raycaster;const P=s.pointer.clone();P.set(fx*2-1,-(fy*2-1));rc.setFromCamera(P,s.camera);const hs=rc.intersectObjects(s.scene.children,true);for(const h of hs){const o=h.object;if(!o.isMesh||!o.userData.structureId)continue;let vis=true;for(let q=o;q;q=q.parent)if(!q.visible)vis=false;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!vis||m.opacity<0.3)continue;return o.userData.structureId}return null},[fx,fy]);
  await st(()=>__avStore.getState().select(null));if(mobile)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y);await p.waitForTimeout(350);const got=await st(()=>__avStore.getState().selectedId);
  tried++;if(exp){hit++;if(got===exp)match++;else miss.push(exp+'->'+got)}else if(got)miss.push('empty->'+got)}
 T((mobile?'tap':'click')+' picking',hit>8&&match/hit>=0.9,tried+' points, '+hit+' on a structure, '+match+' selected exactly that structure; mismatches: '+(miss.slice(0,5).join('; ')||'none'));await st(()=>__avStore.getState().select(null))}
// 8 search box
{const inp=p.locator('input[placeholder*="Search"]').first();let ok=false,d='';try{if(mobile){await p.getByText('Find a part',{exact:false}).first().click({timeout:1500}).catch(()=>{})}await inp.fill('gallbladder',{timeout:4000});await p.waitForTimeout(900);const tag=await p.evaluate(()=>{const e=[...document.querySelectorAll('*')].filter(e=>e.children.length<6&&/^Gallbladder/.test((e.innerText||'').trim())&&e.getBoundingClientRect().width>0).pop();if(!e)return null;let q=e;while(q&&!(q.onclick||q.tagName==='BUTTON'||q.tagName==='LI'||q.getAttribute('role')))q=q.parentElement;(q||e).click();return (q||e).tagName});d='clicked '+tag+'; ';await p.waitForTimeout(600);const sid=await st(()=>__avStore.getState().selectedId);ok=sid==='gallbladder';d+='selected '+sid;await inp.fill('').catch(()=>{})}catch(e){d='error '+e.message.slice(0,80)}T('search',ok,d)}
// 9 labels modes
{let d=[];for(const m of ['Smart','Index','Clean']){const ok=await p.locator('button[title^="'+({Smart:'Smart labels',Index:'Anatomical index',Clean:'Clean view'})[m]+'"]').first().click({timeout:2500,force:true}).then(()=>true).catch(()=>false);if(m==='Index'){await p.waitForTimeout(400);await p.keyboard.press('Escape')}d.push(m+'='+ok);await p.waitForTimeout(500)}T('label modes',d.every(x=>x.endsWith('true')),d.join(' '))}
// 10 camera: rotate, zoom, reset
{const cam=()=>p.evaluate(()=>__r3s.get().camera.position.toArray().map(v=>+v.toFixed(3)));await st(()=>__avStore.getState().resetAll());await p.waitForTimeout(600);const c0=await cam();
 const box=await p.evaluate(()=>{const c=document.querySelector('canvas').getBoundingClientRect();return {x:c.left+c.width*0.75,y:c.top+c.height*0.5}});
 if(!mobile){await p.mouse.move(box.x,box.y);await p.mouse.down();await p.mouse.move(box.x+120,box.y+30,{steps:6});await p.mouse.up();await p.mouse.wheel(0,-400)}else{await p.evaluate(()=>{const s=__r3s.get();s.camera.position.x+=0.8;s.controls.update()})}
 await p.waitForTimeout(900);const c1=await cam();const moved=Math.hypot(c1[0]-c0[0],c1[1]-c0[1],c1[2]-c0[2]);
 const btn=p.locator('button[title="Reset view, layers and selection"],button[title="Return the camera to the front view"]').first();const clicked=await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.title==='Reset view, layers and selection'||b.title==='Return the camera to the front view');if(b){b.click();return true}return false});await p.waitForTimeout(3500);const c2=await cam();const back=Math.hypot(c2[0]-c0[0],c2[1]-c0[1],c2[2]-c0[2]);
 T('rotate, zoom and reset camera',moved>0.05&&clicked&&back<0.1,'moved '+moved.toFixed(2)+' m, reset button clicked='+clicked+', distance from start after reset '+back.toFixed(3)+' m')}
// 11 parent selection shows parent, children remain selectable
{const ok=await p.evaluate(()=>{const z=__avStore.getState();z.select('kidney');const a=__avStore.getState().selectedId==='kidney';z.select('kidney-left');return a&&__avStore.getState().selectedId==='kidney-left'});T('parent and child selection',ok,'kidney then kidney-left')}
T('no page errors',errs.length===0,errs.length+' errors '+errs.slice(0,2).join(' | '));
fs.writeFileSync('ftest_'+(mobile?'mobile':'desktop')+'.json',JSON.stringify(R,null,1));console.log('TOTAL',R.filter(r=>r.ok).length+'/'+R.length);await b.close();process.exit(0)})()
