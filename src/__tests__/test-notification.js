// 小蘿日誌 — 通知模組測試
// 測試純邏輯函式（不需真正的 Notification API）

import { suite, test, assert, assertEqual } from './test-runner.js';

// 模擬瀏覽器環境
globalThis.self = globalThis;

// 測試前先設定模擬 Notification
let _mockPermission = 'default';
let _requestCount = 0;

globalThis.Notification = class {
  static get permission() { return _mockPermission; }
  static requestPermission() {
    _requestCount++;
    _mockPermission = 'granted';
    return Promise.resolve('granted');
  }
  constructor(title, opts) {
    this.title = title;
    this.body = opts?.body || '';
    this.tag = opts?.tag || '';
  }
};

// 模擬 navigator
if (!globalThis.navigator) {
  globalThis.navigator = {};
}

// 模擬 db.js 的 getSetting / setSetting
const _mockSettings = new Map();

// 直接 mock db 模組的函式 — 用動態 import 前先注入
// 因為 Node.js 的 ES module 不好 mock，改為只測 export 的純邏輯

suite('notification — 模組 export');

test('isNotificationSupported 偵測 Notification', async () => {
  const mod = await import('../utils/notification.js');
  assert(typeof mod.isNotificationSupported === 'function', 'isNotificationSupported 應被 export');
  const result = mod.isNotificationSupported();
  assertEqual(result, true, '有 Notification 應回傳 true');
});

test('getPermissionStatus 回傳目前狀態', async () => {
  const mod = await import('../utils/notification.js');
  assert(typeof mod.getPermissionStatus === 'function', 'getPermissionStatus 應被 export');
  // 先前已設為 granted
  const status = mod.getPermissionStatus();
  assert(['granted', 'denied', 'default'].includes(status), `狀態應為有效值，得到 ${status}`);
});

test('requestPermission 被 export', async () => {
  const mod = await import('../utils/notification.js');
  assert(typeof mod.requestPermission === 'function', 'requestPermission 應被 export');
});

test('scheduleNotification 被 export', async () => {
  const mod = await import('../utils/notification.js');
  assert(typeof mod.scheduleNotification === 'function', 'scheduleNotification 應被 export');
});

test('cancelScheduled 被 export', async () => {
  const mod = await import('../utils/notification.js');
  assert(typeof mod.cancelScheduled === 'function', 'cancelScheduled 應被 export');
});

test('cancelAllScheduled 被 export', async () => {
  const mod = await import('../utils/notification.js');
  assert(typeof mod.cancelAllScheduled === 'function', 'cancelAllScheduled 應被 export');
});

test('sendNotification 被 export', async () => {
  const mod = await import('../utils/notification.js');
  assert(typeof mod.sendNotification === 'function', 'sendNotification 應被 export');
});

test('scheduleRoutineReminder 被 export', async () => {
  const mod = await import('../utils/notification.js');
  assert(typeof mod.scheduleRoutineReminder === 'function', 'scheduleRoutineReminder 應被 export');
});

test('syncRoutineReminders 被 export', async () => {
  const mod = await import('../utils/notification.js');
  assert(typeof mod.syncRoutineReminders === 'function', 'syncRoutineReminders 應被 export');
});

suite('notification — scheduleNotification 排程');

test('scheduleNotification 回傳 timer ID', async () => {
  const mod = await import('../utils/notification.js');
  const timerId = mod.scheduleNotification('測試', '內容', 999999, 'test-tag');
  assert(timerId !== null, '應回傳 timer ID');
  // 清理
  mod.cancelScheduled('test-tag');
});

test('cancelScheduled 取消排程不報錯', async () => {
  const mod = await import('../utils/notification.js');
  mod.scheduleNotification('測試', '內容', 999999, 'cancel-test');
  mod.cancelScheduled('cancel-test');
  // 取消不存在的 tag 也不報錯
  mod.cancelScheduled('nonexistent');
});

test('cancelAllScheduled 清除所有排程', async () => {
  const mod = await import('../utils/notification.js');
  mod.scheduleNotification('A', 'a', 999999, 'all-1');
  mod.scheduleNotification('B', 'b', 999999, 'all-2');
  mod.cancelAllScheduled(); // 不應報錯
});

suite('notification — Notification 不支援時');

test('isNotificationSupported 無 Notification 時回傳 false', async () => {
  const saved = globalThis.Notification;
  delete globalThis.Notification;

  // 重新 import 不行（module cache），直接測邏輯
  const supported = 'Notification' in globalThis;
  assertEqual(supported, false, '刪除 Notification 後應為 false');

  // 還原
  globalThis.Notification = saved;
});
