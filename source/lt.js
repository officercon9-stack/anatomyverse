const H=require('./h');H.serve(process.argv[2],8971);
(async()=>{const {b,ctx,pg}=await H.open(8971,1440,860,'/app/dashboard',4000);
await pg.evaluate(()=>{const k=Object.keys(localStorage).find(k=>/theme/i.test(k));localStorage.setItem(k||'av.theme','light')});await pg.reload();await pg.waitForTimeout(3000);await pg.screenshot({path:'lt_dash.png'});
await pg.goto('http://localhost:8971/#/app/lab');await pg.waitForTimeout(11000);await pg.screenshot({path:'lt_lab.png'});console.log(await pg.evaluate(()=>document.documentElement.dataset.theme));
await b.close();process.exit(0)})();
