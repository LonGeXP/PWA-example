/*
Copyright 2015, 2019 Google Inc. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Версия кеша (увеличивать при обновлении файлов)
const OFFLINE_VERSION = 2;
const CACHE_NAME = 'offline-cache-v' + OFFLINE_VERSION;
const OFFLINE_URL = 'offline.html';

// Файлы, которые кэшируем
const FILES_TO_CACHE = [
  OFFLINE_URL,
  'index.html',
  'style.css',
  'medium.css',
  'large.css',
  'script.js',
  'images/logo.png', // Укажи реальные пути к картинкам
  'images/background.jpg'
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
      // Удаляем старые кеши
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
