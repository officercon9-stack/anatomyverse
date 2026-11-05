const {chromium}=require('playwright');const H=require('./h');const fs=require('fs');const {execSync}=require('child_process');
const port=9700;execSync('rm -rf up_live && cp -r up_old up_live');H.serve('up_live',port);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:800},isMobile:true,hasTouch:true});await ctx.addInitScript(()=>{try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});
const ready=()=>pg.evaluate(()=>!!(globalThis.__r3s&&globalThis.__r3s.get().scene&&globalThis.__r3s.get().scene.children.length>3)).catch(()=>false);
await pg.goto('http://localhost:'+port+'/#/app/lab');await pg.waitForTimeout(12000);console.log('old ready',await ready(),errs);
execSync('rm -rf up_live/* && cp -r ghclone/* up_live/');   // deploy new version (old chunk files gone)
errs.length=0;await pg.reload();await pg.waitForTimeout(14000);console.log('after update ready',await ready(),errs.slice(0,5));
await pg.reload();await pg.waitForTimeout(10000);console.log('2nd reload ready',await ready(),errs.slice(0,5));
await b.close();process.exit(0)})();
