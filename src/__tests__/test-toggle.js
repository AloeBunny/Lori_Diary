// 小蘿日誌 — Toggle 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('Toggle — 模組匯出');

test('toggle.js 可被匯入', async () => {
  try {
    const mod = await import('../components/toggle.js');
    assert(typeof mod.createToggle === 'function', 'createToggle 應為函式');
    assert(typeof mod.setToggle === 'function', 'setToggle 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('Toggle — 建構與結構');

test('預設參數不報錯', async () => {
  try {
    const { createToggle } = await import('../components/toggle.js');
    const el = createToggle();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-toggle'), '應有 lori-toggle class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('預設顯示有序和無序', async () => {
  try {
    const { createToggle } = await import('../components/toggle.js');
    const el = createToggle();
    const options = el.querySelectorAll('.lori-toggle__option');
    assertEqual(options.length, 2, '應有 2 個選項');
    assertEqual(options[0].textContent, '有序');
    assertEqual(options[1].textContent, '無序');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('自訂標籤', async () => {
  try {
    const { createToggle } = await import('../components/toggle.js');
    const el = createToggle({ labelOn: '開', labelOff: '關' });
    const options = el.querySelectorAll('.lori-toggle__option');
    assertEqual(options[0].textContent, '關', '左側應為 labelOff');
    assertEqual(options[1].textContent, '開', '右側應為 labelOn');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('checked=false 時左側 active', async () => {
  try {
    const { createToggle } = await import('../components/toggle.js');
    const el = createToggle({ checked: false });
    const options = el.querySelectorAll('.lori-toggle__option');
    assert(options[0].classList.contains('lori-toggle__option--active'), '左側應有 --active');
    assert(!options[1].classList.contains('lori-toggle__option--active'), '右側不應有 --active');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('checked=true 時右側 active', async () => {
  try {
    const { createToggle } = await import('../components/toggle.js');
    const el = createToggle({ checked: true });
    const options = el.querySelectorAll('.lori-toggle__option');
    assert(!options[0].classList.contains('lori-toggle__option--active'), '左側不應有 --active');
    assert(options[1].classList.contains('lori-toggle__option--active'), '右側應有 --active');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('role 和 aria-checked 正確', async () => {
  try {
    const { createToggle } = await import('../components/toggle.js');
    const el = createToggle({ checked: true });
    assertEqual(el.getAttribute('role'), 'switch');
    assertEqual(el.getAttribute('aria-checked'), 'true');
    assertEqual(el.tabIndex, 0);
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('點擊右側選項切換為 checked', async () => {
  try {
    const { createToggle } = await import('../components/toggle.js');
    let changed = null;
    const el = createToggle({
      checked: false,
      onChange: (v) => { changed = v; },
    });
    // 點擊右側
    const rightOpt = el.querySelector('[data-side="right"]');
    rightOpt.click();
    assert(el._checked === true, '應變為 checked');
    assertEqual(changed, true, 'onChange 應收到 true');
    assertEqual(el.getAttribute('aria-checked'), 'true');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('點擊左側選項切換為 unchecked', async () => {
  try {
    const { createToggle } = await import('../components/toggle.js');
    let changed = null;
    const el = createToggle({
      checked: true,
      onChange: (v) => { changed = v; },
    });
    // 點擊左側
    const leftOpt = el.querySelector('[data-side="left"]');
    leftOpt.click();
    assert(el._checked === false, '應變為 unchecked');
    assertEqual(changed, false, 'onChange 應收到 false');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('點擊同側不觸發 onChange', async () => {
  try {
    const { createToggle } = await import('../components/toggle.js');
    let callCount = 0;
    const el = createToggle({
      checked: false,
      onChange: () => { callCount++; },
    });
    // 點擊左側（已是 active 的那邊）
    const leftOpt = el.querySelector('[data-side="left"]');
    leftOpt.click();
    assertEqual(callCount, 0, '同側點擊不應觸發 onChange');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('setToggle 外部設定不觸發 callback', async () => {
  try {
    const { createToggle, setToggle } = await import('../components/toggle.js');
    let called = false;
    const el = createToggle({
      checked: false,
      onChange: () => { called = true; },
    });
    setToggle(el, true);
    assert(el._checked === true, '外部設定後應為 checked');
    assert(!called, 'setToggle 不應觸發 onChange');
    assertEqual(el.getAttribute('aria-checked'), 'true');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
