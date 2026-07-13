const CACHE_NAME = 'lughaty-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa_icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listener for custom pre-caching from the main application
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'PRECACHE_RESOURCES') {
    const urlsToCache = event.data.urls || [];
    const taskId = event.data.taskId;
    
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        let completed = 0;
        const total = urlsToCache.length;
        
        // Caching resources sequentially or in batches with progress reports
        for (const url of urlsToCache) {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn(`[SW] Failed to cache resource: ${url}`, err);
          }
          completed++;
          
          // Send progress updates back to all open clients
          const clients = await self.clients.matchAll();
          clients.forEach((client) => {
            client.postMessage({
              action: 'PRECACHE_PROGRESS',
              taskId,
              completed,
              total,
              url
            });
          });
        }
        
        // Final completion message
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            action: 'PRECACHE_COMPLETE',
            taskId,
            success: true
          });
        });
      })
    );
  }
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle external APIs and dev server hot updates natively
  if (
    event.request.url.includes('chrome-extension') || 
    event.request.url.includes('socket.io') || 
    event.request.method !== 'GET'
  ) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }
        // Cache new assets on the fly
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Optional offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
