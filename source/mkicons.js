const {chromium}=require('playwright');const fs=require('fs');
const art=(inset)=>`<g transform="translate(${inset} ${inset}) scale(${(64-2*inset)/64})"><path d="M32 55C18 45 11 35 13 25C15 16 24 13 29 19C31 21 32 23 32 23C32 23 34 20 38 18C44 15 52 19 52 28C52 39 45 48 32 55Z" fill="#c9372b"/><path d="M32 23C32 33 30 44 32 55" stroke="#8f2219" stroke-width="1.6" fill="none"/><path d="M34 21C34 11 42 8 48 11" stroke="#ec6a55" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M29 20C27 12 21 10 16 13" stroke="#7fb0e0" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M38 22L38 10" stroke="#7fb0e0" stroke-width="2.6" stroke-linecap="round" fill="none"/></g>`;
const svg=(rx,inset)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="#140e0d"/>${art(inset)}</svg>`;
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
async function out(file,size,s){await pg.setViewportSize({width:size,height:size});await pg.setContent(`<body style="margin:0;background:transparent">${s.replace('<svg ','<svg width="'+size+'" height="'+size+'" ')}</body>`);await pg.screenshot({path:file,omitBackground:true})}
await out('live30/icons/icon-192.png',192,svg(14,0));
await out('live30/icons/icon-512.png',512,svg(14,0));
await out('live30/icons/icon-maskable-512.png',512,svg(0,9));
await out('playstore-icon-512.png',512,svg(0,0));
await b.close()})();
