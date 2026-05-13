// 小蘿日誌 — 商店元件（GachaTile / ShelfCard）單元測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('ShopElements — 模組匯出');

test('shop-elements.js 可被匯入', async () => {
  try {
    const mod = await import('../components/shop-elements.js');
    assert(typeof mod.createGachaTile === 'function', 'createGachaTile 應為函式');
    assert(typeof mod.updateGachaTileState === 'function', 'updateGachaTileState 應為函式');
    assert(typeof mod.createShelfCard === 'function', 'createShelfCard 應為函式');
    assert(typeof mod.updateShelfCardState === 'function', 'updateShelfCardState 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('GachaTile — 建構與結構');

test('預設參數不報錯', async () => {
  try {
    const { createGachaTile } = await import('../components/shop-elements.js');
    const el = createGachaTile();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-gacha-tile'), '應有 lori-gacha-tile class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示等級', async () => {
  try {
    const { createGachaTile } = await import('../components/shop-elements.js');
    const el = createGachaTile({ level: 3, name: '遠征級' });
    const lvEl = el.querySelector('.lori-gacha-tile__level');
    assert(lvEl !== null, '應有等級元素');
    assertEqual(lvEl.textContent, 'Lv. 3');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示名稱', async () => {
  try {
    const { createGachaTile } = await import('../components/shop-elements.js');
    const el = createGachaTile({ level: 1, name: '散步級' });
    const nameEl = el.querySelector('.lori-gacha-tile__name');
    assertEqual(nameEl.textContent, '散步級');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示價格', async () => {
  try {
    const { createGachaTile } = await import('../components/shop-elements.js');
    const el = createGachaTile({ level: 2, name: '探索級', cost: 19 });
    const priceEl = el.querySelector('.lori-gacha-tile__price .tabnum');
    assertEqual(priceEl.textContent, '19');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示提示文字', async () => {
  try {
    const { createGachaTile } = await import('../components/shop-elements.js');
    const el = createGachaTile({ hint: '零成本 · 通勤就能做' });
    const hintEl = el.querySelector('.lori-gacha-tile__hint');
    assertEqual(hintEl.textContent, '零成本 · 通勤就能做');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('設定背景色', async () => {
  try {
    const { createGachaTile } = await import('../components/shop-elements.js');
    const el = createGachaTile({ color: '#F4845F' });
    assertEqual(el.style.background, 'rgb(244, 132, 95)');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('有 data-level', async () => {
  try {
    const { createGachaTile } = await import('../components/shop-elements.js');
    const el = createGachaTile({ level: 4 });
    assertEqual(el.dataset.level, '4');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('onDraw 回調正常', async () => {
  try {
    const { createGachaTile } = await import('../components/shop-elements.js');
    let drawLevel = null;
    const el = createGachaTile({
      level: 2,
      onDraw: (lv) => { drawLevel = lv; },
    });
    el.click();
    assertEqual(drawLevel, 2, 'onDraw 應收到 level');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('updateGachaTileState — 買不起時 disabled', async () => {
  try {
    const { createGachaTile, updateGachaTileState } = await import('../components/shop-elements.js');
    const el = createGachaTile({ level: 1 });
    updateGachaTileState(el, false);
    assertEqual(el.disabled, true, '買不起時應 disabled');
    assertEqual(el.style.opacity, '0.5', '買不起時應半透明');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('updateGachaTileState — 買得起時 enabled', async () => {
  try {
    const { createGachaTile, updateGachaTileState } = await import('../components/shop-elements.js');
    const el = createGachaTile({ level: 1 });
    updateGachaTileState(el, false);
    updateGachaTileState(el, true);
    assertEqual(el.disabled, false, '買得起時不應 disabled');
    assertEqual(el.style.opacity, '1', '買得起時應完全可見');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

suite('ShelfCard — 建構與結構');

test('預設參數不報錯', async () => {
  try {
    const { createShelfCard } = await import('../components/shop-elements.js');
    const el = createShelfCard();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-shelf-card'), '應有 lori-shelf-card class');
    assert(el.classList.contains('lori-card'), '應有 lori-card class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示名稱', async () => {
  try {
    const { createShelfCard } = await import('../components/shop-elements.js');
    const el = createShelfCard({ name: '買一杯沒喝過的飲料' });
    const nameEl = el.querySelector('.lori-shelf-card__name');
    assertEqual(nameEl.textContent, '買一杯沒喝過的飲料');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示等級', async () => {
  try {
    const { createShelfCard } = await import('../components/shop-elements.js');
    const el = createShelfCard({ level: 2 });
    const lvEl = el.querySelector('.lori-shelf-card__level');
    assertEqual(lvEl.textContent, 'Lv.2');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示價格', async () => {
  try {
    const { createShelfCard } = await import('../components/shop-elements.js');
    const el = createShelfCard({ cost: 22 });
    const priceEl = el.querySelector('.lori-shelf-card__price');
    assert(priceEl.textContent.includes('22'), '價格應包含 22');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('有兌換按鈕', async () => {
  try {
    const { createShelfCard } = await import('../components/shop-elements.js');
    const el = createShelfCard();
    const btn = el.querySelector('.lori-shelf-card__redeem');
    assert(btn !== null, '應有兌換按鈕');
    assertEqual(btn.textContent, '兌換');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('有 data-level', async () => {
  try {
    const { createShelfCard } = await import('../components/shop-elements.js');
    const el = createShelfCard({ level: 3 });
    assertEqual(el.dataset.level, '3');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('onRedeem 回調正常', async () => {
  try {
    const { createShelfCard } = await import('../components/shop-elements.js');
    let redeemed = null;
    const el = createShelfCard({
      name: '測試冒險',
      level: 1,
      cost: 8,
      onRedeem: (item) => { redeemed = item; },
    });
    const btn = el.querySelector('.lori-shelf-card__redeem');
    btn.click();
    assert(redeemed !== null, 'onRedeem 應被呼叫');
    assertEqual(redeemed.name, '測試冒險');
    assertEqual(redeemed.cost, 8);
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('updateShelfCardState — 買不起時按鈕 disabled', async () => {
  try {
    const { createShelfCard, updateShelfCardState } = await import('../components/shop-elements.js');
    const el = createShelfCard();
    updateShelfCardState(el, false);
    const btn = el.querySelector('.lori-shelf-card__redeem');
    assertEqual(btn.disabled, true);
    assertEqual(btn.style.opacity, '0.4');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('updateShelfCardState — 買得起時按鈕 enabled', async () => {
  try {
    const { createShelfCard, updateShelfCardState } = await import('../components/shop-elements.js');
    const el = createShelfCard();
    updateShelfCardState(el, false);
    updateShelfCardState(el, true);
    const btn = el.querySelector('.lori-shelf-card__redeem');
    assertEqual(btn.disabled, false);
    assertEqual(btn.style.opacity, '1');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
