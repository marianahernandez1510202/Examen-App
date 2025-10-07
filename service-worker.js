const CACHE_NAME = 'tienda-campus-v1';

const APP_SHELL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-128.png',
  '/icon-144.png',
  '/icon-152.png',
  '/icon-192.png',
  '/icon-384.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Almacenando App Shell en caché');
        return cache.addAll(APP_SHELL_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] App Shell almacenado correctamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Error al cachear App Shell:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activado correctamente');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Fetch:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[Service Worker] Sirviendo desde caché:', event.request.url);
          return cachedResponse;
        }
        console.log('[Service Worker] Solicitando desde red:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            if (event.request.method === 'GET') {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                  console.log('[Service Worker] Recurso almacenado en caché:', event.request.url);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('[Service Worker] Error de red:', error);
          });
      })
  );
});