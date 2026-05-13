// 小蘿日誌 — PWA 最佳化測試
// 驗證 manifest.json、sw.js、index.html 的 PWA 設定

import { suite, test, assert, assertEqual } from './test-runner.js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, '..');

suite('PWA — manifest.json');

const manifest = JSON.parse(readFileSync(resolve(srcDir, 'manifest.json'), 'utf-8'));

test('name 是「小蘿日誌」', () => {
  assert(manifest.name.includes('小蘿日誌'), `name 應含小蘿日誌，得到 ${manifest.name}`);
});

test('short_name 是「小蘿日誌」', () => {
  assertEqual(manifest.short_name, '小蘿日誌');
});

test('display 為 standalone', () => {
  assertEqual(manifest.display, 'standalone');
});

test('theme_color 為 #A8D8BE', () => {
  assertEqual(manifest.theme_color, '#A8D8BE');
});

test('background_color 為 #FAF8F3', () => {
  assertEqual(manifest.background_color, '#FAF8F3');
});

test('icons 包含 192 和 512', () => {
  const sizes = manifest.icons.map(i => i.sizes);
  assert(sizes.includes('192x192'), '應有 192x192 icon');
  assert(sizes.includes('512x512'), '應有 512x512 icon');
});

test('icons 包含 maskable purpose', () => {
  const maskable = manifest.icons.filter(i => i.purpose === 'maskable');
  assert(maskable.length >= 1, '至少一個 icon 有 maskable purpose');
});

test('start_url 為 /', () => {
  assertEqual(manifest.start_url, '/');
});

suite('PWA — index.html meta tags');

const indexHtml = readFileSync(resolve(srcDir, 'index.html'), 'utf-8');

test('有 apple-mobile-web-app-capable', () => {
  assert(indexHtml.includes('apple-mobile-web-app-capable'), '應有 apple-mobile-web-app-capable');
});

test('有 apple-mobile-web-app-status-bar-style', () => {
  assert(indexHtml.includes('apple-mobile-web-app-status-bar-style'), '應有 status-bar-style');
});

test('有 apple-mobile-web-app-title', () => {
  assert(indexHtml.includes('apple-mobile-web-app-title'), '應有 apple-mobile-web-app-title');
});

test('有 theme-color meta', () => {
  assert(indexHtml.includes('theme-color'), '應有 theme-color meta');
});

test('有 apple-touch-icon', () => {
  assert(indexHtml.includes('apple-touch-icon'), '應有 apple-touch-icon');
});

test('有 apple-touch-startup-image', () => {
  assert(indexHtml.includes('apple-touch-startup-image'), '應有 splash screen 設定');
});

test('有 manifest link', () => {
  assert(indexHtml.includes('rel="manifest"'), '應有 manifest link');
});

test('有 service worker 註冊', () => {
  assert(indexHtml.includes("serviceWorker.register('sw.js')") || indexHtml.includes('serviceWorker.register'), '應有 SW 註冊');
});

suite('PWA — sw.js');

const swJs = readFileSync(resolve(srcDir, 'sw.js'), 'utf-8');

test('cache 名稱已升級', () => {
  assert(swJs.includes('lori-diary-v2'), 'cache 名稱應為 lori-diary-v2');
});

test('包含 cache-first 邏輯', () => {
  assert(swJs.includes('cacheFirst'), '應有 cacheFirst 函式');
});

test('包含 network-first 邏輯', () => {
  assert(swJs.includes('networkFirst'), '應有 networkFirst 函式');
});

test('靜態資源包含 lori-customize.js', () => {
  assert(swJs.includes('lori-customize.js'), '新增的 lori-customize.js 應在快取清單');
});

test('靜態資源包含 notification.js', () => {
  assert(swJs.includes('notification.js'), '新增的 notification.js 應在快取清單');
});

test('有 notificationclick 處理', () => {
  assert(swJs.includes('notificationclick'), '應有通知點擊處理');
});

test('有 skipWaiting', () => {
  assert(swJs.includes('skipWaiting'), '應有 skipWaiting');
});

test('有 clients.claim', () => {
  assert(swJs.includes('clients.claim'), '應有 clients.claim');
});
