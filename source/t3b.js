const H=require('./h');H.serve(process.argv[2],8870);
(async()=>{const {b,pg,errs}=await H.open(8870,1280,800,'/app/lab',12000);
// collapse panels for a bigger view
await pg.evaluate(()=>{localStorage.setItem('avux.p',JSON.stringify({left:true,right:true,nav:true}))});await pg.reload();await pg.waitForTimeout(12000);
await pg.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>/got it/i.test(b.textContent)).forEach(b=>b.click()));
const cr=await pg.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
const expect=(x,y)=>pg.evaluate(([x,y,cr])=>{const s=globalThis.__r3s;const nx=((x-cr.x)/cr.w)*2-1,ny=-((y-cr.y)/cr.h)*2+1;s.raycaster.setFromCamera({x:nx,y:ny},s.camera);const hits=s.raycaster.intersectObjects(s.scene.children,true);
const vis=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true};
const sid=o=>{for(let p=o;p;p=p.parent)if(p.userData&&p.userData.structureId)return p.userData.structureId;return null};
const m=hits.filter(h=>h.object.isMesh&&vis(h.object));const first=m[0];const firstOpaque=m.find(h=>{const mt=h.object.material;const op=Array.isArray(mt)?mt[0].opacity:mt.opacity;return op>0.3});
const inv=hits.filter(h=>h.object.isMesh&&!vis(h.object)).length;
return {first:first&&sid(first.object),firstOp:firstOpaque&&sid(firstOpaque.object),n:m.length,inv,firstName:first&&first.object.name}},[x,y,cr]);
const res=[];let ok=0,okOp=0,tot=0;
for(const sc of ['none','skull','heart','hand','eyeball','iso-humerus']){
await pg.evaluate(sc=>{const S=__avStore.getState();S.restoreVisibility();S.select(null);if(sc==='none')S.resetCamera();else if(sc.startsWith('iso-')){S.isolate([sc.slice(4)]);S.frame([sc.slice(4)])}else S.frame([sc])},sc);await pg.waitForTimeout(2500);let lok=0,lt=0;
for(let gy=0.1;gy<=0.9;gy+=0.16)for(let gx=0.1;gx<=0.9;gx+=0.16){const x=cr.x+cr.w*gx,y=cr.y+cr.h*gy;
await pg.evaluate(()=>__avStore.getState().select(null));await pg.waitForTimeout(150);
const e=await expect(x,y);if(!e.first)continue;await pg.mouse.click(x,y);await pg.waitForTimeout(350);
const got=await pg.evaluate(()=>__avStore.getState().selectedId);tot++;lt++;if(got===e.first){ok++;lok++}if(got===e.firstOp)okOp++;
if(got!==e.first&&got!==e.firstOp)res.push(sc+` (${gx.toFixed(2)},${gy.toFixed(2)}) got=${got} firstHit=${e.first}(${e.firstName}) firstOpaque=${e.firstOp}`)}
console.log(sc,'clicks',lt,'ok',lok);}
console.log('clicks',tot,'match first',ok,'match first-opaque',okOp);console.log(res.slice(0,25).join('\n'));
// deselect by clicking empty background
await pg.evaluate(()=>__avStore.getState().select('femur'));await pg.waitForTimeout(300);await pg.mouse.click(cr.x+20,cr.y+cr.h/2);await pg.waitForTimeout(500);console.log('after bg click sel=',await pg.evaluate(()=>__avStore.getState().selectedId));
await pg.evaluate(()=>__avStore.getState().select('femur'));await pg.keyboard.press('Escape');await pg.waitForTimeout(300);console.log('after Esc sel=',await pg.evaluate(()=>__avStore.getState().selectedId));
console.log('ERRS',errs.slice(0,3));await b.close();process.exit(0)})();
