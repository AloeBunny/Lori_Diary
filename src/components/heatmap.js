// 小蘿日誌 — 熱力圖元件
// 16 週 × 7 天 = 112 格，用 helpers.js 的 HEAT_HUES（9 色）和 heatColor()

import { HEAT_HUES, pseudo } from '../utils/helpers.js';

/**
 * 根據 records 計算某天的顏色
 * 色相 = pseudo 隨機分配（每天固定），濃淡 = 完成度 5 階
 * @param {number} dayIndex - 格子索引（用於 pseudo seed）
 * @param {number} percent - 完成百分比 0~100
 * @returns {string} 色碼
 */
function heatCellColor(dayIndex, percent) {
  if (percent <= 0) return HEAT_HUES[0][0]; // 空白色 #F2F0ED

  // 色相由 pseudo(dayIndex) 決定
  const hueIdx = Math.floor(pseudo(dayIndex) * HEAT_HUES.length);
  const hue = HEAT_HUES[hueIdx];

  // 濃淡 5 階：0%=0, 1~25%=1, 26~50%=2, 51~75%=3, 76~100%=4
  let level;
  if (percent <= 0)  level = 0;
  else if (percent <= 25) level = 1;
  else if (percent <= 50) level = 2;
  else if (percent <= 75) level = 3;
  else level = 4;

  return hue[level];
}

/**
 * 建立熱力圖
 * @param {object} opts
 * @param {Array<{date: string, percent: number}>} opts.records - 紀錄陣列
 * @param {function|null} opts.onSelect - 點擊某天的回呼 onSelect(date)
 * @param {number} opts.cols - 週數，預設 16
 * @param {number} opts.rows - 每週天數，預設 7
 * @param {number} opts.cell - 格子尺寸 px，預設 14
 * @param {number} opts.gap - 間距 px，預設 3
 * @returns {HTMLElement}
 */
export function createHeatmap({
  records = [],
  onSelect = null,
  cols = 16,
  rows = 7,
  cell = 14,
  gap = 3,
} = {}) {
  const totalCells = cols * rows;

  // 建立 records lookup：以 date 為 key
  const recordMap = new Map();
  records.forEach(r => recordMap.set(r.date, r.percent));

  // 計算日期起點（今天往前推 totalCells - 1 天）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (totalCells - 1));

  // 外層容器
  const container = document.createElement('div');
  container.className = 'lori-heatmap';

  // 網格容器
  const grid = document.createElement('div');
  grid.className = 'lori-heatmap__grid';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, ${cell}px)`;
  grid.style.gridAutoRows = `${cell}px`;
  grid.style.gap = `${gap}px`;
  grid.style.justifyContent = 'center';

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);
    const dateStr = cellDate.toISOString().slice(0, 10);
    const isFuture = cellDate > today;

    // 取得完成度
    const pct = isFuture ? -1 : (recordMap.has(dateStr) ? recordMap.get(dateStr) : 0);
    const bgColor = isFuture ? '#F2F0ED' : heatCellColor(i, pct);

    const dot = document.createElement('div');
    dot.className = 'lori-heatmap__cell';
    dot.style.width = `${cell}px`;
    dot.style.height = `${cell}px`;
    dot.style.borderRadius = '3px';
    dot.style.background = bgColor;
    dot.style.cursor = isFuture ? 'default' : 'pointer';
    dot.dataset.date = dateStr;

    if (!isFuture && onSelect) {
      dot.addEventListener('click', () => onSelect(dateStr));
    }

    grid.appendChild(dot);
  }

  container.appendChild(grid);
  return container;
}

// 匯出給測試用
export { heatCellColor };
