// BULLDOG COMPETE V3 — Service Worker
// NETWORK-FIRST: always try the live site, fall back to cache only offline.
// This kills the Android stale-cache problem.
const CACHE = 'bulldog-compete-v3';

self.addEventListener('install', e => {
  self.skipWaiting(); // activate new SW immediately
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/'])));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Never intercept Apps Script calls — always live
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (e.request.method === 'GET' && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
