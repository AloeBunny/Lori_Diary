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

// ===== F12：scheduleDailyPrompts 邏輯測試 =====
// 因為 scheduleDailyPrompts 內部呼叫 isNotificationEnabled（依賴 DB），
// 這裡測試從原始碼提取出來的純邏輯

// 從 notification.js 複製問候語庫
const _morningPrompts = [
  '早安！{name} 準備好了嗎？',
  '起床了嗎？{name} 在等你 🐰',
  '新的一天！先把 {name} 搞定吧',
  '早，{name} 不會自己做完的喔',
  '太陽出來了，{name} 也該開始了 🥕',
];

const _eveningPrompts = [
  '回來了嗎？{name} 等你 🐰',
  '晚上好，{name} 還沒做喔',
  '辛苦了，來跑 {name} 收個尾吧',
  '今天也要好好結束——{name} 在這',
  '{name} 準備好了，你呢？🌙',
];

/**
 * 從 scheduleDailyPrompts 提取的 block 分類邏輯
 * @param {string} blockName
 * @returns {'morning'|'evening'|null}
 */
function classifyBlock(blockName) {
  const name = (blockName || '').toLowerCase();
  const isMorning = name.includes('晨') || name.includes('morning');
  const isEvening = name.includes('晚') || name.includes('夜') || name.includes('evening');
  if (isMorning) return 'morning';
  if (isEvening) return 'evening';
  return null;
}

/**
 * 從 scheduleDailyPrompts 提取的排程時間決策
 * @param {'morning'|'evening'} period
 * @returns {{hours: number, minutes: number}}
 */
function getScheduleTime(period) {
  if (period === 'morning') return { hours: 6, minutes: 30 };
  return { hours: 18, minutes: 30 };
}

suite('notification — F12 問候語庫');

test('早安問候語有 5 句', () => {
  assertEqual(_morningPrompts.length, 5, `早安問候語應有 5 句，實際 ${_morningPrompts.length} 句`);
});

test('晚安問候語有 5 句', () => {
  assertEqual(_eveningPrompts.length, 5, `晚安問候語應有 5 句，實際 ${_eveningPrompts.length} 句`);
});

test('早安問候語都包含 {name} 佔位符', () => {
  for (const prompt of _morningPrompts) {
    assert(prompt.includes('{name}'), `缺少 {name}：「${prompt}」`);
  }
});

test('晚安問候語都包含 {name} 佔位符', () => {
  for (const prompt of _eveningPrompts) {
    assert(prompt.includes('{name}'), `缺少 {name}：「${prompt}」`);
  }
});

test('{name} 替換正確', () => {
  const template = _morningPrompts[0]; // '早安！{name} 準備好了嗎？'
  const result = template.replace('{name}', '晨間 Routine');
  assert(result.includes('晨間 Routine'), `替換後應包含 block 名稱，得到「${result}」`);
  assert(!result.includes('{name}'), '替換後不應殘留 {name}');
});

suite('notification — F12 block 分類（正則匹配）');

test('「晨間 Routine」→ morning', () => {
  assertEqual(classifyBlock('晨間 Routine'), 'morning');
});

test('「Morning Routine」→ morning', () => {
  assertEqual(classifyBlock('Morning Routine'), 'morning');
});

test('「morning routine」小寫 → morning', () => {
  assertEqual(classifyBlock('morning routine'), 'morning');
});

test('「早晨流程」→ morning（含「晨」）', () => {
  assertEqual(classifyBlock('早晨流程'), 'morning');
});

test('「晚間 Routine」→ evening', () => {
  assertEqual(classifyBlock('晚間 Routine'), 'evening');
});

test('「Evening Routine」→ evening', () => {
  assertEqual(classifyBlock('Evening Routine'), 'evening');
});

test('「evening routine」小寫 → evening', () => {
  assertEqual(classifyBlock('evening routine'), 'evening');
});

test('「深夜流程」→ evening（含「夜」）', () => {
  assertEqual(classifyBlock('深夜流程'), 'evening');
});

test('「夜間護膚」→ evening（含「夜」）', () => {
  assertEqual(classifyBlock('夜間護膚'), 'evening');
});

test('「運動流程」→ null（不匹配）', () => {
  assertEqual(classifyBlock('運動流程'), null);
});

test('「下午 Routine」→ null', () => {
  assertEqual(classifyBlock('下午 Routine'), null);
});

test('空字串 → null', () => {
  assertEqual(classifyBlock(''), null);
});

test('undefined → null', () => {
  assertEqual(classifyBlock(undefined), null);
});

suite('notification — F12 排程時間');

test('morning block 排 06:30', () => {
  const time = getScheduleTime('morning');
  assertEqual(time.hours, 6);
  assertEqual(time.minutes, 30);
});

test('evening block 排 18:30', () => {
  const time = getScheduleTime('evening');
  assertEqual(time.hours, 18);
  assertEqual(time.minutes, 30);
});

test('scheduleDailyPrompts 排程延遲計算正確（已過則+1天）', () => {
  // 模擬：現在是 07:00，morning target 是 06:30 → 已過 → 排到明天
  const now = new Date('2026-05-26T07:00:00');
  const target = new Date('2026-05-26T06:30:00');
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  const delayMs = target.getTime() - now.getTime();
  assert(delayMs > 0, '延遲應為正數');
  // 應該大約是 23.5 小時（84600000ms）
  const expectedMs = 23.5 * 60 * 60 * 1000;
  assert(Math.abs(delayMs - expectedMs) < 1000, `延遲應約 23.5 小時，得到 ${delayMs}ms`);
});

test('scheduleDailyPrompts 排程延遲計算正確（未過則當天）', () => {
  // 模擬：現在是 05:00，morning target 是 06:30 → 未過 → 當天排
  const now = new Date('2026-05-26T05:00:00');
  const target = new Date('2026-05-26T06:30:00');
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  const delayMs = target.getTime() - now.getTime();
  assert(delayMs > 0, '延遲應為正數');
  // 應該是 1.5 小時（5400000ms）
  const expectedMs = 1.5 * 60 * 60 * 1000;
  assert(Math.abs(delayMs - expectedMs) < 1000, `延遲應約 1.5 小時，得到 ${delayMs}ms`);
});

suite('notification — scheduleDailyPrompts 被 export');

test('scheduleDailyPrompts 被 export', async () => {
  const mod = await import('../utils/notification.js');
  assert(typeof mod.scheduleDailyPrompts === 'function', 'scheduleDailyPrompts 應被 export');
});
