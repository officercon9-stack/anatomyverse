const H=require('./h');const port=9300+Math.floor(Math.random()*90);H.serve('ghclone',port);
(async()=>{const {b,pg,errs}=await H.open(port,390,800,'/app/lab',9000);
const reqs=[];pg.on('request',r=>{if(/zanatomy-(joints|bursae|lymph)/.test(r.url()))reqs.push(r.url().replace(/.*\//,''))});
for(const id of ['medial-meniscus-left','subacromial-bursa-left','inferior-superficial-inguinal-nodes-left']){
 reqs.length=0;await pg.evaluate(i=>__avStore.getState().select(i),id);await pg.waitForTimeout(7000);
 const f=await pg.evaluate(()=>Object.entries(globalThis.__avb.get()).filter(([k,v])=>/^ld_(j|bur|ly)/.test(k)&&v).map(x=>x[0]));
 console.log(id,JSON.stringify(f),reqs.join(','));}
console.log(errs.slice(0,3));await b.close();process.exit(0)})();
