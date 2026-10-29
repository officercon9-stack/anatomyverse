#!/usr/bin/env python3
"""Self-hosted fonts, web app manifest, service worker (offline), first-launch disclaimer. ROOT = site root."""
import sys, os, shutil, re
ROOT = sys.argv[1]; FS = 'fontsrc/node_modules/@fontsource'
os.makedirs(ROOT + '/fonts', exist_ok=True)
css = []
def face(fam, w, sub, rng, src):
    fn = os.path.basename(src)
    shutil.copy(src, ROOT + '/fonts/' + fn)
    css.append("@font-face{font-family:'%s';font-style:normal;font-display:swap;font-weight:%d;src:url(./%s) format('woff2');unicode-range:%s}" % (fam, w, fn, rng))
LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
for w in (400, 500, 600, 700):
    face('Inter', w, 'latin', LAT, "%s/inter/files/inter-latin-%d-normal.woff2" % (FS, w))
    face('Inter', w, 'latin-ext', EXT, "%s/inter/files/inter-latin-ext-%d-normal.woff2" % (FS, w))
for w in (400, 500):
    face('JetBrains Mono', w, 'latin', LAT, "%s/jetbrains-mono/files/jetbrains-mono-latin-%d-normal.woff2" % (FS, w))
open(ROOT + '/fonts/fonts.css', 'w').write("\n".join(css) + "\n")
shutil.copy(FS + '/inter/LICENSE', ROOT + '/fonts/LICENSE-Inter-OFL.txt')
shutil.copy(FS + '/jetbrains-mono/LICENSE', ROOT + '/fonts/LICENSE-JetBrainsMono-OFL.txt')

open(ROOT + '/manifest.webmanifest', 'w').write("""{
  "name": "AnatomyVerse 3D",
  "short_name": "AnatomyVerse",
  "description": "Interactive 3D human anatomy for medical and health-science students.",
  "start_url": "./#/app/lab",
  "scope": "./",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#0b1324",
  "theme_color": "#0b1324",
  "categories": ["education", "medical"],
  "icons": [
    {"src": "./icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "./icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "./icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
""")

open(ROOT + '/sw.js', 'w').write("""/* AnatomyVerse offline cache. Hashed /assets and /fonts are cache-first; everything else is network-first with a cached fallback. */
const V = 'av-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(V).then(c => c.addAll(['./', './manifest.webmanifest', './fonts/fonts.css']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => {
  const urls = (e.data && e.data.cache) || [];
  e.waitUntil(caches.open(V).then(c => Promise.all(urls.map(u => { try { if (new URL(u).origin !== location.origin) return null; } catch (x) { return null; } return c.match(u).then(m => m || fetch(u).then(r => r.ok && c.put(u, r)).catch(() => {})); }))));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  const p = u.pathname;
  const hashed = /\\/(assets|fonts|icons)\\//.test(p);
  if (hashed) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(ch => ch.put(r, c)); } return res; })));
    return;
  }
  e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(ch => ch.put(r, c)); } return res; })
    .catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('./') : Response.error()))));
});
""")

open(ROOT + '/first-run.js', 'w').write("""(function(){
  try{ if(localStorage.getItem('av.disclaimerSeen')==='1') return; }catch(e){}
  function show(){
    var d=document.createElement('div');
    d.setAttribute('role','dialog');d.setAttribute('aria-label','Educational use notice');
    d.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);width:min(520px,calc(100vw - 24px));z-index:2147483000;box-sizing:border-box;padding:14px 16px;border-radius:14px;background:#101a30;color:#e6edf7;border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 30px rgba(0,0,0,.5);font:13px/1.45 Inter,system-ui,sans-serif';
    d.innerHTML='<div style="font-weight:600;margin-bottom:4px">For education only</div><div style="color:#b9c6da">AnatomyVerse 3D helps you study anatomy. It is not medical advice and does not diagnose or treat anything. Models are simplified for teaching.</div><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px"><a href="#/legal/disclaimer" style="color:#7dd3fc;align-self:center;font-size:12px">Read more</a><button type="button" style="border:0;border-radius:10px;padding:8px 14px;background:#22d3ee;color:#04202a;font:600 13px Inter,system-ui,sans-serif;cursor:pointer">I understand</button></div>';
    d.querySelector('button').addEventListener('click',function(){try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}d.remove()});
    d.querySelector('a').addEventListener('click',function(){try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}d.remove()});
    document.body.appendChild(d);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(show,1200)});else setTimeout(show,1200);
})();
if('serviceWorker' in navigator && !window.Capacitor && (location.protocol==='https:'||location.hostname==='localhost')){
  window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').then(function(){return navigator.serviceWorker.ready}).then(function(reg){setTimeout(function(){var u=performance.getEntriesByType('resource').map(function(e){return e.name});if(reg.active)reg.active.postMessage({cache:u.concat([location.href.split('#')[0]])})},4000)}).catch(function(){})});
}
""")

h = open(ROOT + '/index.html').read()
h = re.sub(r'\s*<link rel="preconnect"[^>]*>', '', h)
h = re.sub(r'\s*<link href="https://fonts.googleapis.com[^>]*>', '\n    <link rel="stylesheet" href="./fonts/fonts.css" />', h)
if 'manifest.webmanifest' not in h:
    h = h.replace('<title>', '<meta name="theme-color" content="#0b1324" />\n    <link rel="manifest" href="./manifest.webmanifest" />\n    <link rel="apple-touch-icon" href="./icons/icon-192.png" />\n    <title>')
    h = h.replace('</body>', '    <script src="./first-run.js"></script>\n  </body>')
open(ROOT + '/index.html', 'w').write(h)
print('pwa patched')
