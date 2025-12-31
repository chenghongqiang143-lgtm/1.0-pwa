
import { precacheAndRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-precaching.mjs';
import { registerRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-routing.mjs';
import { StaleWhileRevalidate, CacheFirst } from 'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-strategies.mjs';
import { CacheableResponsePlugin } from 'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-cacheable-response.mjs';
import { ExpirationPlugin } from 'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-expiration.mjs';

// 1. 预缓存基础资源（手动列表）
const precacheList = [
  { url: './index.html', revision: '1' },
  { url: './manifest.json', revision: '1' }
];
precacheAndRoute(precacheList);

// 2. 缓存 esm.sh 上的第三方库（Cache First 策略）
registerRoute(
  ({ url }) => url.origin === 'https://esm.sh',
  new CacheFirst({
    cacheName: 'external-libraries',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }) // 缓存30天
    ]
  })
);

// 3. 缓存字体和图标（Cache First 策略）
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com' || url.hostname.includes('flaticon.com'),
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 })
    ]
  })
);

// 4. 其他本地资源（Stale While Revalidate 策略）
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'app-resources'
  })
);

// 5. 监听强制更新消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
