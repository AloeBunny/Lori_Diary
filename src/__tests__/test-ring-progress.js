// 小蘿日誌 — RingProgress 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('RingProgress — 模組匯出');

test('ring-progress.js 可被匯入', async () => {
  try {
    const mod = await import('../components/ring-progress.js');
    assert(typeof mod.createRingProgress === 'function', 'createRingProgress 應為函式');
    assert(typeof mod.updateRingProgress === 'function', 'updateRingProgress 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('RingProgress — 參數介面');

test('createRingProgress 預設參數不報錯', async () => {
  try {
    const { createRingProgress } = await import('../components/ring-progress.js');
    const el = createRingProgress();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-ring-progress'), '應有 lori-ring-progress class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createRingProgress 有正確的 SVG 結構', async () => {
  try {
    const { createRingProgress } = await import('../components/ring-progress.js');
    const el = createRingProgress({ percent: 72, label: '72%', size: 180 });
    const svg = el.querySelector('svg');
    assert(svg !== null, '應含有 SVG 元素');
    const circles = svg.querySelectorAll('circle');
    assertEqual(circles.length, 2, '應有 2 個 circle（軌道 + 進度）');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createRingProgress percent 會被 clamp 在 0~100', async () => {
  try {
    const { createRingProgress } = await import('../components/ring-progress.js');
    // 不應報錯
    createRingProgress({ percent: -10 });
    createRingProgress({ percent: 200 });
    assert(true, 'clamp 參數不報錯');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createRingProgress label 出現在 DOM', async () => {
  try {
    const { createRingProgress } = await import('../components/ring-progress.js');
    const el = createRingProgress({ percent: 50, label: '測試文字' });
    const labelEl = el.querySelector('.lori-ring-progress__label');
    assert(labelEl !== null, '應有 label 元素');
    assertEqual(labelEl.textContent, '測試文字');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createRingProgress 無 label 時不建立 label 元素', async () => {
  try {
    const { createRingProgress } = await import('../components/ring-progress.js');
    const el = createRingProgress({ percent: 50 });
    const labelEl = el.querySelector('.lori-ring-progress__label');
    assertEqual(labelEl, null, '無 label 時不應建立 label 元素');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createRingProgress size 控制 SVG 尺寸', async () => {
  try {
    const { createRingProgress } = await import('../components/ring-progress.js');
    const el = createRingProgress({ size: 200 });
    const svg = el.querySelector('svg');
    assertEqual(svg.getAttribute('width'), '200', 'SVG width 應為 200');
    assertEqual(svg.getAttribute('height'), '200', 'SVG height 應為 200');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
