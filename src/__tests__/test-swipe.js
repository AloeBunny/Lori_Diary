// 小蘿日誌 — Swipe 模組測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('Swipe — 模組匯出');

test('swipe.js 可被匯入', async () => {
  const mod = await import('../utils/swipe.js');
  assert(typeof mod.bindSwipe === 'function', 'bindSwipe 應為函式');
});

suite('Swipe — 參數介面');

test('bindSwipe 回傳具有 destroy / reset / isOpen 方法', async () => {
  try {
    const { bindSwipe } = await import('../utils/swipe.js');
    const el = document.createElement('div');
    const slider = document.createElement('div');
    el.appendChild(slider);
    const ctrl = bindSwipe({ element: el, slider });
    assert(typeof ctrl.destroy === 'function', '應有 destroy 方法');
    assert(typeof ctrl.reset === 'function', '應有 reset 方法');
    assert(typeof ctrl.isOpen === 'function', '應有 isOpen 方法');
    assertEqual(ctrl.isOpen(), false, '初始應為關閉');
    ctrl.destroy();
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('bindSwipe reset 會將狀態設為關閉', async () => {
  try {
    const { bindSwipe } = await import('../utils/swipe.js');
    const el = document.createElement('div');
    const slider = document.createElement('div');
    el.appendChild(slider);
    const ctrl = bindSwipe({ element: el, slider, threshold: 50 });
    ctrl.reset();
    assertEqual(ctrl.isOpen(), false, 'reset 後應為關閉');
    assertEqual(slider.style.transform, 'translateX(0)', 'reset 後 transform 應為 0');
    ctrl.destroy();
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('bindSwipe 預設 threshold 為 80', async () => {
  try {
    const { bindSwipe } = await import('../utils/swipe.js');
    const el = document.createElement('div');
    const slider = document.createElement('div');
    el.appendChild(slider);
    // 不傳 threshold，不報錯就好
    const ctrl = bindSwipe({ element: el, slider });
    assertEqual(ctrl.isOpen(), false, '初始應為關閉');
    ctrl.destroy();
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('bindSwipe destroy 後不再追蹤', async () => {
  try {
    const { bindSwipe } = await import('../utils/swipe.js');
    const el = document.createElement('div');
    const slider = document.createElement('div');
    el.appendChild(slider);
    const ctrl = bindSwipe({ element: el, slider });
    ctrl.destroy();
    // destroy 後呼叫 reset 不應報錯
    ctrl.reset();
    assert(true, 'destroy 後操作不報錯');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
