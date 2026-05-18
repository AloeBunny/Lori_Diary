// 小蘿日誌 — 封面頁（Screen 1000）
// ASCII 兔子（隨機表情） + 暗色背景 + START 按鈕

import { createStatusBar } from '../components/status-bar.js';
import { randomLoriFace, LORI_FACES, silentCatch } from '../utils/helpers.js';
import { navigate } from '../router.js';
import { getSetting } from '../db.js';

/**
 * 渲染封面頁到容器
 * @param {HTMLElement} root
 * @returns {function} cleanup
 */
export function renderCover(root) {
  root.className = 'lori';
  root.style.background = 'var(--ink)';

  // 狀態列
  const statusBar = createStatusBar({ dark: true });
  root.appendChild(statusBar);

  // 主內容區
  const main = document.createElement('div');
  main.className = 'cover';

  // ASCII 兔子（尊重小蘿自訂設定）
  const ascii = document.createElement('pre');
  ascii.className = 'ascii cover__bunny';
  ascii.textContent = randomLoriFace(); // 先顯示隨機，再非同步覆寫
  main.appendChild(ascii);

  // 非同步載入使用者選定的表情
  getSetting('lori_selected_face', -1).then(faceIdx => {
    if (faceIdx >= 0 && faceIdx < LORI_FACES.length) {
      ascii.textContent = LORI_FACES[faceIdx];
    }
    // -1 = 隨機，已在上方設好，不需覆寫
  }).catch((e) => { silentCatch(e, 'cover face setting load'); });

  // App 標題
  const title = document.createElement('div');
  title.className = 'cover__title';
  title.textContent = '\u{1F955} 小蘿日誌 \u{1F955}';
  main.appendChild(title);

  // 副標題
  const subtitle = document.createElement('div');
  subtitle.className = 'cover__subtitle';
  subtitle.textContent = 'Lori Diary';
  main.appendChild(subtitle);

  root.appendChild(main);

  // 底部區域
  const bottom = document.createElement('div');
  bottom.className = 'cover__bottom';

  // START 按鈕
  const startBtn = document.createElement('button');
  startBtn.className = 'lori-btn lori-btn-primary cover__start';
  startBtn.textContent = 'START';
  startBtn.addEventListener('click', () => {
    navigate('#/dashboard');
  });
  bottom.appendChild(startBtn);

  // 版本資訊
  const ver = document.createElement('div');
  ver.className = 'cover__version';
  ver.textContent = 'v0.2 · 給知晞';
  bottom.appendChild(ver);

  root.appendChild(bottom);

  // cleanup
  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.style.background = '';
    root.className = '';
  };
}
