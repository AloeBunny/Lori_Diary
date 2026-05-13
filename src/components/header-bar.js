// 小蘿日誌 — 頁面標題列元件
// 返回箭頭 + 標題 + 右側按鈕

import { iconChevL } from './icons.js';
import { goBack } from '../router.js';

/**
 * 建立頁面標題列
 * @param {object} opts
 * @param {string} opts.title - 頁面標題
 * @param {boolean} opts.showBack - 是否顯示返回按鈕
 * @param {string|null} opts.rightLabel - 右側按鈕文字（null = 不顯示）
 * @param {function|null} opts.onRight - 右側按鈕回調
 * @param {function|null} opts.onBack - 自訂返回行為（預設 history.back）
 * @returns {HTMLElement}
 */
export function createHeaderBar({
  title = '',
  showBack = true,
  rightLabel = null,
  onRight = null,
  onBack = null,
} = {}) {
  const bar = document.createElement('div');
  bar.className = 'header-bar';

  // 左側區域
  const left = document.createElement('div');
  left.className = 'header-bar__left';
  if (showBack) {
    const backBtn = document.createElement('button');
    backBtn.className = 'header-bar__back';
    backBtn.setAttribute('aria-label', '返回');
    backBtn.appendChild(iconChevL(22));
    backBtn.addEventListener('click', () => {
      if (onBack) {
        onBack();
      } else {
        goBack();
      }
    });
    left.appendChild(backBtn);
  }
  bar.appendChild(left);

  // 中間標題
  const titleEl = document.createElement('div');
  titleEl.className = 'header-bar__title';
  titleEl.textContent = title;
  bar.appendChild(titleEl);

  // 右側區域
  const right = document.createElement('div');
  right.className = 'header-bar__right';
  if (rightLabel) {
    const rightBtn = document.createElement('button');
    rightBtn.className = 'header-bar__action';
    rightBtn.textContent = rightLabel;
    if (onRight) {
      rightBtn.addEventListener('click', onRight);
    }
    right.appendChild(rightBtn);
  }
  bar.appendChild(right);

  return bar;
}
