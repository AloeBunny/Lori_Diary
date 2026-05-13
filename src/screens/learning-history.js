// 小蘿日誌 — 學習回顧頁（Screen 1420）
// StatusBar → HeaderBar「學習回顧」→ DateStackRow 列表 → TabBar
// 從 records store 讀學習類型紀錄（claims）

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
function formatLearningLabel(dateStr, isToday) {
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
 * 格式化學習回顧的 sub 文字
 * @param {object} entry - { claimCount, completedCount, totalTarget, totalActual, skillNames }
 * @returns {string}
 */
function formatLearningSub(entry) {
  const { claimCount, completedCount, skillNames } = entry;
  if (claimCount === 0) return '未認領';

  const nameStr = skillNames && skillNames.length > 0
    ? [...new Set(skillNames)].join(' · ')
    : `${claimCount} quest`;

  if (completedCount === claimCount && claimCount > 0) {
    return `${nameStr} · 全勾`;
  }
  if (completedCount === 0) {
    return nameStr;
  }
  return `${nameStr} · ${completedCount}/${claimCount} 完成`;
}

// ===== 資料收集 =====

/**
 * 收集所有有學習認領紀錄的日期並計算完成度
 * 從 claims store 讀取，按日期群組
 * @returns {Promise<Array>}
 */
async function collectLearningDates() {
  let allClaims = [];
  let allSkills = [];

  try {
    allClaims = await dbGetAll('claims');
  } catch {
    // claims store 可能還沒資料
  }

  try {
    allSkills = await dbGetAll('skills');
  } catch {
    // skills store 可能還沒資料
  }

  // 建立 skill name 查找表
  const skillNameMap = new Map();
  for (const sk of allSkills) {
    skillNameMap.set(sk.sk_index, sk.sk_name || '');
  }

  // 按日期分組
  const dateMap = new Map();

  for (const claim of allClaims) {
    const date = claim.c_date;
    if (!date) continue;

    // 轉為 YYYY-MM-DD 格式（DB 用 YYYYMMDD 或 YYYY-MM-DD 都可能）
    const normalizedDate = date.length === 8
      ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
      : date;

    if (!dateMap.has(normalizedDate)) {
      dateMap.set(normalizedDate, {
        claimCount: 0,
        completedCount: 0,
        totalTarget: 0,
        totalActual: 0,
        skillNames: [],
      });
    }

    const entry = dateMap.get(normalizedDate);
    entry.claimCount++;
    entry.totalTarget += claim.c_target || 0;
    entry.totalActual += claim.c_actual || 0;

    // 判斷完成：實際 >= 目標
    if (claim.c_target > 0 && claim.c_actual >= claim.c_target) {
      entry.completedCount++;
    }

    // 記錄 skill 名
    const skName = skillNameMap.get(claim.sk_index);
    if (skName) entry.skillNames.push(skName);
  }

  // 確保今天一定有一筆
  const today = todayStr();
  if (!dateMap.has(today)) {
    dateMap.set(today, {
      claimCount: 0,
      completedCount: 0,
      totalTarget: 0,
      totalActual: 0,
      skillNames: [],
    });
  }

  // 轉為陣列並按日期遞減排列
  const result = [];
  for (const [date, entry] of dateMap.entries()) {
    // 完成度 = 已完成 quest / 認領 quest
    const percent = entry.claimCount > 0
      ? entry.completedCount / entry.claimCount
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
 * 渲染學習回顧頁到容器
 * @param {HTMLElement} root
 * @returns {function} cleanup
 */
export function renderLearningHistory(root) {
  const today = todayStr();

  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: '學習回顧',
    showBack: true,
    onBack: () => navigate('#/learning'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-learning-history';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '100px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 列表容器
  const listContainer = document.createElement('div');
  listContainer.className = 'lori-learning-history__list';
  body.appendChild(listContainer);

  // TabBar
  const tabBar = createTabBar('lrn');
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
    const dates = await collectLearningDates();

    if (dates.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'lori-learning-history__empty';
      emptyMsg.textContent = '還沒有任何學習紀錄';
      listContainer.appendChild(emptyMsg);
      return;
    }

    dates.forEach(entry => {
      const isToday = entry.date === today;
      const row = createDateStackRow({
        date: entry.date,
        label: formatLearningLabel(entry.date, isToday),
        sub: formatLearningSub(entry),
        percent: entry.percent,
        isToday,
        onClick: (date) => navigate(`#/learning/${date}`),
      });
      listContainer.appendChild(row);
    });
  } catch (err) {
    console.warn('學習回顧資料載入失敗:', err);
    const errorMsg = document.createElement('div');
    errorMsg.className = 'lori-learning-history__empty';
    errorMsg.textContent = '資料載入失敗';
    listContainer.appendChild(errorMsg);
  }
}

// 匯出供測試
export { formatLearningLabel, formatLearningSub, collectLearningDates };
