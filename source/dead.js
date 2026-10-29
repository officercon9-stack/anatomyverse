const H=require('./h');const root=process.argv[2],routes=process.argv[3].split(','),W=+process.argv[4]||1280,Hh=+process.argv[5]||800;H.serve(root,8950+W%11);
(async()=>{const {b,pg,errs}=await H.open(8950+W%11,W,Hh,routes[0],6000);
const sig=()=>pg.evaluate(()=>{const s=globalThis.__avStore?JSON.stringify(Object.fromEntries(Object.entries(__avStore.getState()).filter(([k,v])=>typeof v!=='function'))):'';let ls='';try{ls=JSON.stringify(localStorage)}catch(e){}
return location.hash+'|'+document.body.innerText.length+'|'+document.querySelectorAll('*').length+'|'+[...document.querySelectorAll('[aria-expanded],[aria-pressed],[aria-checked],[aria-selected]')].map(e=>(e.getAttribute('aria-expanded')||'')+(e.getAttribute('aria-pressed')||'')+(e.getAttribute('aria-checked')||'')+(e.getAttribute('aria-selected')||'')).join('')+'|'+s.length+s.slice(0,0)+'|'+(s.match(/./g)||[]).length+'|'+ls.length+'|'+document.title+'|'+(document.activeElement&&document.activeElement.tagName)+'|'+(document.documentElement.dataset.theme||'')+'|'+document.body.innerText.slice(0,4000)});
const dead=[];
for(const r of routes){await pg.goto(`http://localhost:${8950+W%11}/#${r}`);await pg.waitForTimeout(r==='/'?7000:2500);
 const labels=await pg.evaluate(()=>[...document.querySelectorAll('main button, main a[href], header button, header a[href], section button, aside button, aside a[href]')].filter(e=>{const x=e.getBoundingClientRect();return x.width>2&&x.height>2&&!e.disabled&&e.getAttribute('aria-disabled')!=='true'}).map((e,i)=>{e.dataset.dk='k'+i;return 'k'+i+'::'+(e.getAttribute('aria-label')||e.textContent).trim().replace(/\s+/g,' ').slice(0,40)}));
 for(const L of labels.slice(0,45)){const [k,lab]=L.split('::');if(/^(English|Latina)/.test(lab))continue;
  await pg.goto(`http://localhost:${8950+W%11}/#${r}`).catch(()=>{});await pg.waitForTimeout(r==='/'?4000:1200);
  await pg.evaluate(()=>[...document.querySelectorAll('main button, main a[href], header button, header a[href], section button, aside button, aside a[href]')].filter(e=>{const x=e.getBoundingClientRect();return x.width>2&&x.height>2&&!e.disabled&&e.getAttribute('aria-disabled')!=='true'}).forEach((e,i)=>e.dataset.dk='k'+i));
  const s0=await sig();const el=await pg.$(`[data-dk="${k}"]`);if(!el){continue}
  const href=await el.evaluate(e=>e.getAttribute('href'));
  try{await el.click({timeout:2500})}catch(e){dead.push(r+' :: '+lab+' :: NOT CLICKABLE ('+e.message.split('\n')[0].slice(0,80)+')');continue}
  await pg.waitForTimeout(700);const s1=await sig();
  if(s0===s1&&!(href&&/^https?:|^mailto:|^tel:/.test(href)))dead.push(r+' :: '+lab+(href?' (href '+href+')':''))}
}
console.log(W+'x'+Hh,'DEAD/UNCHANGED:\n'+dead.join('\n'));console.log('ERRS',errs.slice(0,5));await b.close();process.exit(0)})();
