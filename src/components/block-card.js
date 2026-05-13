// 小蘿日誌 — BlockCard 元件
// Routine Block 卡片：左側色條 + 名稱 + 時間範圍 + step 數 + PillBar 進度
// 用於 1310 Block 列表

import { createPillBar } from './pill-bar.js';

/**
 * 格式化 4 位 HHMM 時間字串為 HH:MM
 * @param {string} hhmm - 例如 '0530'
 * @returns {string} 例如 '05:30'
 */
function _formatHHMM(hhmm) {
  if (!hhmm || hhmm.length < 4) return '';
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2)}`;
}

/**
 * 建立 BlockCard
 * @param {object} opts
 * @param {object} opts.block - Block 資料物件 { b_index, b_name, b_rise, b_set }
 * @param {number} opts.stepCount - 該 Block 的 Step 總數
 * @param {number} opts.completionPercent - 完成百分比 0~100
 * @param {string} opts.color - 左側色條顏色，預設 var(--mint)
 * @param {boolean} opts.active - 是否為當前選取狀態
 * @param {function|null} opts.onClick - 點擊回調 (b_index) => void
 * @returns {HTMLElement}
 */
export function createBlockCard({
  block = { b_index: 0, b_name: '', b_rise: '', b_set: '' },
  stepCount = 0,
  completionPercent = 0,
  color = 'var(--mint)',
  active = false,
  onClick = null,
} = {}) {
  const { b_index, b_name, b_rise, b_set } = block;
  const clamped = Math.max(0, Math.min(100, completionPercent));

  // ── 外層容器 ──
  const card = document.createElement('div');
  card.className = 'lori-block-card lori-card';
  card.dataset.blockIndex = String(b_index);

  if (active) {
    card.classList.add('lori-block-card--active');
  }

  // ── 左側色條 ──
  const stripe = document.createElement('div');
  stripe.className = 'lori-block-card__stripe';
  stripe.style.background = color;
  card.appendChild(stripe);

  // ── 右側內容區 ──
  const body = document.createElement('div');
  body.className = 'lori-block-card__body';

  // 標題列：名稱 + 百分比
  const titleRow = document.createElement('div');
  titleRow.className = 'lori-block-card__title-row';

  const nameEl = document.createElement('div');
  nameEl.className = 'lori-block-card__name';
  nameEl.textContent = b_name;
  titleRow.appendChild(nameEl);

  const pctEl = document.createElement('div');
  pctEl.className = 'lori-block-card__pct tabnum';
  pctEl.textContent = `${Math.round(clamped)}%`;
  if (clamped >= 100) {
    pctEl.style.color = 'var(--green)';
  }
  titleRow.appendChild(pctEl);

  body.appendChild(titleRow);

  // 資訊列：時間範圍 + step 數
  const infoRow = document.createElement('div');
  infoRow.className = 'lori-block-card__info';

  // 時間範圍
  const riseStr = _formatHHMM(b_rise);
  const setStr = _formatHHMM(b_set);
  if (riseStr && setStr) {
    const timeSpan = document.createElement('span');
    timeSpan.textContent = `⏱ ${riseStr}~${setStr}`;
    infoRow.appendChild(timeSpan);
  } else if (riseStr) {
    const timeSpan = document.createElement('span');
    timeSpan.textContent = `⏱ ${riseStr}`;
    infoRow.appendChild(timeSpan);
  }

  // step 數
  const stepSpan = document.createElement('span');
  stepSpan.textContent = `· ${stepCount} step`;
  infoRow.appendChild(stepSpan);

  body.appendChild(infoRow);

  // PillBar 進度條
  const pillWrap = document.createElement('div');
  pillWrap.className = 'lori-block-card__pill';
  const pillBar = createPillBar({
    percent: clamped,
    color: color,
    height: 6,
    bg: '#EFEBE1',
  });
  pillWrap.appendChild(pillBar);
  body.appendChild(pillWrap);

  card.appendChild(body);

  // ── 點擊事件 ──
  if (onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => onClick(b_index));
  }

  return card;
}

/**
 * 更新 BlockCard 進度
 * @param {HTMLElement} cardEl - createBlockCard 回傳的元素
 * @param {number} percent - 新百分比 0~100
 */
export function updateBlockCard(cardEl, percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  const pctEl = cardEl.querySelector('.lori-block-card__pct');
  if (pctEl) {
    pctEl.textContent = `${Math.round(clamped)}%`;
    pctEl.style.color = clamped >= 100 ? 'var(--green)' : '';
  }
  // 直接操作 PillBar 內部 fill 元素
  const fill = cardEl.querySelector('.lori-pill-bar__fill');
  if (fill) fill.style.width = `${clamped}%`;
}

// 匯出工具函式供測試
export { _formatHHMM };
