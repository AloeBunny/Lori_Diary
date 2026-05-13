// 小蘿日誌 — TODO 歷史頁（Screen 1210）
// StatusBar → HeaderBar「TODO 歷史」→ DateStackRow 列表（遞減排列，首筆今日）→ TabBar

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
 * 格式化日期為歷史列表用的 label
 * @param {string} dateStr YYYY-MM-DD
 * @param {boolean} isToday
 * @returns {string}
 */
function formatHistoryLabel(dateStr, isToday) {
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
 * 格式化完成度為 sub 文字
 * @param {number} done
 * @param {number} total
 * @returns {string}
 */
function formatSub(done, total) {
  if (total === 0) return '無待辦';
  let text = `${done} / ${total} 完成`;
  if (done === total) text += ' · 滿勾';
  else if (done === 0) text += ' · 全跳過';
  return text;
}

// ===== 資料收集 =====

/**
 * 收集所有有 TODO 資料的日期並計算完成度
 * @returns {Promise<Array<{date: string, done: number, total: number, percent: number}>>}
 */
async function collectTodoDates() {
  const allTodos = await dbGetAll('todos');

  // 按日期分組（只取 type = todo 或無 type 的）
  const dateMap = new Map();
  for (const todo of allTodos) {
    if (todo.type && todo.type !== 'todo') continue;
    const date = todo.date;
    if (!date) continue;
    if (!dateMap.has(date)) {
      dateMap.set(date, { total: 0, done: 0 });
    }
    const entry = dateMap.get(date);
    entry.total++;
    if (todo.done) entry.done++;
  }

  // 確保今天一定有一筆
  const today = todayStr();
  if (!dateMap.has(today)) {
    dateMap.set(today, { total: 0, done: 0 });
  }

  // 轉為陣列並按日期遞減排列
  const result = [];
  for (const [date, counts] of dateMap.entries()) {
    const percent = counts.total > 0 ? counts.done / counts.total : 0;
    result.push({
      date,
      done: counts.done,
      total: counts.total,
      percent,
    });
  }

  // 遞減排列（最新在最上面）
  result.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

  return result;
}

// ===== 渲染 =====

/**
 * 渲染 TODO 歷史頁到容器
 * @param {HTMLElement} root
 * @returns {function} cleanup
 */
export function renderTodoHistory(root) {
  const today = todayStr();

  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: 'TODO 歷史',
    showBack: true,
    onBack: () => navigate('#/todo'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-todo-history';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '100px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 列表容器
  const listContainer = document.createElement('div');
  listContainer.className = 'lori-todo-history__list';
  body.appendChild(listContainer);

  // TabBar
  const tabBar = createTabBar('todo');
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
 * 載入歷史資料並渲染列表
 */
async function _loadHistoryData(today, listContainer) {
  try {
    const dates = await collectTodoDates();

    if (dates.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'lori-todo-history__empty';
      emptyMsg.textContent = '還沒有任何待辦紀錄';
      listContainer.appendChild(emptyMsg);
      return;
    }

    dates.forEach(entry => {
      const isToday = entry.date === today;
      const row = createDateStackRow({
        date: entry.date,
        label: formatHistoryLabel(entry.date, isToday),
        sub: formatSub(entry.done, entry.total),
        percent: entry.percent,
        isToday,
        onClick: (date) => navigate(`#/todo/${date}`),
      });
      listContainer.appendChild(row);
    });
  } catch (err) {
    console.warn('TODO 歷史資料載入失敗:', err);
    const errorMsg = document.createElement('div');
    errorMsg.className = 'lori-todo-history__empty';
    errorMsg.textContent = '資料載入失敗';
    listContainer.appendChild(errorMsg);
  }
}

// 匯出供測試
export { formatHistoryLabel, formatSub, collectTodoDates };
