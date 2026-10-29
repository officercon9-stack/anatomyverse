const H=require('./h');H.serve(process.argv[2],8999);
(async()=>{const {b,ctx,pg}=await H.open(8999,390,844,'/app/lab',13000);const c=await ctx.newCDPSession(pg);
await pg.evaluate(()=>{const S=__avStore.getState();S.isolate(['femur']);S.frame(['femur'])});await pg.waitForTimeout(3000);
// find a screen point on the femur via raycast scan
const p=await pg.evaluate(()=>{const s=globalThis.__r3s.get(),cv=document.querySelector('canvas').getBoundingClientRect();for(let y=0.3;y<0.8;y+=0.05)for(let x=0.1;x<0.9;x+=0.02){s.raycaster.setFromCamera({x:x*2-1,y:-(y*2-1)},s.camera);const h=s.raycaster.intersectObjects(s.scene.children,true).find(h=>{for(let q=h.object;q;q=q.parent)if(!q.visible)return false;return true});if(h)return {x:cv.x+x*cv.width,y:cv.y+y*cv.height}}return null});
console.log('point',JSON.stringify(p));
const tap=async(x,y)=>{await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await pg.waitForTimeout(60);await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pg.waitForTimeout(700)};
await tap(p.x,p.y);console.log('tap ->',await pg.evaluate(()=>__avStore.getState().selectedId),'hovered',await pg.evaluate(()=>__avStore.getState().hoveredId));
// drag then check not selecting
await pg.evaluate(()=>__avStore.getState().select(null));await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y}]});for(let i=0;i<15;i++){await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+i*6,y:p.y}]});await pg.waitForTimeout(20)}await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pg.waitForTimeout(600);
console.log('drag ->',await pg.evaluate(()=>__avStore.getState().selectedId),'events enabled',await pg.evaluate(()=>globalThis.__r3s.get().events.enabled));
await b.close();process.exit(0)})();
