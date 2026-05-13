// 小蘿日誌 — 月曆元件
// 可左右切月份、當日高亮（紫圈）、有紀錄日期用熱力圖色標記

import { HEAT_HUES, pseudo } from '../utils/helpers.js';

/**
 * 取得某天在熱力圖的色碼（有紀錄時用）
 * @param {number} seed - pseudo seed
 * @param {number} percent - 完成度 0~100
 * @returns {string}
 */
function calendarDayColor(seed, percent) {
  if (percent <= 0) return 'transparent';

  const hueIdx = Math.floor(pseudo(seed) * HEAT_HUES.length);
  const hue = HEAT_HUES[hueIdx];

  let level;
  if (percent <= 25) level = 1;
  else if (percent <= 50) level = 2;
  else if (percent <= 75) level = 3;
  else level = 4;

  return hue[level];
}

/**
 * 取得某月天數
 */
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 取得某月 1 號是星期幾（0=日, 1=一, ...）
 */
function firstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * 清空元素的所有子節點（安全替代 innerHTML = ''）
 */
function clearChildren(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/**
 * 建立月曆元件
 * @param {object} opts
 * @param {Array<{date: string, percent: number}>} opts.records - 紀錄陣列
 * @param {function|null} opts.onSelect - 點擊日期回呼 onSelect(dateStr)
 * @returns {HTMLElement}
 */
export function createMiniCalendar({
  records = [],
  onSelect = null,
} = {}) {
  const today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth(); // 0-based

  // records lookup
  const recordMap = new Map();
  records.forEach(r => recordMap.set(r.date, r.percent));

  // 外層卡片容器
  const card = document.createElement('div');
  card.className = 'lori-mini-calendar lori-card';

  /**
   * 渲染月曆內容
   */
  function render() {
    clearChildren(card);

    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const total = daysInMonth(currentYear, currentMonth);
    const startWd = firstDayOfWeek(currentYear, currentMonth);

    // 標頭列：年月 + 左右箭頭
    const header = document.createElement('div');
    header.className = 'lori-mini-calendar__header';

    const titleEl = document.createElement('div');
    titleEl.className = 'lori-mini-calendar__title';
    titleEl.textContent = `${currentYear} · ${monthNames[currentMonth]}`;
    header.appendChild(titleEl);

    const navGroup = document.createElement('div');
    navGroup.className = 'lori-mini-calendar__nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'lori-mini-calendar__nav-btn';
    prevBtn.setAttribute('aria-label', '上個月');
    prevBtn.textContent = '‹';
    prevBtn.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      render();
    });
    navGroup.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'lori-mini-calendar__nav-btn';
    nextBtn.setAttribute('aria-label', '下個月');
    nextBtn.textContent = '›';
    nextBtn.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      render();
    });
    navGroup.appendChild(nextBtn);

    header.appendChild(navGroup);
    card.appendChild(header);

    // 星期標頭
    const weekRow = document.createElement('div');
    weekRow.className = 'lori-mini-calendar__week-row';
    weekDays.forEach(d => {
      const cell = document.createElement('div');
      cell.className = 'lori-mini-calendar__week-label';
      cell.textContent = d;
      weekRow.appendChild(cell);
    });
    card.appendChild(weekRow);

    // 日期格子
    const grid = document.createElement('div');
    grid.className = 'lori-mini-calendar__grid';

    // 填入空白佔位
    for (let i = 0; i < startWd; i++) {
      const empty = document.createElement('div');
      empty.className = 'lori-mini-calendar__empty';
      grid.appendChild(empty);
    }

    // 填入日期
    for (let d = 1; d <= total; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = (
        d === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()
      );
      const pct = recordMap.has(dateStr) ? recordMap.get(dateStr) : 0;
      const seed = currentMonth * 31 + d;
      const bgColor = pct > 0 ? calendarDayColor(seed, pct) : 'transparent';

      const cell = document.createElement('div');
      cell.className = 'lori-mini-calendar__day';
      if (isToday) cell.classList.add('lori-mini-calendar__day--today');
      cell.style.background = bgColor;
      cell.textContent = String(d);
      cell.dataset.date = dateStr;

      if (onSelect) {
        cell.addEventListener('click', () => onSelect(dateStr));
      }

      grid.appendChild(cell);
    }

    // 補齊最後一行
    const totalCells = startWd + total;
    const remainder = totalCells % 7;
    if (remainder > 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        const empty = document.createElement('div');
        empty.className = 'lori-mini-calendar__empty';
        grid.appendChild(empty);
      }
    }

    card.appendChild(grid);
  }

  render();
  return card;
}

// 匯出給測試用
export { calendarDayColor, daysInMonth, firstDayOfWeek };
