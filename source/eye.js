const H=require('./h');H.serve(process.argv[2],9010);const tag=process.argv[3]||'eye';
(async()=>{const {b,ctx,pg}=await H.open(9010,390,844,'/app/lab',13000);const c=await ctx.newCDPSession(pg);
const inp=pg.locator('input[placeholder^="Search"]').first();await inp.click();await inp.fill('eye');await pg.waitForTimeout(900);
await pg.screenshot({path:tag+'_1.png'});
const opts=await pg.evaluate(()=>[...document.querySelectorAll('[role=option]')].slice(0,6).map(e=>e.textContent.trim().slice(0,50)));console.log('opts',JSON.stringify(opts));
await pg.locator('[role=option]').first().click();await pg.waitForTimeout(3000);console.log('focused after pick:',await pg.evaluate(()=>document.activeElement&&document.activeElement.tagName));
const st=await pg.evaluate(()=>{const s=__avStore.getState();return JSON.stringify({sel:s.selectedId,iso:s.isolated,xray:s.xray,lv:s.layerVisible,lo:s.layerOpacity})});console.log('state',st);
await pg.screenshot({path:tag+'_2.png'});
const sheet=await pg.evaluate(()=>{const e=document.querySelector('.av-panel.fixed.inset-x-0.bottom-0');if(!e)return null;const r=e.getBoundingClientRect();return {top:r.top,h:r.height,cls:e.className}});console.log('sheet',JSON.stringify(sheet));
// meshes of selected structure and their state
console.log(await pg.evaluate(()=>{const id=__avStore.getState().selectedId,F=__avF;const out=[];globalThis.__scn.traverse(o=>{if(!o.isMesh)return;let sid;for(let p=o;p;p=p.parent)if(p.userData&&p.userData.structureId){sid=p.userData.structureId;break}let r=F[sid],anc=false;for(let g=0;r&&g<8;g++){if(r.id===id){anc=true;break}r=F[r.parentId]}if(!anc)return;let v=true;for(let p=o;p;p=p.parent)if(!p.visible)v=false;const m=o.material;out.push(o.name+' sid='+sid+' vis='+v+' op='+(m.opacity).toFixed(2)+' em='+(m.emissive?m.emissive.getHexString():'')+'/'+(m.emissiveIntensity||0).toFixed(2))});return out.slice(0,20).join('\n')+'\nparts '+out.length}));
console.log('children of eye:',await pg.evaluate(()=>Object.values(__avF).filter(r=>r.parentId===__avStore.getState().selectedId).map(r=>r.id).join(',')));
await b.close();process.exit(0)})();
