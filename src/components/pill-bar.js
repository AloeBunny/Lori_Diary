// 小蘿日誌 — 膠囊型進度條元件
// 圓角條狀進度列，填色比例對應 percent

/**
 * 建立膠囊型進度條
 * @param {object} opts
 * @param {number} opts.percent - 完成百分比 0~100
 * @param {string} opts.color - 填色，預設 var(--mint)
 * @param {string} opts.label - 左側標示文字（可選）
 * @param {number} opts.height - 進度條高度（px），預設 10
 * @param {string} opts.bg - 軌道底色，預設 #EAE6DC
 * @returns {HTMLElement}
 */
export function createPillBar({
  percent = 0,
  color = 'var(--mint)',
  label = '',
  height = 10,
  bg = '#EAE6DC',
} = {}) {
  const clamped = Math.max(0, Math.min(100, percent));

  const container = document.createElement('div');
  container.className = 'lori-pill-bar';

  // 如果有 label，建立含標示的容器
  if (label) {
    const labelRow = document.createElement('div');
    labelRow.className = 'lori-pill-bar__label-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'lori-pill-bar__label';
    labelEl.textContent = label;
    labelRow.appendChild(labelEl);

    const pctEl = document.createElement('span');
    pctEl.className = 'lori-pill-bar__pct tabnum';
    pctEl.textContent = `${Math.round(clamped)}%`;
    labelRow.appendChild(pctEl);

    container.appendChild(labelRow);
  }

  // 軌道
  const track = document.createElement('div');
  track.className = 'lori-pill-bar__track';
  track.style.height = `${height}px`;
  track.style.background = bg;
  track.style.borderRadius = `${height}px`;

  // 填色
  const fill = document.createElement('div');
  fill.className = 'lori-pill-bar__fill';
  fill.style.height = '100%';
  fill.style.width = `${clamped}%`;
  fill.style.background = color;
  fill.style.borderRadius = `${height}px`;

  track.appendChild(fill);
  container.appendChild(track);

  return container;
}

/**
 * 更新膠囊進度條
 * @param {HTMLElement} pillBarEl - createPillBar 回傳的元素
 * @param {number} percent - 新百分比 0~100
 */
export function updatePillBar(pillBarEl, percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fill = pillBarEl.querySelector('.lori-pill-bar__fill');
  if (fill) fill.style.width = `${clamped}%`;
  const pct = pillBarEl.querySelector('.lori-pill-bar__pct');
  if (pct) pct.textContent = `${Math.round(clamped)}%`;
}
