const H=require('./h');const [root,W,Hh,tag]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5]];H.serve(root,8860+W%37);
(async()=>{const {b,pg,errs}=await H.open(8860+W%37,W,Hh,'/app/lab',11000);await pg.screenshot({path:tag+'_a.png'});
await pg.evaluate(()=>__avStore.getState().select('femur'));await pg.waitForTimeout(1500);await pg.screenshot({path:tag+'_b.png'});
console.log(tag,JSON.stringify((await H.overlaps(pg)).filter(x=>!/av-tool|Animate/.test(x)).slice(0,10)));
const L=await pg.$('button[aria-haspopup=menu]');if(L&&await L.isVisible()){await L.click();await pg.waitForTimeout(300);await pg.screenshot({path:tag+'_c.png'})}
console.log('ERRS',errs.slice(0,3));await b.close();process.exit(0)})();
