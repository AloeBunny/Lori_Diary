// 小蘿日誌 — CheckCircle 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('CheckCircle — 模組匯出');

test('check-circle.js 可被匯入', async () => {
  try {
    const mod = await import('../components/check-circle.js');
    assert(typeof mod.createCheckCircle === 'function', 'createCheckCircle 應為函式');
    assert(typeof mod.setCheckCircle === 'function', 'setCheckCircle 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('CheckCircle — 參數介面');

test('createCheckCircle 預設參數不報錯', async () => {
  try {
    const { createCheckCircle } = await import('../components/check-circle.js');
    const el = createCheckCircle();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-check-circle'), '應有 lori-check-circle class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createCheckCircle 預設為未勾選狀態', async () => {
  try {
    const { createCheckCircle } = await import('../components/check-circle.js');
    const el = createCheckCircle();
    assertEqual(el._checked, false, '預設 _checked 應為 false');
    assertEqual(el.getAttribute('aria-checked'), 'false', 'aria-checked 應為 false');
    // 未勾選不應有 SVG
    const svg = el.querySelector('svg');
    assertEqual(svg, null, '未勾選時不應有打勾 SVG');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createCheckCircle checked=true 有打勾 SVG', async () => {
  try {
    const { createCheckCircle } = await import('../components/check-circle.js');
    const el = createCheckCircle({ checked: true });
    assertEqual(el._checked, true, '_checked 應為 true');
    const svg = el.querySelector('svg');
    assert(svg !== null, '已勾選時應有打勾 SVG');
    const path = svg.querySelector('path');
    assert(path !== null, '應有 path 元素');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createCheckCircle 有 role=checkbox', async () => {
  try {
    const { createCheckCircle } = await import('../components/check-circle.js');
    const el = createCheckCircle();
    assertEqual(el.getAttribute('role'), 'checkbox', '應有 role=checkbox');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('setCheckCircle 可外部切換狀態', async () => {
  try {
    const { createCheckCircle, setCheckCircle } = await import('../components/check-circle.js');
    const el = createCheckCircle({ checked: false });
    setCheckCircle(el, true);
    assertEqual(el._checked, true, '設定後 _checked 應為 true');
    assertEqual(el.getAttribute('aria-checked'), 'true', 'aria-checked 應為 true');
    assert(el.querySelector('svg') !== null, '應出現打勾 SVG');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createCheckCircle onToggle 在點擊時被呼叫', async () => {
  try {
    const { createCheckCircle } = await import('../components/check-circle.js');
    let callbackValue = null;
    const el = createCheckCircle({
      checked: false,
      onToggle: (v) => { callbackValue = v; },
    });
    el.click();
    assertEqual(callbackValue, true, 'onToggle 應收到 true');
    el.click();
    assertEqual(callbackValue, false, '再次點擊 onToggle 應收到 false');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
