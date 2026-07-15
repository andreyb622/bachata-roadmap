var CACHE_NAME = 'bachata-pwa-active';
var CACHE_PREFIX = 'bachata-pwa-';
var ASSETS = [
  './index.html',
  './elementy.html',
  './css/base.css',
  './css/app.css',
  './css/elementy.css',
  './js/app.js',
  './js/sections.js',
  './js/sw-update.js',
  './manifest.webmanifest',
  './icons/icon.svg'
];

function isStaticAsset(url) {
  var path = url.pathname;
  return path.endsWith('.html') ||
    path.endsWith('.css') ||
    path.endsWith('.js') ||
    path.endsWith('.webmanifest') ||
    path.indexOf('/icons/') !== -1;
}

function clearOldCaches() {
  return caches.keys().then(function (keys) {
    return Promise.all(
      keys.filter(function (key) { return key.indexOf(CACHE_PREFIX) === 0; })
        .map(function (key) { return caches.delete(key); })
    );
  });
}

function cacheResponse(request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return;
  var copy = response.clone();
  caches.open(CACHE_NAME).then(function (cache) {
    cache.put(request, copy);
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    clearOldCaches().then(function () {
      return caches.open(CACHE_NAME).then(function (cache) {
        return cache.addAll(ASSETS);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME && key.indexOf(CACHE_PREFIX) === 0; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!isStaticAsset(url) && event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request).then(function (response) {
      cacheResponse(event.request, response);
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
