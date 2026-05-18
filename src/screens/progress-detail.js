// 小蘿日誌 — 進度明細頁（Screen 1110）
// 日期 + 整體完成率 + 三條 DateBar 同款進度條 + 鼓勵語

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { navigate } from '../router.js';
import { dbGetAll } from '../db.js';
import { getEncouragement, formatDateDisplay, silentCatch } from '../utils/helpers.js';

// ===== 資料讀取 =====

/**
 * 計算某天的各分類完成率
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Promise<{todo: number, routine: number, learning: number, overall: number, todoCount: string, routineCount: string, learningCount: string}>}
 */
async function getDetailCompletion(dateStr) {
  // TODO 完成率
  let todoPct = 0;
  let todoCount = '0 / 0';
  try {
    const todos = await dbGetAll('todos', 'date', dateStr);
    if (todos.length > 0) {
      const done = todos.filter(t => t.done).length;
      todoPct = done / todos.length;
      todoCount = `${done} / ${todos.length}`;
    }
  } catch(e) { silentCatch(e, 'progress detail todo pct'); }

  // Routine 完成率
  let routinePct = 0;
  let routineCount = '';
  try {
    const rec = await dbGetAll('records');
    const dayRec = rec.find(r => r.date === dateStr);
    if (dayRec && dayRec.routine_pct !== undefined) {
      routinePct = dayRec.routine_pct;
      routineCount = `${Math.round(routinePct * 100)}% 完成`;
    }
  } catch(e) { silentCatch(e, 'progress detail routine pct'); }

  // 學習完成率
  let learningPct = 0;
  let learningCount = '';
  try {
    const claims = await dbGetAll('claims', 'c_date', dateStr);
    if (claims.length > 0) {
      const total = claims.reduce((sum, c) => sum + (c.c_target || 1), 0);
      const actual = claims.reduce((sum, c) => sum + Math.min(c.c_actual || 0, c.c_target || 1), 0);
      learningPct = total > 0 ? actual / total : 0;
      learningCount = `Day Quest ${Math.round(learningPct * 100)}%`;
    }
  } catch(e) { silentCatch(e, 'progress detail learning pct'); }

  const overall = (todoPct + routinePct + learningPct) / 3;

  return {
    todo: todoPct,
    routine: routinePct,
    learning: learningPct,
    overall,
    todoCount,
    routineCount,
    learningCount,
  };
}

// ===== 進度條元件（DateBar 同款樣式） =====

/**
 * 建立 DateBar 同款全寬進度條
 * @param {object} opts
 * @param {string} opts.label - 分類名稱
 * @param {number} opts.percent - 完成度 0~1
 * @param {string} opts.color - 進度條填充色
 * @param {string} opts.count - 說明文字
 * @param {function} opts.onClick - 點擊回調
 * @returns {HTMLElement}
 */
function createProgressBar({ label, percent, color, count, onClick }) {
  const container = document.createElement('div');
  container.className = 'lori-progress-bar';
  if (onClick) {
    container.style.cursor = 'pointer';
    container.addEventListener('click', onClick);
  }

  // 進度填色背景（與 DateBar 同款）
  const fill = document.createElement('div');
  fill.className = 'lori-progress-bar__fill';
  fill.style.width = `${Math.round(percent * 100)}%`;
  fill.style.background = color;
  container.appendChild(fill);

  // 內容層
  const content = document.createElement('div');
  content.className = 'lori-progress-bar__content';

  // 左側：分類名稱 + 說明
  const leftCol = document.createElement('div');
  leftCol.className = 'lori-progress-bar__left';

  const nameEl = document.createElement('div');
  nameEl.className = 'lori-progress-bar__name';
  nameEl.textContent = label;
  leftCol.appendChild(nameEl);

  if (count) {
    const countEl = document.createElement('div');
    countEl.className = 'lori-progress-bar__count';
    countEl.textContent = count;
    leftCol.appendChild(countEl);
  }

  content.appendChild(leftCol);

  // 右側：百分比
  const pctEl = document.createElement('div');
  pctEl.className = 'tabnum lori-progress-bar__pct';
  const numText = document.createTextNode(String(Math.round(percent * 100)));
  pctEl.appendChild(numText);
  const unitSpan = document.createElement('span');
  unitSpan.className = 'lori-progress-bar__pct-unit';
  unitSpan.textContent = '%';
  pctEl.appendChild(unitSpan);

  content.appendChild(pctEl);
  container.appendChild(content);

  return container;
}

// ===== 渲染 =====

/**
 * 渲染進度明細頁到容器
 * @param {HTMLElement} root
 * @param {object} params - 路由參數
 * @param {string} params.date - YYYY-MM-DD
 * @returns {function} cleanup
 */
export function renderProgressDetail(root, params = {}) {
  const dateStr = params.date || new Date().toISOString().slice(0, 10);

  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: '進度明細',
    showBack: true,
    onBack: () => navigate('#/dashboard'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-progress-detail';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '36px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 日期 + 整體完成率
  const dateSection = document.createElement('div');
  dateSection.className = 'lori-progress-detail__date-section';

  const dateEl = document.createElement('div');
  dateEl.className = 'lori-progress-detail__date';
  dateEl.textContent = formatDateDisplay(dateStr);
  dateSection.appendChild(dateEl);

  const overallRow = document.createElement('div');
  overallRow.className = 'lori-progress-detail__overall-row';

  const overallPct = document.createElement('div');
  overallPct.className = 'tabnum lori-progress-detail__overall-pct';
  const overallNumText = document.createTextNode('0');
  overallPct.appendChild(overallNumText);
  const overallUnit = document.createElement('span');
  overallUnit.className = 'lori-progress-detail__overall-unit';
  overallUnit.textContent = '%';
  overallPct.appendChild(overallUnit);
  overallRow.appendChild(overallPct);

  const overallLabel = document.createElement('div');
  overallLabel.className = 'lori-progress-detail__overall-label';
  overallLabel.textContent = '整體完成度';
  overallRow.appendChild(overallLabel);

  dateSection.appendChild(overallRow);

  // 整體進度條
  const overallBar = document.createElement('div');
  overallBar.className = 'lori-progress-detail__overall-bar';
  const overallFill = document.createElement('div');
  overallFill.className = 'lori-progress-detail__overall-fill';
  overallFill.style.width = '0%';
  overallBar.appendChild(overallFill);
  dateSection.appendChild(overallBar);

  body.appendChild(dateSection);

  // 分類明細標題
  const catTitle = document.createElement('div');
  catTitle.className = 'lori-progress-detail__cat-title';
  catTitle.textContent = '分類明細';
  body.appendChild(catTitle);

  // 三條進度條容器
  const barsContainer = document.createElement('div');
  barsContainer.className = 'lori-progress-detail__bars';

  // 先放空的 placeholder，等資料載入
  const todoBar = createProgressBar({
    label: '待辦事項',
    percent: 0,
    color: 'var(--hm-sky)',
    count: '',
    onClick: () => navigate(`#/todo/${dateStr}`),
  });
  barsContainer.appendChild(todoBar);

  const routineBar = createProgressBar({
    label: '日常循環',
    percent: 0,
    color: 'var(--gray)',
    count: '',
    onClick: () => navigate(`#/routine/${dateStr}`),
  });
  barsContainer.appendChild(routineBar);

  const learningBar = createProgressBar({
    label: '學習進度',
    percent: 0,
    color: 'var(--hm-sun)',
    count: '',
    onClick: () => navigate(`#/learning/${dateStr}`),
  });
  barsContainer.appendChild(learningBar);

  body.appendChild(barsContainer);

  // 鼓勵語區塊
  const encourageEl = document.createElement('div');
  encourageEl.className = 'lori-progress-detail__encourage';
  encourageEl.textContent = '';
  body.appendChild(encourageEl);

  // 載入資料
  _loadDetailData(dateStr, overallNumText, overallFill, barsContainer, encourageEl);

  // cleanup
  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 非同步載入資料並更新畫面
 */
async function _loadDetailData(dateStr, overallNumText, overallFillEl, barsContainer, encourageEl) {
  try {
    const data = await getDetailCompletion(dateStr);

    // 更新整體完成度
    overallNumText.textContent = String(Math.round(data.overall * 100));
    overallFillEl.style.width = `${Math.round(data.overall * 100)}%`;

    // 重建三條進度條
    while (barsContainer.firstChild) barsContainer.removeChild(barsContainer.firstChild);

    const cats = [
      {
        label: '待辦事項',
        percent: data.todo,
        color: 'var(--hm-sky)',
        count: data.todoCount,
        onClick: () => navigate(`#/todo/${dateStr}`),
      },
      {
        label: '日常循環',
        percent: data.routine,
        color: 'var(--gray)',
        count: data.routineCount,
        onClick: () => navigate(`#/routine/${dateStr}`),
      },
      {
        label: '學習進度',
        percent: data.learning,
        color: 'var(--hm-sun)',
        count: data.learningCount,
        onClick: () => navigate(`#/learning/${dateStr}`),
      },
    ];

    cats.forEach(c => {
      barsContainer.appendChild(createProgressBar(c));
    });

    // 載入鼓勵語
    try {
      const msg = await getEncouragement('daily');
      encourageEl.textContent = `「${msg}」`;
    } catch(e) {
      silentCatch(e, 'progress detail encouragement');
      encourageEl.textContent = '「每一步都算數。」';
    }
  } catch (err) {
    console.warn('進度明細資料載入失敗:', err);
  }
}
