// Service Worker for PWA
const CACHE_NAME = 'domain-management-v1';
const urlsToCache = [
  '/',
  '/zh',
  '/en',
  '/zh/login',
  '/en/login'
];

// 安装 Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 缓存命中，返回缓存版本
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
