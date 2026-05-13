// 小蘿日誌 — 小蘿自訂頁面測試
// 測試 export 的常數和函式簽名

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('lori-customize — 模組 export');

test('renderLoriCustomize 被 export', async () => {
  const mod = await import('../screens/lori-customize.js');
  assert(typeof mod.renderLoriCustomize === 'function', 'renderLoriCustomize 應被 export');
});

test('KEY_NICKNAME 被 export 且為字串', async () => {
  const mod = await import('../screens/lori-customize.js');
  assert(typeof mod.KEY_NICKNAME === 'string', 'KEY_NICKNAME 應為字串');
  assertEqual(mod.KEY_NICKNAME, 'lori_nickname');
});

test('KEY_ENCOURAGE_FREQ 被 export 且為字串', async () => {
  const mod = await import('../screens/lori-customize.js');
  assert(typeof mod.KEY_ENCOURAGE_FREQ === 'string', 'KEY_ENCOURAGE_FREQ 應為字串');
  assertEqual(mod.KEY_ENCOURAGE_FREQ, 'lori_encourage_freq');
});

test('KEY_SELECTED_FACE 被 export 且為字串', async () => {
  const mod = await import('../screens/lori-customize.js');
  assert(typeof mod.KEY_SELECTED_FACE === 'string', 'KEY_SELECTED_FACE 應為字串');
  assertEqual(mod.KEY_SELECTED_FACE, 'lori_selected_face');
});

suite('lori-customize — DOM 渲染');

test('renderLoriCustomize 建立 header 和內容', async () => {
  try {
    const mod = await import('../screens/lori-customize.js');

    // 建立模擬 root element
    const root = document.createElement('div');

    // 呼叫渲染
    const cleanup = mod.renderLoriCustomize(root);

    // 驗證基本結構
    assert(root.className === 'lori', 'root 應設為 lori class');
    assert(root.children.length >= 3, '至少應有 statusBar + headerBar + body');

    // 驗證 HeaderBar 標題
    const headerTitle = root.querySelector('.header-bar__title');
    assert(headerTitle !== null, '應有 header-bar__title');
    assertEqual(headerTitle.textContent, '小蘿自訂');

    // 驗證儲存按鈕
    const saveBtn = root.querySelector('.header-bar__action');
    assert(saveBtn !== null, '應有儲存按鈕');
    assertEqual(saveBtn.textContent, '儲存');

    // 驗證表情池
    const faceGrid = root.querySelector('.lori-customize__face-grid');
    assert(faceGrid !== null, '應有表情池 grid');
    // 隨機 + 5 個表情 = 至少 6 個 card
    const faceCards = faceGrid.querySelectorAll('.lori-customize__face-card');
    assert(faceCards.length >= 6, `至少 6 個表情卡，得到 ${faceCards.length}`);

    // 驗證暱稱輸入
    const nickInput = root.querySelector('.lori-customize__nick-input');
    assert(nickInput !== null, '應有暱稱輸入框');
    assertEqual(nickInput.type, 'text');
    assertEqual(nickInput.placeholder, '小蘿');

    // 驗證頻率按鈕
    const freqBtns = root.querySelectorAll('.lori-customize__freq-btn');
    assertEqual(freqBtns.length, 3, '應有 3 個頻率按鈕');

    // cleanup
    if (typeof cleanup === 'function') cleanup();
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
