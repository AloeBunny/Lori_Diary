// 小蘿日誌 — 日期切換列元件
// 左右箭頭 + 日期 + 進度填色 + 列表按鈕

import { iconChevL, iconChev, iconList } from './icons.js';

/**
 * 格式化日期為顯示文字
 * @param {Date} date
 * @param {boolean} isToday
 * @returns {string}
 */
function formatDateLabel(date, isToday) {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = weekDays[date.getDay()];
  if (isToday) {
    return `今日 · ${m}月 ${d} (${w})`;
  }
  return `${m}月 ${d} (${w})`;
}

/**
 * 建立日期切換列
 * @param {object} opts
 * @param {Date} opts.date - 當前日期
 * @param {number} opts.progress - 完成度 0~1
 * @param {boolean} opts.isToday - 是否為今天
 * @param {function} opts.onPrev - 點上一天
 * @param {function} opts.onNext - 點下一天
 * @param {function|null} opts.onList - 點列表按鈕
 * @returns {HTMLElement}
 */
export function createDateBar({
  date = new Date(),
  progress = 0,
  isToday = true,
  onPrev = null,
  onNext = null,
  onList = null,
} = {}) {
  const container = document.createElement('div');
  container.className = 'date-bar';

  // 進度填色背景
  const fill = document.createElement('div');
  fill.className = 'date-bar__fill';
  fill.style.width = `${Math.round(progress * 100)}%`;
  container.appendChild(fill);

  // 內容層
  const content = document.createElement('div');
  content.className = 'date-bar__content';

  // 左箭頭
  const prevBtn = document.createElement('button');
  prevBtn.className = 'date-bar__btn';
  prevBtn.setAttribute('aria-label', '前一天');
  prevBtn.appendChild(iconChevL(18));
  if (onPrev) prevBtn.addEventListener('click', onPrev);
  content.appendChild(prevBtn);

  // 中間：日期 + 完成度
  const center = document.createElement('div');
  center.className = 'date-bar__center';

  const dateLabel = document.createElement('div');
  dateLabel.className = 'date-bar__label';
  dateLabel.textContent = formatDateLabel(date, isToday);
  center.appendChild(dateLabel);

  const pctLabel = document.createElement('div');
  pctLabel.className = 'date-bar__pct';
  pctLabel.textContent = `完成度 ${Math.round(progress * 100)}%`;
  center.appendChild(pctLabel);

  content.appendChild(center);

  // 右按鈕（今天 = 列表，其他 = 右箭頭）
  const rightBtn = document.createElement('button');
  rightBtn.className = 'date-bar__btn';
  if (isToday) {
    rightBtn.setAttribute('aria-label', '列表');
    rightBtn.appendChild(iconList(18));
    if (onList) rightBtn.addEventListener('click', onList);
  } else {
    rightBtn.setAttribute('aria-label', '下一天');
    rightBtn.appendChild(iconChev(18));
    if (onNext) rightBtn.addEventListener('click', onNext);
  }
  content.appendChild(rightBtn);

  container.appendChild(content);

  return container;
}

/**
 * 更新 DateBar 進度
 */
export function updateDateBarProgress(dateBarEl, progress) {
  const fill = dateBarEl.querySelector('.date-bar__fill');
  if (fill) fill.style.width = `${Math.round(progress * 100)}%`;
  const pct = dateBarEl.querySelector('.date-bar__pct');
  if (pct) pct.textContent = `完成度 ${Math.round(progress * 100)}%`;
}
