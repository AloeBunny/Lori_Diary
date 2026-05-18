// 小蘿日誌 — BlockCard 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('BlockCard — 模組匯出');

test('block-card.js 可被匯入', async () => {
  try {
    const mod = await import('../components/block-card.js');
    assert(typeof mod.createBlockCard === 'function', 'createBlockCard 應為函式');
    assert(typeof mod.updateBlockCard === 'function', 'updateBlockCard 應為函式');
    assert(typeof mod._formatHHMM === 'function', '_formatHHMM 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('BlockCard — _formatHHMM');

test('_formatHHMM 正常格式化', async () => {
  try {
    const { _formatHHMM } = await import('../components/block-card.js');
    assertEqual(_formatHHMM('0530'), '05:30');
    assertEqual(_formatHHMM('1800'), '18:00');
    assertEqual(_formatHHMM('2230'), '22:30');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('_formatHHMM 空值回傳空字串', async () => {
  try {
    const { _formatHHMM } = await import('../components/block-card.js');
    assertEqual(_formatHHMM(''), '');
    assertEqual(_formatHHMM(null), '');
    assertEqual(_formatHHMM(undefined), '');
    assertEqual(_formatHHMM('12'), '');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

suite('BlockCard — 參數介面');

test('createBlockCard 預設參數不報錯', async () => {
  try {
    const { createBlockCard } = await import('../components/block-card.js');
    const el = createBlockCard();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-block-card-wrap'), '應有 lori-block-card-wrap class');
    assert(el.querySelector('.lori-block-card') !== null, '應有 lori-block-card 子元素');
    assert(el.querySelector('.lori-card') !== null, '應有 lori-card 子元素');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createBlockCard 顯示 Block 名稱', async () => {
  try {
    const { createBlockCard } = await import('../components/block-card.js');
    const el = createBlockCard({
      block: { b_index: 1, b_name: '晨間 Routine', b_rise: '0500', b_set: '0730' },
    });
    const nameEl = el.querySelector('.lori-block-card__name');
    assert(nameEl !== null, '應有名稱元素');
    assertEqual(nameEl.textContent, '晨間 Routine');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createBlockCard 百分比顯示正確', async () => {
  try {
    const { createBlockCard } = await import('../components/block-card.js');
    const el = createBlockCard({ completionPercent: 73 });
    const pctEl = el.querySelector('.lori-block-card__pct');
    assert(pctEl !== null, '應有百分比元素');
    assertEqual(pctEl.textContent, '73%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createBlockCard 100% 時百分比顯示綠色', async () => {
  try {
    const { createBlockCard } = await import('../components/block-card.js');
    const el = createBlockCard({ completionPercent: 100 });
    const pctEl = el.querySelector('.lori-block-card__pct');
    assertEqual(pctEl.style.color, 'var(--green)', '100% 應為綠色');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createBlockCard 百分比 clamp 在 0~100', async () => {
  try {
    const { createBlockCard } = await import('../components/block-card.js');
    const el1 = createBlockCard({ completionPercent: -10 });
    assertEqual(el1.querySelector('.lori-block-card__pct').textContent, '0%');

    const el2 = createBlockCard({ completionPercent: 150 });
    assertEqual(el2.querySelector('.lori-block-card__pct').textContent, '100%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createBlockCard 顯示時間範圍', async () => {
  try {
    const { createBlockCard } = await import('../components/block-card.js');
    const el = createBlockCard({
      block: { b_index: 1, b_name: '晨間', b_rise: '0500', b_set: '0730' },
      stepCount: 10,
    });
    const info = el.querySelector('.lori-block-card__info');
    assert(info.textContent.includes('05:00~07:30'), '應顯示時間範圍');
    assert(info.textContent.includes('10 step'), '應顯示 step 數');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createBlockCard active 狀態有 active class', async () => {
  try {
    const { createBlockCard } = await import('../components/block-card.js');
    const el = createBlockCard({ active: true });
    assert(el.querySelector('.lori-block-card--active') !== null, '應有 --active class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createBlockCard 有 data-block-index', async () => {
  try {
    const { createBlockCard } = await import('../components/block-card.js');
    const el = createBlockCard({
      block: { b_index: 3, b_name: '午後', b_rise: '1300', b_set: '1530' },
    });
    assertEqual(el.dataset.blockIndex, '3', 'data-block-index 應為 3');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createBlockCard 有 PillBar', async () => {
  try {
    const { createBlockCard } = await import('../components/block-card.js');
    const el = createBlockCard({ completionPercent: 50 });
    const pillBar = el.querySelector('.lori-pill-bar');
    assert(pillBar !== null, '應有 PillBar 元素');
    const fill = pillBar.querySelector('.lori-pill-bar__fill');
    assertEqual(fill.style.width, '50%', 'PillBar fill 應為 50%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createBlockCard 有左側色條', async () => {
  try {
    const { createBlockCard } = await import('../components/block-card.js');
    const el = createBlockCard({ color: 'var(--violet)' });
    const stripe = el.querySelector('.lori-block-card__stripe');
    assert(stripe !== null, '應有色條元素');
    assertEqual(stripe.style.background, 'var(--violet)', '色條顏色應正確');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('updateBlockCard 更新百分比', async () => {
  try {
    const { createBlockCard, updateBlockCard } = await import('../components/block-card.js');
    const el = createBlockCard({ completionPercent: 30 });
    updateBlockCard(el, 80);
    const pctEl = el.querySelector('.lori-block-card__pct');
    assertEqual(pctEl.textContent, '80%', '更新後百分比應為 80%');
    const fill = el.querySelector('.lori-pill-bar__fill');
    assertEqual(fill.style.width, '80%', '更新後 PillBar 寬度應為 80%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
