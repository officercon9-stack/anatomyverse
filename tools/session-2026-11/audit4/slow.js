const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({...devices['Pixel 5']});const p=await c.newPage();
const cdp=await c.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:180000,uploadThroughput:90000});
await p.goto('http://localhost:8150/#/app/lab');
for(let i=0;i<60;i++){if(await p.evaluate(()=>!!globalThis.__avStore))break;await p.waitForTimeout(500)}
const sx=process.argv[2]||'male';await p.evaluate(s=>{__avStore.getState().setSex(s);__avStore.getState().setLayerOpacity('skin',1)},sx);
let prev='';for(let t=0;t<45;t++){await p.waitForTimeout(2000);const r=await p.evaluate(()=>{const out=[];const sc=globalThis.__r3s&&__r3s.get().scene;if(!sc)return 'noscene';sc.traverse(o=>{if(!o.isMesh)return;const sid=o.userData.structureId||'';const nm=(o.parent&&o.parent.name||'').replace('schematic-body-v1','S')+'/'+o.name;if(!/skin|breast|mammary|scrot|penis|vulva|labia|testis|hair/i.test(nm+sid))return;let v=true;for(let q=o;q;q=q.parent)if(!q.visible)v=false;const m=Array.isArray(o.material)?o.material[0]:o.material;if(v&&m.opacity>0.02)out.push(nm)});return JSON.stringify(globalThis.__avOvS)+' '+out.join(',')});
 if(r!==prev){console.log((t*2+2)+'s',r.slice(0,600));prev=r;if(t<30)await p.screenshot({path:'slow_'+sx+'_'+(t*2+2)+'.png'})}}
await b.close();process.exit(0)})()
