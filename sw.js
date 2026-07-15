const CACHE_NAME = 'bachata-pwa-active';
const CACHE_PREFIX = 'bachata-pwa-';

const ASSETS = [
  './index.html',
  './elementy.html',
  './css/base.css',
  './css/app.css',
  './css/elementy.css',
  './js/program-data.js',
  './js/dom.js',
  './js/errors.js',
  './js/storage.js',
  './js/sections.js',
  './js/render.js',
  './js/overlays.js',
  './js/app.js',
  './js/elementy.js',
  './js/sw-update.js',
  './manifest.webmanifest',
  './icons/icon.svg',
];

function isStaticAsset(url) {
  const { pathname } = url;
  return pathname.endsWith('.html')
    || pathname.endsWith('.css')
    || pathname.endsWith('.js')
    || pathname.endsWith('.webmanifest')
    || pathname.includes('/icons/');
}

function clearOldCaches() {
  return caches.keys().then((keys) =>
    Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .map((key) => caches.delete(key)),
    ),
  );
}

function cacheResponse(request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return;

  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => {
    cache.put(request, copy);
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    clearOldCaches().then(() =>
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key.startsWith(CACHE_PREFIX))
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!isStaticAsset(url) && event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        cacheResponse(event.request, response);
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        }),
      ),
  );
});
