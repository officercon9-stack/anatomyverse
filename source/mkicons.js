const {chromium}=require('playwright');const fs=require('fs');
const art=(inset)=>`<g transform="translate(${inset} ${inset}) scale(${(64-2*inset)/64})"><circle cx="32" cy="32" r="20" fill="none" stroke="#22d3ee" stroke-width="3"/><ellipse cx="32" cy="32" rx="8" ry="20" fill="none" stroke="#2dd4bf" stroke-width="2.5"/><ellipse cx="32" cy="32" rx="20" ry="8" fill="none" stroke="#2dd4bf" stroke-width="1.6" opacity=".55"/><circle cx="32" cy="32" r="4" fill="#f59e0b"/></g>`;
const svg=(rx,inset)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="#0b1324"/>${art(inset)}</svg>`;
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
async function out(file,size,s){await pg.setViewportSize({width:size,height:size});await pg.setContent(`<body style="margin:0;background:transparent">${s.replace('<svg ','<svg width="'+size+'" height="'+size+'" ')}</body>`);await pg.screenshot({path:file,omitBackground:true})}
await out('live29/icons/icon-192.png',192,svg(14,0));
await out('live29/icons/icon-512.png',512,svg(14,0));
await out('live29/icons/icon-maskable-512.png',512,svg(0,9));
await out('playstore-icon-512.png',512,svg(0,0));
await b.close()})();
