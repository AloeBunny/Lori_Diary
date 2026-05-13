// 小蘿日誌 — AddBar 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('AddBar — 模組匯出');

test('add-bar.js 可被匯入', async () => {
  try {
    const mod = await import('../components/add-bar.js');
    assert(typeof mod.createAddBar === 'function', 'createAddBar 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('AddBar — 參數介面');

test('createAddBar 預設參數不報錯', async () => {
  try {
    const { createAddBar } = await import('../components/add-bar.js');
    const el = createAddBar();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-add-bar'), '應有 lori-add-bar class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createAddBar 按鈕有正確文字', async () => {
  try {
    const { createAddBar } = await import('../components/add-bar.js');
    const el = createAddBar({ label: '新增待辦' });
    const btn = el.querySelector('.lori-add-bar__btn');
    assert(btn !== null, '應有按鈕元素');
    assert(btn.textContent.includes('新增待辦'), '按鈕文字應包含「新增待辦」');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createAddBar 按鈕有 Plus icon（SVG）', async () => {
  try {
    const { createAddBar } = await import('../components/add-bar.js');
    const el = createAddBar();
    const svg = el.querySelector('svg');
    assert(svg !== null, '應有 Plus SVG icon');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createAddBar onClick 回呼被觸發', async () => {
  try {
    const { createAddBar } = await import('../components/add-bar.js');
    let clicked = false;
    const el = createAddBar({
      label: '新增',
      onClick: () => { clicked = true; },
    });
    const btn = el.querySelector('.lori-add-bar__btn');
    btn.click();
    assertEqual(clicked, true, 'onClick 應被觸發');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createAddBar 有固定定位樣式（lori-add-bar class）', async () => {
  try {
    const { createAddBar } = await import('../components/add-bar.js');
    const el = createAddBar();
    assert(el.classList.contains('lori-add-bar'), '容器應有 lori-add-bar class（對應 CSS 固定定位）');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createAddBar color 套用到按鈕背景', async () => {
  try {
    const { createAddBar } = await import('../components/add-bar.js');
    const el = createAddBar({ color: 'var(--mint)' });
    const btn = el.querySelector('.lori-add-bar__btn');
    assertEqual(btn.style.background, 'var(--mint)', '按鈕背景色應為 var(--mint)');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
