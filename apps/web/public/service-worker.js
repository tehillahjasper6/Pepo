/**
 * Pepo Service Worker
 * Handles offline caching, background sync, and push notifications
 */

const CACHE_VERSION = 'pepo-v1';
const DYNAMIC_CACHE = 'pepo-dynamic-v1';
const API_CACHE = 'pepo-api-v1';

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/offline.html',
  '/offline-error.html',
  // Add core assets
];

// API routes that support offline
const OFFLINE_SAFE_APIS = [
  '/api/giveaways',
  '/api/users/profile',
  '/api/trust-score',
  '/api/environmental-impact',
  '/api/community/circles',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      console.log('Service Worker installed');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_VERSION &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions and external requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if offline
          return caches.match(request).then((cached) => {
            if (cached) {
              // Mark response as from cache
              const response = cached.clone();
              response.headers.append('X-From-Cache', 'true');
              return response;
            }
            // Return offline page for safe APIs
            if (OFFLINE_SAFE_APIS.some(api => url.pathname.startsWith(api))) {
              return new Response(
                JSON.stringify({
                  offline: true,
                  message: 'You are offline. Showing cached data.',
                  data: null,
                }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            }
            // Return offline error
            return caches.match('/offline-error.html');
          });
        })
    );
  }

  // Static assets - Cache first, fallback to network
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i)
  ) {
    return event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Stale-while-revalidate: return cached but update in background
          fetch(request).then((response) => {
            if (response.status === 200) {
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, response);
              });
            }
          }).catch(() => {
            // Silent fail - we already have cached version
          });
          return cached;
        }
        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => caches.match('/offline.html'));
      })
    );
  }

  // HTML pages - Network first, fallback to cache
  if (
    request.destination === '' ||
    request.destination === 'document' ||
    url.pathname.endsWith('.html')
  ) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/offline.html');
          });
        })
    );
  }

  // Default strategy - Network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'sync-giveaways') {
    event.waitUntil(syncGiveaways());
  } else if (event.tag === 'sync-feedback') {
    event.waitUntil(syncFeedback());
  }
});

async function syncGiveaways() {
  try {
    const db = await openIndexedDB();
    const pendingGiveaways = await getFromIndexedDB(db, 'pending-giveaways');
    
    for (const giveaway of pendingGiveaways) {
      const response = await fetch('/api/giveaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giveaway),
      });

      if (response.ok) {
        await removeFromIndexedDB(db, 'pending-giveaways', giveaway.id);
        notifyClients('giveaway-synced', giveaway);
      }
    }
  } catch (error) {
    console.error('Giveaway sync failed:', error);
    throw error; // Retry later
  }
}

async function syncFeedback() {
  try {
    const db = await openIndexedDB();
    const pendingFeedback = await getFromIndexedDB(db, 'pending-feedback');
    
    for (const feedback of pendingFeedback) {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      if (response.ok) {
        await removeFromIndexedDB(db, 'pending-feedback', feedback.id);
        notifyClients('feedback-synced', feedback);
      }
    }
  } catch (error) {
    console.error('Feedback sync failed:', error);
    throw error; // Retry later
  }
}

// Notify all clients about sync results
function notifyClients(type, data) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type, data });
    });
  });
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PepoOfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-giveaways')) {
        db.createObjectStore('pending-giveaways', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-feedback')) {
        db.createObjectStore('pending-feedback', { keyPath: 'id' });
      }
    };
  });
}

function getFromIndexedDB(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

function removeFromIndexedDB(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push notification received with no data');
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'pepo-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data.url || '/', self.location.origin);

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if app is already open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen.href && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen.href);
      }
    })
  );
});
