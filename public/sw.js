const CACHE_NAME = 'wisecat-v2';
const urlsToCache = [
    '/',
    '/entry.html',
    '/styles.css',
    '/logo.png',
    '/icon-192.png',
    '/icon-512.png'
];

self.addEventListener('install', (event) => {
    // Force this new SW to become the active one, kicking out the old one
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', (event) => {
    // Claim any clients immediately, so they use the new logic without reload
    event.waitUntil(clients.claim());
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // CRITICAL FIX: Ignore ALL cross-origin requests (Firebase, Google APIs, CDNs)
    // We only want to cache our own assets.
    if (url.origin !== location.origin) {
        return;
    }

    // Bypass for API routes or specific local exclusions if needed
    if (url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/__/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
