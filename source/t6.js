const H=require('./h');const W=+process.argv[3]||1280,Hh=+process.argv[4]||800;H.serve(process.argv[2],8890+W%7);
(async()=>{const {b,pg,errs}=await H.open(8890+W%7,W,Hh,'/app/lab',12000);
const state=()=>pg.evaluate(()=>{let moved=0,tot=0,hiddenM=0,trans=0;globalThis.__scn.traverse(m=>{const u=m.userData&&m.userData.__fx;if(!u)return;tot++;if(!m.matrix.equals(u.m0))moved++;if(!m.visible)hiddenM++;const mt=m.material;if(mt&&!Array.isArray(mt)&&mt.transparent&&mt.opacity<0.9)trans++});const bar=document.getElementById('av-skull-tools');
return {tot,moved,hiddenM,trans,bar:bar&&bar.style.display,btns:bar?[...bar.querySelectorAll('button')].map(b=>b.dataset.tool):[],labels:(document.querySelector('svg[style*="z-index: 35"]')||{}).childElementCount}});
const click=t=>pg.evaluate(t=>{const b=document.querySelector('#av-skull-tools button[data-tool='+t+']');if(!b)return false;b.click();return true},t);
for(const [id,tools] of [['frontal-bone',['jaw','explode','xray','labels','parts']],['cornea',['explode','xray','labels','section','parts']],['cochlea',['explode','xray','labels','section','parts']]]){
 await pg.evaluate(id=>{const S=__avStore.getState();S.select(id);S.isolate([id]);S.frame([id])},id);await pg.waitForTimeout(3500);
 const s0=await state();console.log('\n==',id,'bar',s0.bar,'tools',s0.btns.join(','),'base',JSON.stringify(s0));
 for(const t of tools){if(!s0.btns.includes(t)){console.log(' ',t,'MISSING');continue}await click(t);await pg.waitForTimeout(2200);const on=await state();await pg.screenshot({path:`t6_${W}_${id}_${t}.png`});await click(t);await pg.waitForTimeout(2200);const off=await state();
  console.log(' ',t,'on:',JSON.stringify({moved:on.moved,hid:on.hiddenM,trans:on.trans,labels:on.labels}),'off:',JSON.stringify({moved:off.moved,hid:off.hiddenM,trans:off.trans,labels:off.labels}))}
 // leave group while toggles on -> restore
 await click(s0.btns.includes('explode')?'explode':'xray');await pg.waitForTimeout(1500);
 await pg.evaluate(()=>{__avStore.getState().select(null);__avStore.getState().restoreVisibility();__avStore.getState().resetCamera()});await pg.waitForTimeout(3000);const back=await state();console.log('  after leaving group with tool on:',JSON.stringify({moved:back.moved,hid:back.hiddenM,trans:back.trans,bar:back.bar}));
}
console.log('ERRS',errs.slice(0,3));await b.close();process.exit(0)})();
