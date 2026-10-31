const H=require('./h');H.serve(process.argv[2],9023);
(async()=>{const {b,pg,errs}=await H.open(9023,390,844,'/app/lab',13000);
const frame=()=>pg.evaluate(()=>globalThis.__r3s.get().gl.info.render.frame);
await pg.screenshot({path:'cl_0.png'});
await pg.evaluate(()=>{const gl=globalThis.__r3s.get().gl.getContext();window.__ext=gl.getExtension('WEBGL_lose_context');__ext.loseContext()});await pg.waitForTimeout(1500);
await pg.evaluate(()=>window.__ext.restoreContext());await pg.waitForTimeout(4000);
await pg.evaluate(()=>{__avStore.getState().select('heart')});await pg.waitForTimeout(2500);await pg.screenshot({path:'cl_1.png'});
const px=await pg.evaluate(()=>{const c=document.querySelector('canvas');const t=document.createElement('canvas');t.width=c.width;t.height=c.height;const x=t.getContext('2d');x.drawImage(c,0,0);const d=x.getImageData(0,0,t.width,t.height).data;let s=0;for(let i=0;i<d.length;i+=4*97)s+=d[i]+d[i+1]+d[i+2];return s});console.log('canvas pixel sum after restore',px);
// visibility hidden/visible
await pg.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await pg.waitForTimeout(1000);
await pg.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))});await pg.waitForTimeout(1000);
await pg.evaluate(()=>__avStore.getState().select('femur'));await pg.waitForTimeout(1500);console.log('after resume select',await pg.evaluate(()=>__avStore.getState().selectedId));
console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(0)})();
