// Start page: network first, cache fallback. Also caches both games so the
// iPad can open either one offline after a single online visit.
const CACHE = 'detektiv-start-v1';
const PAGES = ['./', './index.html', './solo/', './solo/index.html', './za-dva/', './za-dva/index.html'];
// The first version cached the solo game here at the root; drop it so offline never shows the old page.
const LEGACY = ['detektiv-v1'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PAGES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => e.waitUntil(
  Promise.all(LEGACY.map(k => caches.delete(k))).then(() => self.clients.claim())
));

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.open(CACHE)
        .then(c => c.match(e.request, { ignoreSearch: true }))
        .then(r => r || caches.match(e.request, { ignoreSearch: true }))
        .then(r => r || caches.match('./index.html')))
  );
});
