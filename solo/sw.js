// Network first, cache fallback: the iPad gets updates when online and still opens offline.
// No index.html in the cache: Cloudflare Pages redirects it to ./, and a redirected response can't open a page offline.
const CACHE = 'detektiv-solo-v3';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './vendor/qrcode.js', './vendor/jsQR.js'])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('detektiv-solo-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;   // the analytics beacon goes straight to the network
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./')))
  );
});
