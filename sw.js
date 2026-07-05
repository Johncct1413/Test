// ⚠️ BUMP THIS NUMBER EVERY TIME YOU UPLOAD TO GITHUB 
// (e.g., v3, v3.1, v4) to trigger the update process.
const CACHE_NAME = 'tern-survey-v1.3.2'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Step 1: Install and Cache
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the new service worker to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Save all essential files for offline use
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.log('Skipped missing file for offline cache:', url));
        })
      );
    })
  );
});

// Step 2: Clear old caches so you aren't wasting storage
self.addEventListener('activate', (event) => {
  // Claim all clients immediately so the update applies without a hard reload
  event.waitUntil(clients.claim()); 
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Step 3: NETWORK-FIRST Fetch Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // 1. Try fetching from the internet first (gets the newest GitHub updates)
    fetch(event.request)
      .then((networkResponse) => {
        // If successful, silently update the cache with this fresh file
        // so the offline version stays perfectly up-to-date
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return networkResponse;
      })
      .catch(() => {
        // 2. We are OFFLINE. Fall back to the saved cache!
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          

          // 3. If offline and navigating to a weird URL, FORCE it to load index.html
          if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});