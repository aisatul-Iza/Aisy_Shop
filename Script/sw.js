import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// 1. Precache semua aset hasil build
precacheAndRoute(self.__WB_MANIFEST);

// 2. Caching untuk peta dari OpenStreetMap
registerRoute(
  ({ url }) => url.origin.includes('tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'osm-tiles',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
      }),
    ],
  })
);

// 3. Caching API Story Dicoding (GET Stories)
registerRoute(
  ({ url, request }) =>
    url.origin === 'https://story-api.dicoding.dev' &&
    url.pathname.startsWith('/v1/stories') &&
    request.method === 'GET',
  new StaleWhileRevalidate({
    cacheName: 'dicoding-stories-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 hari
      }),
    ],
  })
);

// 4. Caching gambar dari API Story Dicoding (images)
registerRoute(
  ({ url }) =>
    url.origin === 'https://story-api.dicoding.dev' &&
    url.pathname.startsWith('/images/stories'),
  new CacheFirst({
    cacheName: 'dicoding-stories-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// 5. Caching Google Fonts (opsional)
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 tahun
      }),
    ],
  })
);

// 6. Caching UI Avatars (jika digunakan)
registerRoute(
  ({ url }) => url.origin === 'https://ui-avatars.com',
  new CacheFirst({
    cacheName: 'ui-avatars',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// 7. Push Notification listener (jika pakai notifikasi push)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  const title = data.title || 'Notifikasi Baru';
  const options = {
    body: data.body || 'Ada pesan baru untukmu!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
