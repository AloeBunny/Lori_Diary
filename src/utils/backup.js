// 小蘿日誌 — 資料備份（JSON 匯出 + 瀏覽器下載）

import { DB_NAME, getDB } from '../db.js';

/**
 * 產生時間戳字串 YYYYMMDD_HHMMSS
 * @param {Date} [now]
 * @returns {string}
 */
export function _formatTimestamp(now = new Date()) {
  const pad = (n) => n.toString().padStart(2, '0');
  const y = now.getFullYear();
  const mo = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const mi = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  return `${y}${mo}${d}_${h}${mi}${s}`;
}

/**
 * 讀取 IndexedDB 所有 store 的資料
 * @returns {Promise<object>} { storeName: [...records], ... }
 */
async function _readAllStores() {
  const db = await getDB();
  const storeNames = Array.from(db.objectStoreNames);
  const result = {};

  for (const storeName of storeNames) {
    result[storeName] = await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  return result;
}

/**
 * 觸發瀏覽器下載
 * @param {string} filename
 * @param {string} content
 */
function _triggerDownload(filename, content) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  // 延遲清理
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

/**
 * 一鍵匯出所有 IndexedDB 資料為 JSON，觸發瀏覽器下載
 * 檔名格式：lori_diary_backup_YYYYMMDD_HHMMSS.json
 * @returns {Promise<string>} 匯出的檔名
 */
export async function exportBackup() {
  const data = await _readAllStores();

  const timestamp = _formatTimestamp();
  const filename = `lori_diary_backup_${timestamp}.json`;

  const exportObj = {
    _meta: {
      app: '小蘿日誌',
      db: DB_NAME,
      exportedAt: new Date().toISOString(),
      storeCount: Object.keys(data).length,
      recordCounts: {},
    },
    data,
  };

  // 記錄每個 store 的筆數
  for (const [name, records] of Object.entries(data)) {
    exportObj._meta.recordCounts[name] = records.length;
  }

  const json = JSON.stringify(exportObj, null, 2);
  _triggerDownload(filename, json);

  return filename;
}
