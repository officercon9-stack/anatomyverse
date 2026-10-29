const H=require('./h');H.serve(process.argv[2],8880);
(async()=>{const {b,pg,errs}=await H.open(8880,1280,800,'/app/lab',12000);
const proj=id=>pg.evaluate(id=>{const s=globalThis.__r3s,cv=document.querySelector('canvas').getBoundingClientRect();let best=null;s.scene.updateMatrixWorld(true);s.scene.traverse(o=>{if(!o.isMesh)return;let v=true;for(let p=o;p;p=p.parent)if(!p.visible)v=false;if(!v)return;let sid;for(let p=o;p;p=p.parent)if(p.userData&&p.userData.structureId){sid=p.userData.structureId;break}if(sid!==id)return;o.geometry.computeBoundingSphere();const c=o.geometry.boundingSphere.center.clone().applyMatrix4(o.matrixWorld).project(s.camera);if(!best)best={x:cv.x+(c.x+1)/2*cv.width,y:cv.y+(1-c.y)/2*cv.height}});return best},id);
const sel=()=>pg.evaluate(()=>__avStore.getState().selectedId);
// isolation: isolate humerus, click on it, then click where femur would be
let ids=await pg.evaluate(()=>Object.keys(__avF).filter(k=>/humer|femur$/.test(k)));console.log('ids',ids.join(','));
await pg.evaluate(()=>{const S=__avStore.getState();S.isolate(['femur']);S.frame(['femur'])});await pg.waitForTimeout(2500);
let p=await proj('femur');console.log('femur proj',JSON.stringify(p));if(p){await pg.mouse.click(p.x,p.y);await pg.waitForTimeout(500);console.log('iso click ->',await sel())}
// click a point that has only hidden stuff (e.g. where tibia would be)
const pt=await pg.evaluate(()=>{const S=__avStore.getState();return 1});
await pg.evaluate(()=>{const S=__avStore.getState();S.select(null)});
let pt2=await proj('tibia');console.log('tibia proj (hidden, expect null)',JSON.stringify(pt2));
await pg.evaluate(()=>__avStore.getState().restoreVisibility());await pg.waitForTimeout(800);
// hidden object must not block: hide skin & muscles layer then click femur
await pg.evaluate(()=>{const S=__avStore.getState();S.resetCamera();S.frame(['femur'])});await pg.waitForTimeout(2500);
p=await proj('femur');await pg.mouse.click(p.x,p.y);await pg.waitForTimeout(500);console.log('click femur with muscles visible ->',await sel());
await pg.evaluate(()=>{const S=__avStore.getState();S.select(null);S.setLayerVisible('muscles',false);S.setLayerVisible('skin',false)});await pg.waitForTimeout(1000);
p=await proj('femur');await pg.mouse.click(p.x,p.y);await pg.waitForTimeout(500);console.log('click femur with muscles hidden ->',await sel());
await pg.evaluate(()=>{const S=__avStore.getState();S.select(null);S.setLayerVisible('muscles',true);S.setLayerVisible('skin',true)});
// search
const sb=pg.getByRole('searchbox').first();const sbc=await sb.count();console.log('searchboxes',sbc);
const inp=sbc?sb:pg.locator('input[type=search],input[placeholder*=Search]').first();await inp.fill('cochlea');await pg.waitForTimeout(900);
const opts=await pg.evaluate(()=>[...document.querySelectorAll('[role=option],[role=listbox] li,li button')].slice(0,8).map(e=>e.textContent.trim().slice(0,40)));console.log('results',JSON.stringify(opts));
const o=pg.locator('[role=option]').filter({hasText:/^Cochlea/}).first();if(await o.count()){await o.click();await pg.waitForTimeout(1500);console.log('search select ->',await sel())}else{await inp.press('Enter');await pg.waitForTimeout(1500);console.log('search enter ->',await sel())}
// deselect via close and reset
await pg.getByRole('button',{name:'Reset view'}).first().click();await pg.waitForTimeout(500);
await pg.evaluate(()=>__avStore.getState().resetAll());await pg.waitForTimeout(800);console.log('after resetAll',await pg.evaluate(()=>{const s=__avStore.getState();return JSON.stringify({sel:s.selectedId,h:s.hidden.length,iso:s.isolated,lv:s.layerVisible})}));
console.log('ERRS',errs.slice(0,3));await b.close();process.exit(0)})();
