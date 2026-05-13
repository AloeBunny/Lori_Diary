// 小蘿日誌 — 通知推播模組 (Task 7-2)
// Notification API 權限請求 + 定時通知
// iOS 16.4+ PWA 已支援 Notification API

import { getSetting, setSetting } from '../db.js';

// ===== 設定 key =====
const SETTING_NOTIFY_ENABLED = 'notify_enabled';

// ===== 排程 timer 追蹤（避免重複排程） =====
const _scheduledTimers = new Map();

/**
 * 檢查瀏覽器是否支援 Notification API
 * @returns {boolean}
 */
export function isNotificationSupported() {
  return 'Notification' in self;
}

/**
 * 取得目前通知權限狀態
 * @returns {'granted'|'denied'|'default'|'unsupported'}
 */
export function getPermissionStatus() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * 請求通知權限
 * 若使用者同意，同時將 settings store 中的開關設為 true
 * @returns {Promise<'granted'|'denied'|'default'|'unsupported'>}
 */
export async function requestPermission() {
  if (!isNotificationSupported()) {
    console.warn('[notification] 此瀏覽器不支援 Notification API');
    return 'unsupported';
  }

  // 已授權就直接回傳
  if (Notification.permission === 'granted') {
    await setSetting(SETTING_NOTIFY_ENABLED, true);
    return 'granted';
  }

  // 已被拒絕就無法再次請求
  if (Notification.permission === 'denied') {
    return 'denied';
  }

  // 請求權限
  const result = await Notification.requestPermission();
  if (result === 'granted') {
    await setSetting(SETTING_NOTIFY_ENABLED, true);
  }
  return result;
}

/**
 * 確認通知功能是否啟用（權限 + 使用者設定都必須為 true）
 * @returns {Promise<boolean>}
 */
export async function isNotificationEnabled() {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  const enabled = await getSetting(SETTING_NOTIFY_ENABLED, false);
  return !!enabled;
}

/**
 * 發送即時通知
 * @param {string} title - 通知標題
 * @param {string} body - 通知內文
 * @param {object} [opts] - 額外選項
 * @returns {Notification|null}
 */
export async function sendNotification(title, body, opts = {}) {
  const enabled = await isNotificationEnabled();
  if (!enabled) return null;

  try {
    const notification = new Notification(title, {
      body,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: opts.tag || 'lori-diary',
      ...opts,
    });
    return notification;
  } catch (e) {
    // iOS PWA 需透過 Service Worker 推播
    console.warn('[notification] new Notification() 失敗，嘗試 SW 推播:', e.message);
    return sendViaSW(title, body, opts);
  }
}

/**
 * 透過 Service Worker 發送通知（iOS 16.4+ PWA 需要此方式）
 * @param {string} title
 * @param {string} body
 * @param {object} opts
 * @returns {Promise<boolean>}
 */
async function sendViaSW(title, body, opts = {}) {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: opts.tag || 'lori-diary',
      ...opts,
    });
    return true;
  } catch (e) {
    console.warn('[notification] SW showNotification 也失敗:', e.message);
    return false;
  }
}

/**
 * 排程延遲通知
 * @param {string} title - 通知標題
 * @param {string} body - 通知內文
 * @param {number} delayMs - 延遲毫秒數
 * @param {string} [tag] - 通知標記（用於取消）
 * @returns {number|null} timer ID，可用於 cancelScheduled()
 */
export function scheduleNotification(title, body, delayMs, tag) {
  if (!isNotificationSupported()) return null;

  const scheduleTag = tag || `schedule-${Date.now()}`;

  // 取消同 tag 的舊排程
  if (_scheduledTimers.has(scheduleTag)) {
    clearTimeout(_scheduledTimers.get(scheduleTag));
  }

  const timerId = setTimeout(async () => {
    _scheduledTimers.delete(scheduleTag);
    await sendNotification(title, body, { tag: scheduleTag });
  }, delayMs);

  _scheduledTimers.set(scheduleTag, timerId);
  return timerId;
}

/**
 * 取消已排程的通知
 * @param {string} tag - 排程標記
 */
export function cancelScheduled(tag) {
  if (_scheduledTimers.has(tag)) {
    clearTimeout(_scheduledTimers.get(tag));
    _scheduledTimers.delete(tag);
  }
}

/**
 * 取消所有排程的通知
 */
export function cancelAllScheduled() {
  for (const [tag, timerId] of _scheduledTimers) {
    clearTimeout(timerId);
  }
  _scheduledTimers.clear();
}

/**
 * 排程 Routine 提醒通知
 * 根據晨間/晚間 Block 的 rise 時間，在每日相應時刻發送提醒
 * @param {'morning'|'evening'} period - 時段
 * @param {string} riseTime - 格式 'HHMM'，如 '0500'
 */
export function scheduleRoutineReminder(period, riseTime) {
  if (!isNotificationSupported()) return;

  const hh = parseInt(riseTime.slice(0, 2), 10);
  const mm = parseInt(riseTime.slice(2, 4), 10);

  const now = new Date();
  const target = new Date();
  target.setHours(hh, mm, 0, 0);

  // 如果目標時間已過，排到明天
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const delayMs = target.getTime() - now.getTime();

  const titles = {
    morning: '早安！小蘿在等你 🐰',
    evening: '晚間 Routine 時間到了 🌙',
  };

  const bodies = {
    morning: '晨間 Routine 要開始囉，起床吧！',
    evening: '準備收工，來跑晚間流程吧！',
  };

  const tag = `routine-${period}`;
  scheduleNotification(
    titles[period] || '小蘿提醒',
    bodies[period] || 'Routine 時間到了！',
    delayMs,
    tag
  );
}

/**
 * 根據使用者設定，設定/取消 Routine 提醒
 * 在 app 啟動時或設定變更時呼叫
 * @param {Array<{b_name: string, b_rise: string}>} blocks - Block 清單
 */
export async function syncRoutineReminders(blocks) {
  const enabled = await isNotificationEnabled();
  if (!enabled) {
    cancelScheduled('routine-morning');
    cancelScheduled('routine-evening');
    return;
  }

  for (const block of blocks) {
    const name = block.b_name.toLowerCase();
    if (name.includes('晨') || name.includes('morning')) {
      scheduleRoutineReminder('morning', block.b_rise);
    } else if (name.includes('晚') || name.includes('evening')) {
      scheduleRoutineReminder('evening', block.b_rise);
    }
  }
}
