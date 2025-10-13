// Service Worker for PWA
const CACHE_NAME = 'domain-management-v2';
const urlsToCache = [
  '/zh',
  '/en', 
  '/zh/login',
  '/en/login',
  '/manifest.json',
  '/favicon.ico'
];

// 安装 Service Worker
self.addEventListener('install', function(event) {
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('SW: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', function(event) {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', function(event) {
  const url = event.request.url;
  
  // 跳过 API 请求和 Chrome 扩展请求
  if (url.includes('/api/') || url.includes('chrome-extension://')) {
    return;
  }
  
  // 对于根路径 "/"，重定向到 "/zh"
  if (url.endsWith('/') && !url.includes('/zh') && !url.includes('/en')) {
    event.respondWith(Response.redirect('/zh', 302));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 缓存命中，返回缓存版本
        if (response) {
          console.log('SW: Serving from cache:', event.request.url);
          return response;
        }
        
        // 缓存未命中，从网络获取
        console.log('SW: Fetching from network:', event.request.url);
        return fetch(event.request).then(function(response) {
          // 只缓存成功的响应
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      }
    )
  );
});
