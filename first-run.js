(function(){
  try{ if(localStorage.getItem('av.disclaimerSeen')==='1') return; }catch(e){}
  function show(){
    var d=document.createElement('div');
    d.setAttribute('role','dialog');d.setAttribute('aria-label','Educational use notice');
    d.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);width:min(520px,calc(100vw - 24px));z-index:2147483000;box-sizing:border-box;padding:14px 16px;border-radius:14px;background:#101a30;color:#e6edf7;border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 30px rgba(0,0,0,.5);font:13px/1.45 Inter,system-ui,sans-serif';
    d.innerHTML='<div style="font-weight:600;margin-bottom:4px">For education only</div><div style="color:#b9c6da">3D Anatomy helps you study anatomy. It is not medical advice and does not diagnose or treat anything. Models are simplified for teaching.</div><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px"><a href="#/legal/disclaimer" style="color:#7dd3fc;align-self:center;font-size:12px">Read more</a><button type="button" style="border:0;border-radius:10px;padding:8px 14px;background:#22d3ee;color:#04202a;font:600 13px Inter,system-ui,sans-serif;cursor:pointer">I understand</button></div>';
    d.querySelector('button').addEventListener('click',function(){try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}d.remove()});
    d.querySelector('a').addEventListener('click',function(){try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}d.remove()});
    document.body.appendChild(d);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(show,1200)});else setTimeout(show,1200);
})();
if('serviceWorker' in navigator && !window.Capacitor && (location.protocol==='https:'||location.hostname==='localhost')){
  window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').then(function(){return navigator.serviceWorker.ready}).then(function(reg){setTimeout(function(){var u=performance.getEntriesByType('resource').map(function(e){return e.name});if(reg.active)reg.active.postMessage({cache:u.concat([location.href.split('#')[0]])})},4000)}).catch(function(){})});
}
