const H=require('./h');H.serve('ghclone',9895);
(async()=>{const {b,pg,errs}=await H.open(9895,1280,720,'/app/lab',12000);
await pg.evaluate(()=>__avStore.getState().select('heart'));await pg.waitForTimeout(5000);
const t=await pg.evaluate(()=>document.body.innerText);console.log('lab reviewed text:',/Reviewed by Dr\. Aqsa/.test(t),'pending:',/pending expert|under review/i.test(t));
for(const r of ['/app/systems','/app/quiz','/app/tutor','/legal/disclaimer','/']){await pg.goto('http://localhost:9895/#'+r);await pg.waitForTimeout(2500);const x=await pg.evaluate(()=>document.body.innerText);console.log(r,/Aqsa/.test(x),/pending expert|under review/i.test(x))}
await pg.goto('http://localhost:9895/#/app/systems');await pg.waitForTimeout(2500);await pg.screenshot({path:'chk/rv.png'});
console.log(errs.slice(0,3));await b.close();process.exit(0)})();
