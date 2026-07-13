const CACHE_NAME = 'lughaty-v5';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa_icon.svg',
  '/pwa_icon.png'
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
  
  const url = new URL(event.request.url);
  const isStaticAsset = 
    url.pathname.includes('/assets/') || 
    /\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?|mp3|wav)$/i.test(url.pathname);

  if (isStaticAsset) {
    // Cache-First strategy for static assets (Images, Audios, Fonts)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return instantly from cache for a seamless offline experience
          return cachedResponse;
        }
        
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fail gracefully if completely offline and not in cache
        });
      })
    );
  } else {
    // Network-First with Cache Fallback for other resources (HTML, JS, configurations)
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed (offline) -> fallback to cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
        })
    );
  }
});
