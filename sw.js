const CACHE_NAME = 'brandon-linktree-v1';
const urlsToCache = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './js/data.js',
    './manifest.json',
    './icon.jpeg'
];

const ICON_CACHE_NAME = 'brandon-linktree-icons-v1';

self.addEventListener('install', event => {
    console.log('Service Worker: Install');

    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME)
                .then(cache => {
                    console.log('Service Worker: Caching app shell');
                    return cache.addAll(urlsToCache);
                }),
            caches.open(ICON_CACHE_NAME)
                .then(cache => {
                    console.log('Service Worker: Icons cache ready');
                    return cache;
                })
        ])
    );

    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activate');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== ICON_CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') {
        return;
    }

    if (url.origin !== location.origin) {
        return;
    }

    if (request.url.includes('/icons/')) {
        event.respondWith(handleIconRequest(request));
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    console.log('Service Worker: Serving from cache', request.url);
                    return response;
                }

                console.log('Service Worker: Fetching from network', request.url);
                return fetch(request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Service Worker: Fetch failed', error);

                        if (request.destination === 'document') {
                            return caches.match('./index.html');
                        }

                        throw error;
                    });
            })
    );
});

async function handleIconRequest(request) {
    try {
        const cachedResponse = await caches.match(request, { cacheName: ICON_CACHE_NAME });

        if (cachedResponse) {
            console.log('Service Worker: Serving icon from cache', request.url);
            return cachedResponse;
        }

        console.log('Service Worker: Fetching icon from network', request.url);
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(ICON_CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }

        throw new Error('Network response was not ok');

    } catch (error) {
        console.error('Service Worker: Icon fetch failed', error);

        return new Response(generateFallbackIcon(), {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=86400'
            }
        });
    }
}

function generateFallbackIcon() {
    return `
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#F2F2F7"/>
            <path d="M32 20C25.925 20 21 24.925 21 31C21 37.075 25.925 42 32 42C38.075 42 43 37.075 43 31C43 24.925 38.075 20 32 20ZM32 38C28.1 38 25 34.9 25 31C25 27.1 28.1 24 32 24C35.9 24 39 27.1 39 31C39 34.9 35.9 38 32 38Z" fill="#8E8E93"/>
            <path d="M32 26.5C33.933 26.5 35.5 28.067 35.5 30C35.5 31.933 33.933 33.5 32 33.5C30.067 33.5 28.5 31.933 28.5 30C28.5 28.067 30.067 26.5 32 26.5Z" fill="#8E8E93"/>
        </svg>
    `;
}

self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('Service Worker: Performing background sync');
}

self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification click received');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('./')
    );
});

self.addEventListener('push', event => {
    console.log('Service Worker: Push received');

    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: './icon.jpeg',
        badge: './icon.jpeg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Open App',
                icon: './icon.jpeg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: './icon.jpeg'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Brandon\'s LinkTree', options)
    );
});