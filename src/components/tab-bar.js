// 小蘿日誌 — 底部 Tab Bar 元件
// 四 tab：儀表板/一般/Routine/學習 + active 狀態 + blur 背景

import { iconDash, iconToday, iconTimer, iconBook } from './icons.js';
import { navigate, currentHash } from '../router.js';

const TABS = [
  { key: 'dash',  label: '儀表板',  icon: iconDash,  hash: '#/dashboard' },
  { key: 'todo',  label: '一般',    icon: iconToday, hash: '#/todo' },
  { key: 'rt',    label: 'Routine', icon: iconTimer, hash: '#/routine' },
  { key: 'lrn',   label: '學習',    icon: iconBook,  hash: '#/learning' },
];

/**
 * 建立底部 Tab Bar
 * @param {string} activeKey - 當前 active tab key
 * @returns {HTMLElement}
 */
export function createTabBar(activeKey = 'dash') {
  const bar = document.createElement('nav');
  bar.className = 'tab-bar';

  TABS.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'tab-bar__item';
    const isActive = t.key === activeKey;
    if (isActive) btn.classList.add('tab-bar__item--active');
    btn.setAttribute('aria-label', t.label);

    // icon
    const iconEl = t.icon(24);
    iconEl.style.strokeWidth = isActive ? '1.9' : '1.5';
    btn.appendChild(iconEl);

    // label
    const label = document.createElement('span');
    label.className = 'tab-bar__label';
    label.textContent = t.label;
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      navigate(t.hash);
    });

    bar.appendChild(btn);
  });

  return bar;
}

/**
 * 根據當前 hash 推斷 active tab key
 */
export function getActiveTab() {
  const hash = currentHash();
  if (hash.startsWith('#/dashboard') || hash === '#/') return 'dash';
  if (hash.startsWith('#/todo')) return 'todo';
  if (hash.startsWith('#/routine')) return 'rt';
  if (hash.startsWith('#/learning')) return 'lrn';
  return 'dash';
}
