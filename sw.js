const OFFLINE_VERSION = 2;
const CACHE_NAME = 'offline-cache-v' + OFFLINE_VERSION;
const OFFLINE_URL = 'offline.html';

const FILES_TO_CACHE = [
  OFFLINE_URL,
  'index.html',
  'style.css',
  'medium.css',
  'large.css',
  'script.js',
  'images/logo.png',
  'images/background.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] Caching offline page and assets');
      await cache.addAll(FILES_TO_CACHE);
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
      self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch (error) {
        console.log('[Service Worker] Fetch failed, returning cached page instead.', error);
        const cache = await caches.open(CACHE_NAME);
        return cache.match(event.request) || cache.match(OFFLINE_URL);
      }
    })()
  );
});
