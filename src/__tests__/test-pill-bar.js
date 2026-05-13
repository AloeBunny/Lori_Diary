// 小蘿日誌 — PillBar 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('PillBar — 模組匯出');

test('pill-bar.js 可被匯入', async () => {
  try {
    const mod = await import('../components/pill-bar.js');
    assert(typeof mod.createPillBar === 'function', 'createPillBar 應為函式');
    assert(typeof mod.updatePillBar === 'function', 'updatePillBar 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('PillBar — 參數介面');

test('createPillBar 預設參數不報錯', async () => {
  try {
    const { createPillBar } = await import('../components/pill-bar.js');
    const el = createPillBar();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-pill-bar'), '應有 lori-pill-bar class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createPillBar fill 寬度對應 percent', async () => {
  try {
    const { createPillBar } = await import('../components/pill-bar.js');
    const el = createPillBar({ percent: 65 });
    const fill = el.querySelector('.lori-pill-bar__fill');
    assert(fill !== null, '應有 fill 元素');
    assertEqual(fill.style.width, '65%', '填色寬度應為 65%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createPillBar percent 會被 clamp 在 0~100', async () => {
  try {
    const { createPillBar } = await import('../components/pill-bar.js');
    const el1 = createPillBar({ percent: -20 });
    assertEqual(el1.querySelector('.lori-pill-bar__fill').style.width, '0%', '負值應 clamp 為 0%');

    const el2 = createPillBar({ percent: 150 });
    assertEqual(el2.querySelector('.lori-pill-bar__fill').style.width, '100%', '超過 100 應 clamp 為 100%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createPillBar 有 label 時顯示 label 和百分比', async () => {
  try {
    const { createPillBar } = await import('../components/pill-bar.js');
    const el = createPillBar({ percent: 42, label: '待辦事項' });
    const labelEl = el.querySelector('.lori-pill-bar__label');
    assert(labelEl !== null, '應有 label 元素');
    assertEqual(labelEl.textContent, '待辦事項');
    const pctEl = el.querySelector('.lori-pill-bar__pct');
    assert(pctEl !== null, '應有百分比元素');
    assertEqual(pctEl.textContent, '42%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createPillBar 無 label 時不建立 label row', async () => {
  try {
    const { createPillBar } = await import('../components/pill-bar.js');
    const el = createPillBar({ percent: 50 });
    const labelRow = el.querySelector('.lori-pill-bar__label-row');
    assertEqual(labelRow, null, '無 label 時不應建立 label row');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createPillBar color 套用到 fill 元素', async () => {
  try {
    const { createPillBar } = await import('../components/pill-bar.js');
    const el = createPillBar({ percent: 50, color: 'var(--violet)' });
    const fill = el.querySelector('.lori-pill-bar__fill');
    assertEqual(fill.style.background, 'var(--violet)', '填色應為指定顏色');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('updatePillBar 更新 fill 寬度', async () => {
  try {
    const { createPillBar, updatePillBar } = await import('../components/pill-bar.js');
    const el = createPillBar({ percent: 30, label: '進度' });
    updatePillBar(el, 80);
    const fill = el.querySelector('.lori-pill-bar__fill');
    assertEqual(fill.style.width, '80%', '更新後寬度應為 80%');
    const pct = el.querySelector('.lori-pill-bar__pct');
    assertEqual(pct.textContent, '80%', '更新後百分比文字應為 80%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
