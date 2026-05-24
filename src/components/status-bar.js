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
  // iOS 原生狀態列已提供時間/訊號/電池，不需要假狀態列
  const placeholder = document.createElement('div');
  return placeholder;
}

function _updateTime(el) {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${h}:${m}`;
}
