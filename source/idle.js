const H=require('./h');H.serve(process.argv[2],8996);const W=+process.argv[3]||390,Hh=+process.argv[4]||844,route=process.argv[5]||'/app/lab';
(async()=>{const {b,pg}=await H.open(8996,W,Hh,route,14000);
const f=async()=>pg.evaluate(()=>{const s=globalThis.__r3s&&globalThis.__r3s.get();return s?s.gl.info.render.frame:-1});
const a=await f();await pg.waitForTimeout(3000);const c=await f();console.log(route,'frames rendered during 3s idle:',c-a);
await pg.evaluate(()=>__avStore.getState().select('heart'));await pg.waitForTimeout(4000);const d=await f();await pg.waitForTimeout(3000);const e=await f();console.log('after selecting heart, idle 3s:',e-d);
console.log('css animations running:',await pg.evaluate(()=>document.getAnimations().map(x=>(x.animationName||x.constructor.name)+':'+(x.effect&&x.effect.target&&(x.effect.target.className+'').slice(0,40))).slice(0,10)));
await b.close();process.exit(0)})();
