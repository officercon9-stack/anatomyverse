// Crawl every internal route (hash router) on phone + desktop; record errors, failed requests, overflow, broken images, empty pages.
const {chromium,devices}=require('playwright');const fs=require('fs');
const BASE='http://localhost:8160/';const mode=process.argv[2]||'phone';const appMode=process.argv[3]==='app';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({...(mode==='phone'?devices['Pixel 5']:{viewport:{width:1366,height:820}}),serviceWorkers:'block'});
if(appMode)await c.addInitScript(()=>{window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',nativePromise:()=>Promise.reject('none')}});
const p=await c.newPage();let cur='';const R={};const add=(k,v)=>{(R[cur]=R[cur]||{})[k]=(R[cur][k]||[]).concat([v])};
p.on('pageerror',e=>add('pageerror',e.message.slice(0,200)));
p.on('console',m=>{if(m.type()==='error')add('console',m.text().slice(0,200))});
p.on('response',r=>{if(r.status()>=400)add('http',r.status()+' '+r.url().replace(BASE,''))});
p.on('requestfailed',r=>{if(!/favicon/.test(r.url()))add('failed',r.url().replace(BASE,'')+' '+(r.failure()||{}).errorText)});
const seen=new Set();const queue=['#/','#/app','#/app/lab','#/app/systems','#/app/lessons','#/app/quiz','#/app/fcps','#/app/flashcards','#/app/clinical','#/app/dictionary','#/app/dashboard','#/app/account','#/app/tutor','#/app/admin','#/legal/privacy','#/legal/terms','#/legal/disclaimer','#/legal/sources','#/legal/contact','#/nope-404'];
let first=true;
while(queue.length&&seen.size<140){const h=queue.shift();if(seen.has(h))continue;seen.add(h);cur=h;
  if(first){await p.goto(BASE+h);first=false}else{await p.evaluate(h=>{location.hash=h.slice(1)},h)}
  await p.waitForTimeout(/lab|^#\/app$/.test(h)?9000:1800);
  for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:300}).catch(()=>{})}
  const info=await p.evaluate(()=>{const de=document.documentElement;const ov=de.scrollWidth>window.innerWidth+2;
    const wide=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>window.innerWidth+2&&r.width>0&&getComputedStyle(e).position!=='fixed'&&!e.closest('[style*="overflow"],.overflow-x-auto,.overflow-auto,canvas')}).slice(0,3).map(e=>e.tagName+'.'+(e.className+'').slice(0,40)+':'+(e.innerText||'').slice(0,30));
    const imgs=[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src.slice(-60));
    const links=[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(x=>x&&(x.startsWith('#/')||x.startsWith('/'))).map(x=>x.startsWith('/')?'#'+x:x);
    const ext=[...document.querySelectorAll('a[href^="http"]')].map(a=>a.href);
    const txt=document.body.innerText;const empty=txt.trim().length<40;
    const placeholders=(txt.match(/\blorem\b|\bTODO\b|\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b/g)||[]);
    return {ov,wide,imgs,links,ext,empty,placeholders:placeholders.slice(0,5),title:document.title,h1:(document.querySelector('h1')||{}).innerText||''}});
  if(info.ov)add('overflow',JSON.stringify(info.wide));if(info.imgs.length)add('brokenimg',info.imgs.join(','));if(info.empty)add('empty','page has almost no text');if(info.placeholders.length)add('placeholder',info.placeholders.join(','));
  (R[cur]=R[cur]||{}).h1=info.h1;R[cur].ext=info.ext;
  if(['#/','#/app','#/app/lab','#/app/systems','#/app/lessons','#/app/fcps','#/app/clinical','#/app/dictionary','#/app/quiz','#/app/flashcards','#/app/dashboard','#/app/account','#/legal/privacy','#/nope-404','#/app/tutor','#/app/admin'].includes(h))await p.screenshot({path:`shot_${mode}${appMode?'_app':''}_${h.replace(/[#\/]/g,'_')}.png`});
  for(const l of info.links){const k=l.replace(/\?.*$/,'');if(!seen.has(k)&&!queue.includes(k))queue.push(k)}}
fs.writeFileSync(`crawl_${mode}${appMode?'_app':''}.json`,JSON.stringify(R,null,1));
const probs=Object.entries(R).filter(([k,v])=>Object.keys(v).some(x=>!['h1','ext'].includes(x)));
console.log(mode,appMode?'app':'web','pages',seen.size,'with problems',probs.length);for(const [k,v] of probs)console.log(' ',k,JSON.stringify(Object.fromEntries(Object.entries(v).filter(([x])=>!['h1','ext'].includes(x)))).slice(0,400));
const ext=new Set();Object.values(R).forEach(v=>(v.ext||[]).forEach(e=>ext.add(e)));console.log('external links',[...ext].join(' | ').slice(0,1500));
await b.close()})()
