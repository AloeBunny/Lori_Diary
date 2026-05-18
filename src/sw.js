// 小蘿日誌 — Service Worker (Task 7-6 PWA 最佳化)
// cache-first 靜態資源 + network-first API
// 版本升級時自動清除舊 cache

const CACHE_NAME = 'lori-diary-v3';

// 靜態資源清單（cache-first）
// 使用相對路徑，相容 GitHub Pages 子目錄部署
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './db.js',
  './router.js',
  './manifest.json',
  './encouragements.json',
  './adventures.json',
  // components
  './components/status-bar.js',
  './components/tab-bar.js',
  './components/header-bar.js',
  './components/icons.js',
  './components/date-bar.js',
  './components/ring-progress.js',
  './components/pill-bar.js',
  './components/heatmap.js',
  './components/mini-calendar.js',
  './components/check-circle.js',
  './components/todo-row.js',
  './components/add-bar.js',
  './components/date-stack-row.js',
  './components/block-card.js',
  './components/step-row.js',
  './components/form-elements.js',
  './components/quest-preview-card.js',
  './components/quest-pick.js',
  './components/skill-card.js',
  './components/toggle.js',
  './components/setting-elements.js',
  './components/shop-elements.js',
  // screens
  './screens/cover.js',
  './screens/placeholder.js',
  './screens/dashboard.js',
  './screens/progress-detail.js',
  './screens/todo-today.js',
  './screens/todo-history.js',
  './screens/routine-home.js',
  './screens/routine-timer.js',
  './screens/routine-summary.js',
  './screens/block-list.js',
  './screens/block-edit.js',
  './screens/step-list.js',
  './screens/step-edit.js',
  './screens/routine-history.js',
  './screens/learning-home.js',
  './screens/quest-claim.js',
  './screens/skill-list.js',
  './screens/skill-detail.js',
  './screens/quest-edit.js',
  './screens/learning-history.js',
  './screens/lori-customize.js',
  './screens/settings.js',
  './screens/shop.js',
  // utils
  './utils/helpers.js',
  './utils/swipe.js',
  './utils/notification.js',
  './utils/audio.js',
  './utils/backup.js',
  './utils/encouragement.js',
  // icons
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ===== Install：預快取靜態資源 =====
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 逐一加入，個別失敗不影響整體（某些檔案可能尚未部署）
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => {
            console.warn(`[SW] 快取失敗: ${url}`, err.message);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// ===== Activate：清除舊版 cache =====
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log(`[SW] 清除舊 cache: ${k}`);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

// ===== Fetch：分流策略 =====
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 只處理同源請求
  if (url.origin !== location.origin) {
    return;
  }

  // API 請求（network-first）
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(e.request));
    return;
  }

  // 靜態資源（cache-first）
  e.respondWith(cacheFirst(e.request));
});

/**
 * Cache-first 策略：有快取就用，沒有才走網路
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // 成功取得的資源存入 cache
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // 離線且無 cache
    return new Response('離線中，無法載入資源', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

/**
 * Network-first 策略：優先走網路，失敗才用 cache
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    return new Response(JSON.stringify({ error: '離線中' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}

// ===== 通知點擊處理 =====
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // 如果已有視窗，聚焦
      for (const client of clients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // 否則開新視窗
      if (self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })
  );
});
