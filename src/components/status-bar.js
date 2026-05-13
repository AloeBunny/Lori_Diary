// 小蘿日誌 — 狀態列元件
// 模擬 iPhone 狀態列（時間 + 訊號 + 電池 SVG）

import { iconSignal, iconBattery } from './icons.js';

/**
 * 建立狀態列
 * @param {object} opts
 * @param {boolean} opts.dark - 深色模式（白色文字）
 * @returns {HTMLElement}
 */
export function createStatusBar({ dark = false } = {}) {
  const color = dark ? '#fff' : '#000';

  const bar = document.createElement('div');
  bar.className = 'status-bar';
  if (dark) bar.classList.add('status-bar--dark');

  // 左側：時間
  const timeSpan = document.createElement('span');
  timeSpan.className = 'status-bar__time';
  timeSpan.style.color = color;
  _updateTime(timeSpan);

  // 中間：動態島（Dynamic Island）
  const island = document.createElement('div');
  island.className = 'status-bar__island';

  // 右側：訊號 + 電池
  const rightGroup = document.createElement('div');
  rightGroup.className = 'status-bar__right';
  rightGroup.appendChild(iconSignal(color));
  rightGroup.appendChild(iconBattery(color));

  bar.appendChild(timeSpan);
  bar.appendChild(island);
  bar.appendChild(rightGroup);

  // 每分鐘更新時間
  const timer = setInterval(() => _updateTime(timeSpan), 60000);

  // 回傳 cleanup
  bar._cleanup = () => clearInterval(timer);

  return bar;
}

function _updateTime(el) {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${h}:${m}`;
}
