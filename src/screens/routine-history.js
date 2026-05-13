// 小蘿日誌 — Routine 回顧頁（Screen 1320）
// StatusBar → HeaderBar「Routine 回顧」→ DateStackRow 列表 → TabBar
// 從 records store 讀 routine 類型紀錄

import { createStatusBar } from '../components/status-bar.js';
import { createTabBar } from '../components/tab-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { createDateStackRow } from '../components/date-stack-row.js';
import { navigate } from '../router.js';
import { dbGetAll } from '../db.js';
import { todayStr } from '../utils/helpers.js';

// ===== 日期格式化 =====

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 格式化日期為回顧列表用的 label
 * @param {string} dateStr YYYY-MM-DD
 * @param {boolean} isToday
 * @returns {string}
 */
function formatRoutineLabel(dateStr, isToday) {
  const d = new Date(dateStr + 'T00:00:00');
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEK_DAYS[d.getDay()];
  if (isToday) {
    return `今日 · ${m}月 ${day} (${w})`;
  }
  return `${m}月 ${day} (${w})`;
}

/**
 * 格式化 routine 回顧的 sub 文字
 * @param {object} entry - { blockCount, completedSteps, totalSteps, blockNames }
 * @returns {string}
 */
function formatRoutineSub(entry) {
  const { blockCount, completedSteps, totalSteps, blockNames } = entry;
  if (blockCount === 0) return '無 Routine 紀錄';

  const nameStr = blockNames && blockNames.length > 0
    ? blockNames.join(' + ')
    : `${blockCount} block`;

  if (completedSteps === totalSteps && totalSteps > 0) {
    return `${nameStr} · 全勾`;
  }
  if (completedSteps === 0) {
    return `${nameStr} · 全跳過`;
  }
  return `${nameStr} · ${completedSteps}/${totalSteps} step`;
}

// ===== 資料收集 =====

/**
 * 收集所有有 Routine 紀錄的日期並計算完成度
 * 從 records store 讀取 type = 'routine' 的紀錄
 * @returns {Promise<Array>}
 */
async function collectRoutineDates() {
  const allRecords = await dbGetAll('records');

  // 篩出有 routine 相關資料的日期
  const dateMap = new Map();

  for (const record of allRecords) {
    const date = record.date;
    if (!date) continue;

    // records store 裡有 routineData 欄位的紀錄
    if (record.routineData || record.routine) {
      const data = record.routineData || record.routine || {};
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          blockCount: 0,
          completedSteps: 0,
          totalSteps: 0,
          blockNames: [],
        });
      }
      const entry = dateMap.get(date);

      // 累加 block 紀錄
      if (Array.isArray(data.blocks)) {
        data.blocks.forEach(b => {
          entry.blockCount++;
          if (b.name) entry.blockNames.push(b.name);
          entry.completedSteps += b.completedSteps || 0;
          entry.totalSteps += b.totalSteps || 0;
        });
      } else {
        // 單一 block 紀錄格式
        entry.blockCount++;
        if (data.blockName) entry.blockNames.push(data.blockName);
        entry.completedSteps += data.completedSteps || 0;
        entry.totalSteps += data.totalSteps || 0;
      }
    }
  }

  // 確保今天一定有一筆
  const today = todayStr();
  if (!dateMap.has(today)) {
    dateMap.set(today, {
      blockCount: 0,
      completedSteps: 0,
      totalSteps: 0,
      blockNames: [],
    });
  }

  // 轉為陣列並按日期遞減排列
  const result = [];
  for (const [date, entry] of dateMap.entries()) {
    const percent = entry.totalSteps > 0
      ? entry.completedSteps / entry.totalSteps
      : 0;
    result.push({
      date,
      percent,
      ...entry,
    });
  }

  result.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

  return result;
}

// ===== 渲染 =====

/**
 * 渲染 Routine 回顧頁到容器
 * @param {HTMLElement} root
 * @returns {function} cleanup
 */
export function renderRoutineHistory(root) {
  const today = todayStr();

  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: 'Routine 回顧',
    showBack: true,
    onBack: () => navigate('#/routine'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-routine-history';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '100px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 列表容器
  const listContainer = document.createElement('div');
  listContainer.className = 'lori-routine-history__list';
  body.appendChild(listContainer);

  // TabBar
  const tabBar = createTabBar('rt');
  root.appendChild(tabBar);

  // 載入資料
  _loadHistoryData(today, listContainer);

  // cleanup
  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 載入回顧資料並渲染列表
 */
async function _loadHistoryData(today, listContainer) {
  try {
    const dates = await collectRoutineDates();

    if (dates.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'lori-routine-history__empty';
      emptyMsg.textContent = '還沒有任何 Routine 紀錄';
      listContainer.appendChild(emptyMsg);
      return;
    }

    dates.forEach(entry => {
      const isToday = entry.date === today;
      const row = createDateStackRow({
        date: entry.date,
        label: formatRoutineLabel(entry.date, isToday),
        sub: formatRoutineSub(entry),
        percent: entry.percent,
        isToday,
        onClick: (date) => navigate(`#/routine/${date}`),
      });
      listContainer.appendChild(row);
    });
  } catch (err) {
    console.warn('Routine 回顧資料載入失敗:', err);
    const errorMsg = document.createElement('div');
    errorMsg.className = 'lori-routine-history__empty';
    errorMsg.textContent = '資料載入失敗';
    listContainer.appendChild(errorMsg);
  }
}

// 匯出供測試
export { formatRoutineLabel, formatRoutineSub, collectRoutineDates };
