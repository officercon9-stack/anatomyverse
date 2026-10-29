const H=require('./h');H.serve(process.argv[2],8946);
(async()=>{const {b,pg}=await H.open(8946,1280,800,'/app/lab',13000);
await pg.evaluate(()=>{const s=globalThis.__r3s.get();const rc=s.raycaster;const o=rc.intersectObject.bind(rc);window.__n=0;rc.intersectObject=function(){window.__n++;return o.apply(null,arguments)}});
const cv=await pg.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/3}});
await pg.mouse.move(cv.x,cv.y);await pg.mouse.down();for(let i=0;i<30;i++){await pg.mouse.move(cv.x+i*4,cv.y);await pg.waitForTimeout(20)}await pg.mouse.up();await pg.waitForTimeout(300);
console.log('raycasts during 30-step drag',await pg.evaluate(()=>window.__n),'enabled after',await pg.evaluate(()=>globalThis.__r3s.get().events.enabled),'sel',await pg.evaluate(()=>__avStore.getState().selectedId));
await pg.evaluate(()=>window.__n=0);for(let i=0;i<30;i++){await pg.mouse.move(cv.x+i*4,cv.y+40);await pg.waitForTimeout(20)}console.log('raycasts during 30 hover moves',await pg.evaluate(()=>window.__n));
await b.close();process.exit(0)})();
