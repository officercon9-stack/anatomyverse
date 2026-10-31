/* 3D Anatomy offline cache.
   - Hashed /assets, /fonts, /icons and versioned /models (?v=...): cache-first (downloaded once, then instant).
   - Unversioned /models and /data files: served from cache at once and refreshed in the background.
   - Pages: always fetched fresh so design updates show; cached copy used offline.
   - Other files (ux.js, theme.css, first-run.js, manifest): revalidated with the server, cached copy used offline. */
const V = 'av-v12';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(V).then(c => c.addAll(['./', './manifest.webmanifest', './fonts/fonts.css']).catch(() => {}))); });
self.addEventListener('activate', e => {
  // keep downloaded models across app updates: copy them from older caches before deleting those caches
  e.waitUntil(caches.keys().then(ks => caches.open(V).then(cur => Promise.all(ks.filter(k => k !== V).map(k => caches.open(k).then(old => old.keys().then(reqs => Promise.all(reqs.filter(q => /\/(models|data)\//.test(new URL(q.url).pathname)).map(q => cur.match(q).then(have => have || old.match(q).then(res => res && cur.put(q, res))))))).then(() => caches.delete(k)))))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => {
  const urls = (e.data && e.data.cache) || [];
  e.waitUntil(caches.open(V).then(c => Promise.all(urls.map(u => { try { if (new URL(u).origin !== location.origin) return null; } catch (x) { return null; } return c.match(u).then(m => m || fetch(u).then(r => r.ok && c.put(u, r)).catch(() => {})); }))));
});
function put(r, res) { if (res && res.ok && res.status === 200) { const c = res.clone(); caches.open(V).then(ch => ch.put(r, c)); } return res; }
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  const p = u.pathname;
  if (/\/(assets|fonts|icons)\//.test(p) || (/\/models\//.test(p) && /[?&]v=/.test(u.search))) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => put(r, res))));
    return;
  }
  if (/\/(models|data)\//.test(p)) { // unversioned data: answer from cache at once, refresh it in the background
    const net = fetch(r, { cache: 'no-cache' }).then(res => put(r, res));
    e.respondWith(caches.match(r).then(m => { if (m) { e.waitUntil(net.catch(() => {})); return m; } return net; }));
    return;
  }
  const nav = r.mode === 'navigate';
  e.respondWith(fetch(r, { cache: nav ? 'no-store' : 'no-cache' }).then(res => put(r, res))
    .catch(() => caches.match(r).then(m => m || (nav ? caches.match('./') : Response.error()))));
});
