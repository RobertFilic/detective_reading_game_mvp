// Start page: network first, cache fallback. Also caches every game so the
// iPad can open any of them offline after a single online visit.
const CACHE = 'detektiv-start-v3';
const PAGES = ['./', './index.html', './solo/', './solo/index.html', './za-dva/', './za-dva/index.html', './pekarna/', './pekarna/index.html',
  './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];
// The first version cached the solo game here at the root; drop it so offline never shows the old page.
const LEGACY = ['detektiv-v1', 'detektiv-start-v1', 'detektiv-start-v2'];

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
