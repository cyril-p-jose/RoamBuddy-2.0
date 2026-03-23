// sw.js — RoamBuddy Service Worker (Offline Support)
const CACHE_NAME = 'roambuddy-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './js/theme.js',
    './js/share.js',
    './js/sos.js',
    './js/pnr.js',
    './js/bookings.js',
    './js/gallery.js',
    './js/devtoolbar.js',
    './data/places.json',
    './data/restaurants.json',
    './data/hotels.json',
    './data/bookings.json',
    './data/pnr.json'
];

// Install: cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: remove old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first strategy for local assets, network-first for images
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // External images: network-first, fallback to cache
    if (url.hostname === 'images.unsplash.com') {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    const cloned = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, cloned));
                    return res;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Local assets: cache-first
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(res => {
                if (res.ok) {
                    const cloned = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, cloned));
                }
                return res;
            });
        }).catch(() => caches.match('./index.html'))
    );
});
