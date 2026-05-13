// 小蘿日誌 — AddBar 浮動新增按鈕元件
// 固定在底部 TabBar 上方

import { iconPlus } from './icons.js';

/**
 * 建立浮動新增按鈕
 * @param {object} opts
 * @param {string} opts.label - 按鈕文字（如「新增待辦」）
 * @param {function|null} opts.onClick - 點擊回呼
 * @param {string} opts.color - 按鈕背景色
 * @returns {HTMLElement}
 */
export function createAddBar({
  label = '新增',
  onClick = null,
  color = 'var(--violet)',
} = {}) {
  const container = document.createElement('div');
  container.className = 'lori-add-bar';

  const btn = document.createElement('button');
  btn.className = 'lori-btn lori-add-bar__btn';
  btn.style.background = color;
  btn.style.color = '#fff';
  btn.style.borderColor = 'transparent';

  // Plus icon
  const plusIcon = iconPlus(18);
  btn.appendChild(plusIcon);

  // 空格 + 文字
  const labelText = document.createElement('span');
  labelText.textContent = label;
  btn.appendChild(labelText);

  if (onClick) {
    btn.addEventListener('click', onClick);
  }

  container.appendChild(btn);

  return container;
}
