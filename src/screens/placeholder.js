// 小蘿日誌 — Placeholder 畫面
// Phase 2+ 尚未實作的畫面暫時顯示佔位

import { createStatusBar } from '../components/status-bar.js';
import { createTabBar, getActiveTab } from '../components/tab-bar.js';
import { createHeaderBar } from '../components/header-bar.js';

/**
 * 渲染佔位畫面
 * @param {HTMLElement} root
 * @param {string} title - 畫面標題
 * @param {object} opts
 * @param {boolean} opts.showTabBar - 是否顯示底部 tab
 * @param {boolean} opts.showBack - 是否顯示返回按鈕
 */
export function renderPlaceholder(root, title, { showTabBar = true, showBack = false } = {}) {
  root.className = 'lori';

  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  if (showBack) {
    const header = createHeaderBar({ title });
    root.appendChild(header);
  }

  const body = document.createElement('div');
  body.className = 'lori-scroll';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = showBack ? '106px' : '54px';
  body.style.paddingBottom = '100px';
  body.style.overflowY = 'auto';
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.alignItems = 'center';
  body.style.justifyContent = 'center';

  if (!showBack) {
    const pageTitle = document.createElement('div');
    pageTitle.style.fontSize = '26px';
    pageTitle.style.fontWeight = '700';
    pageTitle.style.letterSpacing = '-0.4px';
    pageTitle.style.marginBottom = '16px';
    pageTitle.textContent = title;
    body.appendChild(pageTitle);
  }

  const msg = document.createElement('div');
  msg.style.color = 'var(--gray)';
  msg.style.fontSize = '15px';
  msg.style.textAlign = 'center';
  msg.textContent = '施工中...小蘿正在搬磚 🐰';
  body.appendChild(msg);

  root.appendChild(body);

  if (showTabBar) {
    root.appendChild(createTabBar(getActiveTab()));
  }

  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}
