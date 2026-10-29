const H=require('./h');const W=+process.argv[3],Hh=+process.argv[4];H.serve(process.argv[2],8900+W%13);
(async()=>{const {b,pg,errs}=await H.open(8900+W%13,W,Hh,'/app/lab',12000);
for(const id of ['frontal-bone','cornea','cochlea']){await pg.evaluate(id=>{const S=__avStore.getState();S.select(id);S.isolate([id]);S.frame([id])},id);await pg.waitForTimeout(4000);
const bar=await pg.evaluate(()=>{const b=document.getElementById('av-skull-tools');return b&&{d:b.style.display,vis:[...b.querySelectorAll('button')].filter(x=>x.style.display!=='none').map(x=>x.dataset.tool)}});console.log(W,id,JSON.stringify(bar));
const o=(await H.overlaps(pg)).filter(x=>!/Anterior view|Posterior|lateral view|Superior|Inferior|oblique|heartbeat|X-ray|Toggle labels|simplified|Animated|Reset view, layers/.test(x));console.log('  overlaps',JSON.stringify(o.slice(0,8)));await pg.screenshot({path:`t7_${W}_${id}.png`})}
console.log('ERRS',errs.slice(0,3));await b.close();process.exit(0)})();
