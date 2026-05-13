// 小蘿日誌 — CheckCircle 圓形 checkbox 元件
// 未勾=空心圓，已勾=實心圓+打勾 SVG（scale bounce 動畫）

/**
 * 建立圓形 checkbox
 * @param {object} opts
 * @param {boolean} opts.checked - 是否已勾選
 * @param {function|null} opts.onToggle - 點擊切換回呼
 * @param {string} opts.color - 勾選時的填色（CSS 值）
 * @returns {HTMLElement}
 */
export function createCheckCircle({
  checked = false,
  onToggle = null,
  color = 'var(--mint)',
} = {}) {
  const el = document.createElement('div');
  el.className = 'lori-check-circle';
  el.setAttribute('role', 'checkbox');
  el.setAttribute('aria-checked', String(checked));
  el.tabIndex = 0;

  // 儲存狀態供外部讀取
  el._checked = checked;
  el._color = color;

  // 渲染初始狀態
  _render(el);

  // 點擊切換
  el.addEventListener('click', () => {
    el._checked = !el._checked;
    el.setAttribute('aria-checked', String(el._checked));
    _render(el);
    if (el._checked) {
      el.classList.add('lori-check-circle--bounce');
      el.addEventListener('animationend', () => {
        el.classList.remove('lori-check-circle--bounce');
      }, { once: true });
    }
    if (onToggle) onToggle(el._checked);
  });

  return el;
}

/**
 * 內部渲染函式
 */
function _render(el) {
  // 清空
  while (el.firstChild) el.removeChild(el.firstChild);

  if (el._checked) {
    el.style.background = el._color;
    el.style.borderColor = 'transparent';
    // 打勾 SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('stroke', '#2a4a3a');
    svg.setAttribute('stroke-width', '3');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M4 12l5 5L20 6');
    svg.appendChild(path);
    el.appendChild(svg);
  } else {
    el.style.background = 'transparent';
    el.style.borderColor = 'var(--gray)';
  }
}

/**
 * 外部設定 checked 狀態（不觸發 callback）
 * @param {HTMLElement} el - createCheckCircle 回傳的元素
 * @param {boolean} checked
 */
export function setCheckCircle(el, checked) {
  el._checked = checked;
  el.setAttribute('aria-checked', String(checked));
  _render(el);
}
