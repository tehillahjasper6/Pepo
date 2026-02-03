/**
 * Service Worker for Push Notifications
 */

const CACHE_NAME = 'pepo-v1';
const urlsToCache = [
  '/',
  '/browse',
  '/create',
  '/profile',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Push event
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'PEPO', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/brand-assets/logos/pepo-bee-mascot.svg',
    badge: data.badge || '/brand-assets/logos/pepo-hive-icon.svg',
    vibrate: [200, 100, 200],
    data: data.data || {},
    tag: data.tag || 'pepo-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'PEPO', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  if (data.giveawayId) {
    url = `/giveaway/${data.giveawayId}`;
  } else if (data.type === 'NEW_MESSAGE') {
    url = `/messages/${data.giveawayId}`;
  }

  event.waitUntil(
    clients.openWindow(url)
  );
});




