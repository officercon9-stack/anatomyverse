const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1024,height:500}});
const img=f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
await pg.setContent(`<style>*{box-sizing:border-box}body{margin:0;width:1024px;height:500px;background:radial-gradient(900px 500px at 78% 40%,#16305a 0%,#0b1324 62%);font-family:Inter,system-ui,sans-serif;color:#eaf1fb;overflow:hidden;position:relative}
.t{position:absolute;left:64px;top:150px;width:520px}h1{margin:0;font-size:66px;line-height:1.02;font-weight:700;letter-spacing:-1px}h1 b{color:#22d3ee}p{margin:18px 0 0;font-size:25px;line-height:1.35;color:#b9c9de;font-weight:500}
.s{position:absolute;top:-20px;width:230px;height:520px;overflow:hidden;border-radius:26px;border:1px solid rgba(255,255,255,.18);box-shadow:0 18px 50px rgba(0,0,0,.55)}.s img{width:100%;height:100%;object-fit:cover;object-position:50% 52%}</style>
<div class="t"><h1>Anatomy<b>Verse</b> 3D</h1><p>Explore the human body in 3D: bones, muscles, eye, ear and skull.</p></div>
<div class="s" style="left:610px;top:70px;transform:rotate(-4deg)"><img src="${img('shots/2_skull.png')}"></div>
<div class="s" style="left:800px;top:34px;transform:rotate(3deg)"><img src="${img('shots/1_body.png')}"></div>`);
await pg.waitForTimeout(500);await pg.screenshot({path:'feature-graphic.png'});await b.close()})();
