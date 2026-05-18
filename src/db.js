// 小蘿日誌 — IndexedDB 操作模組
// DB_VERSION 2：新增 blocks, steps, skills, quests, claims, shop_history, settings

const DB_NAME = 'lori_diary_db';
const DB_VERSION = 2;

// ===== 預設 Block + Step 資料 =====
const DEFAULT_BLOCKS = [
  {
    b_index: 1,
    b_name: '晨間 Routine',
    b_rise: '0500',
    b_start: '0530',
    b_set: '0730',
  },
  {
    b_index: 2,
    b_name: '晚間 Routine',
    b_rise: '1800',
    b_start: '1830',
    b_set: '2230',
  },
];

const DEFAULT_STEPS = [
  // 晨間 Routine（b_index = 1）
  { b_index: 1, s_index: 1, s_name: '賴床', s_time: 300, s_prebuffer: 10 },
  { b_index: 1, s_index: 2, s_name: '準備運動（換衣拉筋）', s_time: 300, s_prebuffer: 10 },
  { b_index: 1, s_index: 3, s_name: '運動', s_time: 1800, s_prebuffer: 10 },
  { b_index: 1, s_index: 4, s_name: '備餐（放烤箱/電鍋）', s_time: 600, s_prebuffer: 10 },
  { b_index: 1, s_index: 5, s_name: '刷牙洗臉', s_time: 600, s_prebuffer: 10 },
  { b_index: 1, s_index: 6, s_name: '沖澡', s_time: 600, s_prebuffer: 10 },
  { b_index: 1, s_index: 7, s_name: '吃早餐', s_time: 600, s_prebuffer: 10 },
  { b_index: 1, s_index: 8, s_name: '著裝', s_time: 600, s_prebuffer: 10 },
  { b_index: 1, s_index: 9, s_name: '準備出門', s_time: 600, s_prebuffer: 10 },
  { b_index: 1, s_index: 10, s_name: '緩衝', s_time: 1200, s_prebuffer: 10 },
  // 晚間 Routine（b_index = 2）
  { b_index: 2, s_index: 1, s_name: '做飯', s_time: 1800, s_prebuffer: 10 },
  { b_index: 2, s_index: 2, s_name: '吃飯', s_time: 1200, s_prebuffer: 10 },
  { b_index: 2, s_index: 3, s_name: '自由時間', s_time: 0, s_prebuffer: 10 },
  { b_index: 2, s_index: 4, s_name: '家務', s_time: 1800, s_prebuffer: 10 },
  { b_index: 2, s_index: 5, s_name: '讀書進修', s_time: 2700, s_prebuffer: 10 },
  { b_index: 2, s_index: 6, s_name: '刷牙洗臉 + 洗澡洗頭', s_time: 2100, s_prebuffer: 10 },
  { b_index: 2, s_index: 7, s_name: '就寢準備', s_time: 600, s_prebuffer: 10 },
];

/**
 * 開啟 IndexedDB，支援新舊版本升級
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      const oldVersion = e.oldVersion;

      // v1 原有 store（相容舊資料）
      if (oldVersion < 1) {
        const todosStore = db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
        todosStore.createIndex('type', 'type');
        todosStore.createIndex('date', 'date');
        db.createObjectStore('records', { keyPath: 'date' });
        db.createObjectStore('stats', { keyPath: 'key' });
      }

      // v2 新增 store
      if (oldVersion < 2) {
        // Routine Block
        const blocksStore = db.createObjectStore('blocks', { keyPath: 'b_index' });
        blocksStore.createIndex('b_rise', 'b_rise');

        // Block 內 Step（複合 key 用 [b_index, s_index]）
        const stepsStore = db.createObjectStore('steps', { keyPath: ['b_index', 's_index'] });
        stepsStore.createIndex('b_index', 'b_index');

        // 學習技能
        const skillsStore = db.createObjectStore('skills', { keyPath: 'sk_index', autoIncrement: true });
        skillsStore.createIndex('sk_category', 'sk_category');

        // Quest
        const questsStore = db.createObjectStore('quests', { keyPath: ['sk_index', 'q_index'] });
        questsStore.createIndex('sk_index', 'sk_index');

        // 每日認領
        const claimsStore = db.createObjectStore('claims', { keyPath: 'c_index', autoIncrement: true });
        claimsStore.createIndex('c_date', 'c_date');
        claimsStore.createIndex('sk_index', 'sk_index');

        // 商店歷史
        db.createObjectStore('shop_history', { keyPath: 'id', autoIncrement: true });

        // 設定
        db.createObjectStore('settings', { keyPath: 'key' });

        // 寫入預設 Block 和 Step
        const tx = e.target.transaction;
        const blockStore = tx.objectStore('blocks');
        const stepStore = tx.objectStore('steps');

        DEFAULT_BLOCKS.forEach(b => blockStore.put(b));
        DEFAULT_STEPS.forEach(s => stepStore.put(s));
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ===== 單例 DB 連線 =====
let _db = null;

async function getDB() {
  if (!_db) _db = await openDB();
  return _db;
}

// ===== 通用 CRUD =====

async function dbAdd(storeName, item) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).add(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(storeName, item) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).put(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(storeName, key) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(storeName, indexName, value) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    let req;
    if (indexName && value !== undefined) {
      req = store.index(indexName).getAll(value);
    } else {
      req = store.getAll();
    }
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(storeName, key) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbCount(storeName) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ===== TODO 排序 =====

/**
 * 取得指定日期 todos 中最大的 sort_order（沒有則回傳 0）
 * @param {string} dateStr YYYY-MM-DD
 * @returns {Promise<number>}
 */
async function getMaxSortOrder(dateStr) {
  const todos = await dbGetAll('todos', 'date', dateStr);
  let max = 0;
  for (const t of todos) {
    if (typeof t.sort_order === 'number' && t.sort_order > max) {
      max = t.sort_order;
    }
  }
  return max;
}

/**
 * 批次更新 sort_order，接收排序後的 ID 陣列
 * @param {number[]} orderedIds - 排序後的 todo id 陣列（index = 新順序）
 * @returns {Promise<void>}
 */
async function reorderTodos(orderedIds) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('todos', 'readwrite');
    const store = tx.objectStore('todos');
    let pending = orderedIds.length;

    if (pending === 0) { resolve(); return; }

    orderedIds.forEach((id, index) => {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const todo = getReq.result;
        if (!todo) { pending--; if (pending === 0) resolve(); return; }
        todo.sort_order = index + 1;
        const putReq = store.put(todo);
        putReq.onsuccess = () => { pending--; if (pending === 0) resolve(); };
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });

    tx.onerror = () => reject(tx.error);
  });
}

// ===== 紅蘿蔔積分 =====

async function getCarrots() {
  const result = await dbGet('stats', 'carrots');
  return result?.value || 0;
}

async function addCarrots(amount) {
  const current = await getCarrots();
  const next = Math.max(0, current + amount);
  await dbPut('stats', { key: 'carrots', value: next });
}

// ===== 設定 =====

async function getSetting(key, defaultValue) {
  const result = await dbGet('settings', key);
  return result?.value ?? defaultValue;
}

async function setSetting(key, value) {
  await dbPut('settings', { key, value });
}

// ===== 微冒險完成 =====

/**
 * 完成微冒險，返還 50% 花費（無條件進位，對使用者有利）
 * @param {number} id - shop_history 的 key（autoIncrement id）
 * @returns {Promise<{record: Object, refund: number}>} 更新後的記錄與返還金額
 */
async function completeAdventure(id) {
  const record = await dbGet('shop_history', id);
  if (!record) throw new Error(`找不到 shop_history id=${id}`);
  if (record.status === 'completed') throw new Error('這筆微冒險已經完成過了');

  const refund = Math.ceil(record.cost * 0.5);

  record.status = 'completed';
  record.completedDate = new Date().toISOString();
  await dbPut('shop_history', record);

  await addCarrots(refund);

  return { record, refund };
}

export {
  DB_NAME,
  DB_VERSION,
  openDB,
  getDB,
  dbAdd,
  dbPut,
  dbGet,
  dbGetAll,
  dbDelete,
  dbCount,
  getCarrots,
  addCarrots,
  completeAdventure,
  getSetting,
  setSetting,
  getMaxSortOrder,
  reorderTodos,
  DEFAULT_BLOCKS,
  DEFAULT_STEPS,
};
