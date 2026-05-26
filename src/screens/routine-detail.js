// 小蘿日誌 — Routine 日期細節頁
// 顯示某天的 Routine 完成紀錄：整體完成度 + 每個 Block 的 step 結果

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { navigate } from '../router.js';
import { dbGet, dbGetAll } from '../db.js';
import { silentCatch } from '../utils/helpers.js';

// ===== 日期格式化 =====

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 格式化日期標題
 * @param {string} dateStr YYYY-MM-DD
 * @returns {string} 例如 "2026-05-26 (二)"
 */
function formatDateTitle(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const w = WEEK_DAYS[d.getDay()];
  return `${dateStr} (${w})`;
}

/**
 * 格式化秒數為人類可讀的用時
 * @param {number} seconds
 * @returns {string} 例如 "12 分 34 秒"
 */
function formatElapsed(seconds) {
  if (!seconds || seconds <= 0) return '—';
  const s = Math.round(seconds);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  if (mins === 0) return `${secs} 秒`;
  return `${mins} 分 ${secs} 秒`;
}

// ===== 渲染 =====

/**
 * 渲染 Routine 日期細節頁
 * @param {HTMLElement} root
 * @param {object} params - { date: 'YYYY-MM-DD' }
 * @returns {function} cleanup
 */
export function renderRoutineDetail(root, params = {}) {
  const dateStr = params.date || params.blockId || '';

  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: 'Routine 紀錄',
    showBack: true,
    onBack: () => navigate('#/routine/history'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '36px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 載入資料
  _loadDetail(dateStr, body);

  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 非同步載入並渲染細節
 */
async function _loadDetail(dateStr, body) {
  // 日期大標
  const dateTitle = document.createElement('div');
  dateTitle.className = 'lori-routine-detail__date-title';
  dateTitle.textContent = formatDateTitle(dateStr);
  body.appendChild(dateTitle);

  // 讀取當日紀錄
  let dayRecord = null;
  try {
    dayRecord = await dbGet('records', dateStr);
  } catch (e) {
    silentCatch(e, 'routine detail record load');
  }

  const blocks = dayRecord?.completedBlocks;
  if (!blocks || blocks.length === 0) {
    // 空狀態
    const empty = document.createElement('div');
    empty.className = 'lori-routine-detail__empty';
    empty.textContent = '這天沒有 routine 紀錄';
    body.appendChild(empty);
    return;
  }

  // 整體完成度
  const overallPct = dayRecord.routine_pct !== undefined
    ? Math.round(dayRecord.routine_pct * 100)
    : null;

  if (overallPct !== null) {
    const overallSection = document.createElement('div');
    overallSection.className = 'lori-routine-detail__overall';

    const pctNum = document.createElement('span');
    pctNum.className = 'tabnum lori-routine-detail__overall-num';
    pctNum.textContent = String(overallPct);
    overallSection.appendChild(pctNum);

    const pctUnit = document.createElement('span');
    pctUnit.className = 'lori-routine-detail__overall-unit';
    pctUnit.textContent = '% 完成';
    overallSection.appendChild(pctUnit);

    body.appendChild(overallSection);
  }

  // 讀取所有 steps 用來對照名稱
  let allSteps = [];
  try {
    allSteps = await dbGetAll('steps');
  } catch (e) {
    silentCatch(e, 'routine detail steps load');
  }

  // 每個 Block 卡片
  for (const block of blocks) {
    const card = document.createElement('div');
    card.className = 'lori-card lori-routine-detail__block-card';

    // Block 標題列
    const cardHeader = document.createElement('div');
    cardHeader.className = 'lori-routine-detail__card-header';

    const blockName = document.createElement('div');
    blockName.className = 'lori-routine-detail__block-name';
    blockName.textContent = block.blockName || `Block ${block.blockIndex}`;
    cardHeader.appendChild(blockName);

    const blockPct = document.createElement('div');
    blockPct.className = 'lori-routine-detail__block-pct';
    const pct = block.completionPct !== undefined
      ? Math.round(block.completionPct * 100)
      : 0;
    blockPct.textContent = `${pct}%`;
    cardHeader.appendChild(blockPct);

    card.appendChild(cardHeader);

    // 統計列
    const statsRow = document.createElement('div');
    statsRow.className = 'lori-routine-detail__stats-row';

    const stepCount = document.createElement('span');
    stepCount.textContent = `${block.completedCount || 0} / ${block.totalCount || 0} step`;
    statsRow.appendChild(stepCount);

    const sep1 = document.createElement('span');
    sep1.className = 'lori-routine-detail__sep';
    sep1.textContent = '·';
    statsRow.appendChild(sep1);

    const elapsed = document.createElement('span');
    elapsed.textContent = formatElapsed(block.elapsedSeconds);
    statsRow.appendChild(elapsed);

    const sep2 = document.createElement('span');
    sep2.className = 'lori-routine-detail__sep';
    sep2.textContent = '·';
    statsRow.appendChild(sep2);

    const carrots = document.createElement('span');
    carrots.textContent = `\u{1F955} ${block.totalCarrots || 0}`;
    statsRow.appendChild(carrots);

    card.appendChild(statsRow);

    // Step 列表
    if (block.results && block.results.length > 0) {
      const stepList = document.createElement('div');
      stepList.className = 'lori-routine-detail__step-list';

      // 從 steps store 找對應的 step 名稱
      const blockSteps = allSteps
        .filter(s => s.b_index === block.blockIndex)
        .sort((a, b) => a.s_index - b.s_index);

      block.results.forEach((result, i) => {
        const stepRow = document.createElement('div');
        stepRow.className = 'lori-routine-detail__step-row';

        // 狀態圓點
        const dot = document.createElement('span');
        dot.className = 'lori-routine-detail__step-dot';
        if (result === 'completed') {
          dot.style.background = 'var(--hm-mint, #4DC49A)';
        } else {
          dot.style.background = 'var(--gray, #999)';
        }
        stepRow.appendChild(dot);

        // Step 名稱
        const stepName = document.createElement('span');
        stepName.className = 'lori-routine-detail__step-name';
        const matchedStep = blockSteps[i];
        stepName.textContent = matchedStep ? matchedStep.s_name : `Step ${i + 1}`;
        stepRow.appendChild(stepName);

        // 狀態標籤
        const badge = document.createElement('span');
        badge.className = 'lori-routine-detail__step-badge';
        if (result === 'completed') {
          badge.textContent = '完成';
          badge.style.color = 'var(--hm-mint, #4DC49A)';
        } else {
          badge.textContent = '跳過';
          badge.style.color = 'var(--gray, #999)';
        }
        stepRow.appendChild(badge);

        stepList.appendChild(stepRow);
      });

      card.appendChild(stepList);
    }

    body.appendChild(card);
  }
}
