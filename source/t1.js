const H=require('./h');const root=process.argv[2];H.serve(root,8850);
(async()=>{for(const [W,Hh,tag] of [[360,740,'p360'],[390,844,'p390'],[740,360,'l740'],[844,390,'l844']]){const {b,pg,errs}=await H.open(8850,W,Hh);
let o=await H.overlaps(pg);o=o.filter(x=>!/av-tool|Animate|Anterior|Posterior|lateral|Superior|Inferior|oblique|heartbeat|X-ray|labels|simplified|Animated|Reset view, layers/.test(x));console.log(tag,'idle',o.length,JSON.stringify(o.slice(0,12)));await pg.screenshot({path:'t1_'+tag+'_a.png'});
await pg.evaluate(()=>__avStore.getState().select('femur'));await pg.waitForTimeout(1500);o=await H.overlaps(pg);o=o.filter(x=>!/av-tool|Animate|Anterior|Posterior|lateral|Superior|Inferior|oblique|heartbeat|X-ray|labels|simplified|Animated|Reset view, layers/.test(x));console.log(tag,'selected',o.length,JSON.stringify(o.slice(0,12)));await pg.screenshot({path:'t1_'+tag+'_b.png'});
console.log(tag,'errs',JSON.stringify(errs.slice(0,3)));await b.close()}process.exit(0)})();
