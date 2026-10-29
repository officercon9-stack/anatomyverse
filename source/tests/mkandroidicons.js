const {chromium}=require('playwright');const fs=require('fs');
const R='capapp/android/app/src/main/res/';
const art=`<circle cx="32" cy="32" r="20" fill="none" stroke="#22d3ee" stroke-width="3"/><ellipse cx="32" cy="32" rx="8" ry="20" fill="none" stroke="#2dd4bf" stroke-width="2.5"/><ellipse cx="32" cy="32" rx="20" ry="8" fill="none" stroke="#2dd4bf" stroke-width="1.6" opacity=".55"/><circle cx="32" cy="32" r="4" fill="#f59e0b"/>`;
const fg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g transform="translate(12.8 12.8) scale(.6)">${art}</g></svg>`;
const legacy=(r)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${r}" fill="#0b1324"/><g transform="translate(6.4 6.4) scale(.8)">${art}</g></svg>`;
const splash=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g transform="translate(0 0)">${art}</g></svg>`;
const D={mdpi:[48,108],hdpi:[72,162],xhdpi:[96,216],xxhdpi:[144,324],xxxhdpi:[192,432]};
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
async function out(file,size,s){await pg.setViewportSize({width:size,height:size});await pg.setContent(`<body style="margin:0;background:transparent">${s.replace('<svg ','<svg width="'+size+'" height="'+size+'" ')}</body>`);await pg.screenshot({path:file,omitBackground:true})}
for(const [d,[l,f]] of Object.entries(D)){const m=R+'mipmap-'+d+'/';await out(m+'ic_launcher.png',l,legacy(10));await out(m+'ic_launcher_round.png',l,legacy(32));await out(m+'ic_launcher_foreground.png',f,fg)}
await out(R+'drawable/splash_logo.png',432,splash);
await b.close()})();
