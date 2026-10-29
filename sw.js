/* 3D Anatomy offline cache. Hashed /assets and /fonts are cache-first; everything else is network-first with a cached fallback. */
const V = 'av-v2';
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
  const hashed = /\/(assets|fonts|icons)\//.test(p);
  if (hashed) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(ch => ch.put(r, c)); } return res; })));
    return;
  }
  e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(ch => ch.put(r, c)); } return res; })
    .catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('./') : Response.error()))));
});
