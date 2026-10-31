const H=require('./h');H.serve(process.argv[2],9034);
(async()=>{const {b,ctx,pg}=await H.open(9034,390,844,'/app/lab',13000);const c=await ctx.newCDPSession(pg);
const count=async(ctor)=>{await c.send('HeapProfiler.collectGarbage');const {result}=await c.send('Runtime.evaluate',{expression:ctor+'.prototype'});const {objects}=await c.send('Runtime.queryObjects',{prototypeObjectId:result.objectId});const r=await c.send('Runtime.callFunctionOn',{objectId:objects.objectId,functionDeclaration:'function(){return this.length}',returnByValue:true});return r.result.value};
const snap=async()=>({canvas:await count('HTMLCanvasElement'),gl2:await count('WebGL2RenderingContext'),div:await count('HTMLDivElement'),btn:await count('HTMLButtonElement')});
console.log('start',JSON.stringify(await snap()));
for(let i=0;i<4;i++){await pg.evaluate(()=>location.hash='#/app/dashboard');await pg.waitForTimeout(700);await pg.evaluate(()=>location.hash='#/app/lab');await pg.waitForTimeout(2500)}
console.log('after 4 trips',JSON.stringify(await snap()));
await pg.evaluate(()=>location.hash='#/app/dashboard');await pg.waitForTimeout(1500);console.log('on dashboard',JSON.stringify(await snap()));
await b.close();process.exit(0)})();
