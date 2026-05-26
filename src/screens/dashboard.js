// 小蘿日誌 — 儀表板（Screen 1100）
// 紅蘿蔔積分 + RingProgress 圓環 + Heatmap 熱力圖 + MiniCalendar 月曆

import { createStatusBar } from '../components/status-bar.js';
import { createTabBar } from '../components/tab-bar.js';
import { iconGear, iconShop } from '../components/icons.js';
import { navigate } from '../router.js';
import { getCarrots, dbGetAll, setSetting } from '../db.js';
import { todayStr, calcStreak, silentCatch } from '../utils/helpers.js';

// ===== Worker A 元件 placeholder =====

/**
 * 嘗試載入 Worker A 的元件，若不存在則提供 placeholder
 */
let _createRingProgress = null;
let _createHeatmap = null;
let _createMiniCalendar = null;

try {
  const mod = await import('../components/ring-progress.js');
  _createRingProgress = mod.createRingProgress;
} catch(e) {
  silentCatch(e, 'ring-progress import');
  _createRingProgress = ({ percent, label, size }) => {
    const el = document.createElement('div');
    el.className = 'lori-dashboard__ring-placeholder';
    el.style.width = `${size || 172}px`;
    el.style.height = `${size || 172}px`;
    el.style.borderRadius = '50%';
    el.style.border = '12px solid var(--mint)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.flexDirection = 'column';

    const pctEl = document.createElement('div');
    pctEl.className = 'tabnum';
    pctEl.style.fontSize = '38px';
    pctEl.style.fontWeight = '600';
    pctEl.style.color = 'var(--ink)';

    const numSpan = document.createTextNode(String(Math.round(percent * 100)));
    pctEl.appendChild(numSpan);

    const unitSpan = document.createElement('span');
    unitSpan.style.fontSize = '18px';
    unitSpan.style.color = 'var(--gray)';
    unitSpan.textContent = '%';
    pctEl.appendChild(unitSpan);

    el.appendChild(pctEl);

    if (label) {
      const lblEl = document.createElement('div');
      lblEl.style.fontSize = '11px';
      lblEl.style.color = 'var(--gray)';
      lblEl.style.marginTop = '2px';
      lblEl.textContent = label;
      el.appendChild(lblEl);
    }
    return el;
  };
}

try {
  const mod = await import('../components/heatmap.js');
  _createHeatmap = mod.createHeatmap;
} catch(e) {
  silentCatch(e, 'heatmap import');
  _createHeatmap = ({ records, onSelect }) => {
    const el = document.createElement('div');
    el.className = 'lori-dashboard__heatmap-placeholder';
    el.style.padding = '16px';
    el.style.textAlign = 'center';
    el.style.color = 'var(--gray)';
    el.style.fontSize = '13px';
    el.textContent = '[Heatmap 元件載入中]';
    return el;
  };
}

try {
  const mod = await import('../components/mini-calendar.js');
  _createMiniCalendar = mod.createMiniCalendar;
} catch(e) {
  silentCatch(e, 'mini-calendar import');
  _createMiniCalendar = ({ records, onSelect }) => {
    const el = document.createElement('div');
    el.className = 'lori-card lori-dashboard__calendar-placeholder';
    el.style.margin = '0 16px';
    el.style.padding = '16px';
    el.style.textAlign = 'center';
    el.style.color = 'var(--gray)';
    el.style.fontSize = '13px';
    el.textContent = '[MiniCalendar 元件載入中]';
    return el;
  };
}

// ===== 資料讀取 =====

/**
 * 計算某天的各分類完成率
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Promise<{todo: number, routine: number, learning: number, overall: number}>}
 */
async function getDayCompletion(dateStr) {
  // TODO 完成率
  let todoPct = 0;
  try {
    const todos = await dbGetAll('todos', 'date', dateStr);
    if (todos.length > 0) {
      const done = todos.filter(t => t.done).length;
      todoPct = done / todos.length;
    }
  } catch(e) { silentCatch(e, 'dashboard todo pct'); }

  // Routine 完成率
  let routinePct = 0;
  try {
    const rec = await dbGetAll('records');
    const dayRec = rec.find(r => r.date === dateStr);
    if (dayRec && dayRec.routine_pct !== undefined) {
      routinePct = dayRec.routine_pct;
    }
  } catch(e) { silentCatch(e, 'dashboard routine pct'); }

  // 學習完成率
  let learningPct = 0;
  try {
    const claims = await dbGetAll('claims', 'c_date', dateStr);
    if (claims.length > 0) {
      const total = claims.reduce((sum, c) => sum + (c.c_target || 1), 0);
      const actual = claims.reduce((sum, c) => sum + Math.min(c.c_actual || 0, c.c_target || 1), 0);
      learningPct = total > 0 ? actual / total : 0;
    }
  } catch(e) { silentCatch(e, 'dashboard learning pct'); }

  const overall = (todoPct + routinePct + learningPct) / 3;

  return { todo: todoPct, routine: routinePct, learning: learningPct, overall };
}

/**
 * 取得最近 N 天的完成度紀錄（用於 Heatmap / Calendar）
 * @param {number} days
 * @returns {Promise<Array<{date: string, pct: number}>>}
 */
async function getRecentRecords(days = 112) {
  const records = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    try {
      const comp = await getDayCompletion(dateStr);
      // percent 0~100（heatmap/calendar 期待 0~100），pct 0~1（calcStreak 期待 >0）
      records.push({ date: dateStr, percent: Math.round(comp.overall * 100), pct: comp.overall });
    } catch(e) {
      silentCatch(e, 'dashboard day completion');
      records.push({ date: dateStr, percent: 0, pct: 0 });
    }
  }
  return records;
}

// ===== 渲染 =====

/**
 * 渲染儀表板到容器
 * @param {HTMLElement} root
 * @returns {function} cleanup
 */
export function renderDashboard(root) {
  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-dashboard';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '54px';
  body.style.paddingBottom = '100px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 右上角按鈕群組
  const topRight = document.createElement('div');
  topRight.className = 'lori-dashboard__top-right';

  const gearBtn = document.createElement('button');
  gearBtn.className = 'lori-dashboard__icon-btn';
  gearBtn.setAttribute('aria-label', '設定');
  gearBtn.appendChild(iconGear(20));
  gearBtn.addEventListener('click', () => navigate('#/settings'));
  topRight.appendChild(gearBtn);

  const shopBtn = document.createElement('button');
  shopBtn.className = 'lori-dashboard__icon-btn';
  shopBtn.setAttribute('aria-label', '商店');
  shopBtn.appendChild(iconShop(20));
  shopBtn.addEventListener('click', () => navigate('#/shop'));
  topRight.appendChild(shopBtn);

  body.appendChild(topRight);

  // F10：歡迎卡片插槽
  const welcomeSlot = document.createElement('div');
  welcomeSlot.className = 'lori-dashboard__welcome-slot';
  body.appendChild(welcomeSlot);

  // 積分 + 圓環區塊
  const scoreSection = document.createElement('div');
  scoreSection.className = 'lori-dashboard__score';

  const carrotLabel = document.createElement('div');
  carrotLabel.className = 'lori-dashboard__carrot-label';
  carrotLabel.textContent = '\u{1F955} 累積積分';
  scoreSection.appendChild(carrotLabel);

  const carrotNum = document.createElement('div');
  carrotNum.className = 'tabnum lori-dashboard__carrot-num';
  carrotNum.textContent = '0';
  scoreSection.appendChild(carrotNum);

  // 圓環 placeholder（等資料載入後替換）
  const ringWrap = document.createElement('div');
  ringWrap.className = 'lori-dashboard__ring-wrap';
  const ringEl = _createRingProgress({ percent: 0, label: '今日完成', size: 172 });
  ringWrap.appendChild(ringEl);
  scoreSection.appendChild(ringWrap);

  body.appendChild(scoreSection);

  // 熱力圖區塊
  const heatSection = document.createElement('div');
  heatSection.className = 'lori-dashboard__heat-section';

  const heatHeader = document.createElement('div');
  heatHeader.className = 'lori-dashboard__heat-header';

  const heatTitle = document.createElement('div');
  heatTitle.className = 'lori-dashboard__heat-title';
  heatTitle.textContent = '近 16 週';
  heatHeader.appendChild(heatTitle);

  const streakLabel = document.createElement('div');
  streakLabel.className = 'lori-dashboard__streak';
  streakLabel.textContent = '';
  heatHeader.appendChild(streakLabel);

  heatSection.appendChild(heatHeader);

  const heatCard = document.createElement('div');
  heatCard.className = 'lori-card';
  heatCard.style.padding = '14px';

  const heatmapEl = _createHeatmap({
    records: [],
    onSelect: (dateStr) => navigate(`#/progress/${dateStr}`),
  });
  heatCard.appendChild(heatmapEl);
  heatSection.appendChild(heatCard);
  body.appendChild(heatSection);

  // 月曆區塊
  const calSection = document.createElement('div');
  calSection.className = 'lori-dashboard__cal-section';

  const calendarEl = _createMiniCalendar({
    records: [],
    onSelect: (dateStr) => navigate(`#/progress/${dateStr}`),
  });
  calSection.appendChild(calendarEl);
  body.appendChild(calSection);

  // 底部間距
  const spacer = document.createElement('div');
  spacer.style.height = '12px';
  body.appendChild(spacer);

  // TabBar
  const tabBar = createTabBar('dash');
  root.appendChild(tabBar);

  // 載入非同步資料
  _loadDashboardData(carrotNum, ringWrap, heatCard, streakLabel, calSection, welcomeSlot);

  // cleanup
  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 非同步載入資料並更新畫面
 */
async function _loadDashboardData(carrotNumEl, ringWrapEl, heatCardEl, streakLabelEl, calSectionEl, welcomeSlotEl) {
  try {
    // 紅蘿蔔積分
    const carrots = await getCarrots();
    carrotNumEl.textContent = String(carrots);

    // 今日完成率
    const today = todayStr();
    const todayComp = await getDayCompletion(today);
    const pct = todayComp.overall;

    // 更新圓環（percent 0~100）
    while (ringWrapEl.firstChild) ringWrapEl.removeChild(ringWrapEl.firstChild);
    const newRing = _createRingProgress({ percent: Math.round(pct * 100), label: '今日完成', size: 172 });
    ringWrapEl.appendChild(newRing);

    // 載入近期紀錄
    const records = await getRecentRecords(112);

    // F6：計算打卡統計
    const streak = calcStreak(records);
    if (streak.total > 0) {
      if (streak.gaps > 0) {
        streakLabelEl.textContent = `連續 ${streak.current} 天（共 ${streak.total} 天，${streak.gaps} 個裂口）`;
      } else {
        streakLabelEl.textContent = `連續 ${streak.total} 天 🔥`;
      }
    }

    // F10：回歸歡迎卡片
    // 找到最後一個有打卡的日期，算距今 gap
    let lastCheckinIdx = -1;
    for (let i = records.length - 1; i >= 0; i--) {
      if (records[i].pct > 0) {
        lastCheckinIdx = i;
        break;
      }
    }
    if (lastCheckinIdx >= 0 && welcomeSlotEl) {
      const gap = records.length - 1 - lastCheckinIdx;
      if (gap >= 2 && !sessionStorage.getItem('lori_welcome_shown')) {
        const card = document.createElement('div');
        card.className = 'lori-card lori-dashboard__welcome';
        const title = document.createElement('div');
        title.textContent = '你回來了 🐰';
        card.appendChild(title);
        const sub = document.createElement('div');
        sub.style.fontSize = '13px';
        sub.style.color = 'var(--gray)';
        sub.style.marginTop = '4px';
        sub.textContent = `休息了 ${gap} 天也沒關係。慢慢來。`;
        card.appendChild(sub);
        welcomeSlotEl.appendChild(card);
        sessionStorage.setItem('lori_welcome_shown', '1');

        // F10 → F8：回歸自動啟用簡化模式
        try {
          await setSetting('simplified_mode', true);
        } catch(e) { silentCatch(e, 'auto enable simplified_mode'); }
      }
    }

    // 更新熱力圖
    while (heatCardEl.firstChild) heatCardEl.removeChild(heatCardEl.firstChild);
    const newHeatmap = _createHeatmap({
      records,
      onSelect: (dateStr) => navigate(`#/progress/${dateStr}`),
    });
    heatCardEl.appendChild(newHeatmap);

    // 更新月曆
    while (calSectionEl.firstChild) calSectionEl.removeChild(calSectionEl.firstChild);
    const newCalendar = _createMiniCalendar({
      records,
      onSelect: (dateStr) => navigate(`#/progress/${dateStr}`),
    });
    calSectionEl.appendChild(newCalendar);
  } catch (err) {
    console.warn('儀表板資料載入失敗:', err);
  }
}

// 匯出 getDayCompletion 供其他畫面使用
export { getDayCompletion };
