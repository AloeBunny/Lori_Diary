// 小蘿日誌 — DateStackRow 元件
// 日期堆疊列表的單行元件：日期 + 色塊進度條 + 點擊導航

/**
 * 建立日期堆疊列（DateStackRow）
 * @param {object} opts
 * @param {string} opts.date - YYYY-MM-DD 日期字串
 * @param {string} opts.label - 主標籤（如「今日 · 5月 12 (二)」）
 * @param {string} opts.sub - 副標籤（如「5 / 8 完成」）
 * @param {number} opts.percent - 完成度 0~1
 * @param {boolean} opts.isToday - 是否為今天（今天有特殊高亮）
 * @param {function} opts.onClick - 點擊回調 (date) => void
 * @returns {HTMLElement}
 */
export function createDateStackRow({
  date = '',
  label = '',
  sub = '',
  percent = 0,
  isToday = false,
  onClick = null,
} = {}) {
  const row = document.createElement('div');
  row.className = 'lori-date-stack-row';
  if (isToday) row.classList.add('lori-date-stack-row--today');

  // 根據是否今天 + 完成度，計算背景色
  const bgColor = isToday
    ? 'var(--mint)'
    : _calcBgColor(percent);
  row.style.background = bgColor;

  if (isToday) {
    row.style.color = '#fff';
    row.style.boxShadow = '0 6px 16px rgba(168,216,190,0.35)';
  }

  // 進度填色層
  const fillEl = document.createElement('div');
  fillEl.className = 'lori-date-stack-row__fill';
  const opacity = isToday ? 0.2 : 0.4;
  fillEl.style.background = `linear-gradient(to right, rgba(255,255,255,${opacity}) ${Math.round(percent * 100)}%, transparent ${Math.round(percent * 100)}%)`;
  row.appendChild(fillEl);

  // 內容層
  const content = document.createElement('div');
  content.className = 'lori-date-stack-row__content';

  // 左側：label + sub
  const leftCol = document.createElement('div');
  leftCol.className = 'lori-date-stack-row__left';

  const labelEl = document.createElement('div');
  labelEl.className = 'lori-date-stack-row__label';
  labelEl.textContent = label;
  leftCol.appendChild(labelEl);

  if (sub) {
    const subEl = document.createElement('div');
    subEl.className = 'lori-date-stack-row__sub';
    subEl.textContent = sub;
    leftCol.appendChild(subEl);
  }

  content.appendChild(leftCol);

  // 右側：百分比
  const rightCol = document.createElement('div');
  rightCol.className = 'lori-date-stack-row__right';

  const pctEl = document.createElement('div');
  pctEl.className = 'tabnum lori-date-stack-row__pct';
  const numText = document.createTextNode(String(Math.round(percent * 100)));
  pctEl.appendChild(numText);

  const unitSpan = document.createElement('span');
  unitSpan.className = 'lori-date-stack-row__pct-unit';
  unitSpan.textContent = '%';
  pctEl.appendChild(unitSpan);

  rightCol.appendChild(pctEl);
  content.appendChild(rightCol);

  row.appendChild(content);

  // 點擊事件
  if (onClick) {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => onClick(date));
  }

  return row;
}

/**
 * 根據完成度計算非今日行的背景色（mint 漸淡）
 * @param {number} percent 0~1
 * @returns {string}
 */
function _calcBgColor(percent) {
  // 從 0.55 到 0.14 的 opacity 範圍
  const minOpacity = 0.14;
  const maxOpacity = 0.55;
  const opacity = minOpacity + (maxOpacity - minOpacity) * percent;
  return `rgba(168,216,190,${opacity.toFixed(2)})`;
}

// 匯出工具函式供測試
export { _calcBgColor };
