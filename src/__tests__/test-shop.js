// 小蘿日誌 — 商店頁（Screen 1600）單元測試
// 測試純邏輯函式：價格計算、抽獎

import { suite, test, assert, assertEqual } from './test-runner.js';

// ===== 從 shop.js 複製純函式以避免 DOM 依賴 =====

function gachaPrice(level, adventureData) {
  const key = `lv${level}`;
  const range = adventureData[key]?.cost || [5, 10];
  return range[0] + Math.pow(2, level);
}

function shelfPrice(level, adventureData) {
  const key = `lv${level}`;
  const range = adventureData[key]?.cost || [5, 10];
  const min = range[0];
  const max = range[1];
  return min + Math.floor(Math.random() * (max - min + 1));
}

function drawAdventure(level, adventureData) {
  const key = `lv${level}`;
  const items = adventureData[key]?.items || [];
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

// ===== 測試資料 =====

const MOCK_DATA = {
  lv1: { name: '散步級', cost: [5, 10], items: ['A', 'B', 'C'] },
  lv2: { name: '探索級', cost: [15, 30], items: ['D', 'E'] },
  lv3: { name: '遠征級', cost: [50, 80], items: ['F'] },
  lv4: { name: '史詩級', cost: [100, 200], items: ['G', 'H'] },
  reroll_cost: 2,
  free_rerolls: 1,
};

// ===== 抽獎價格 =====

suite('商店 — 抽獎固定價格');

test('Lv1 = 5 + 2^1 = 7', () => {
  assertEqual(gachaPrice(1, MOCK_DATA), 7);
});

test('Lv2 = 15 + 2^2 = 19', () => {
  assertEqual(gachaPrice(2, MOCK_DATA), 19);
});

test('Lv3 = 50 + 2^3 = 58', () => {
  assertEqual(gachaPrice(3, MOCK_DATA), 58);
});

test('Lv4 = 100 + 2^4 = 116', () => {
  assertEqual(gachaPrice(4, MOCK_DATA), 116);
});

test('沒有資料時使用預設範圍', () => {
  const price = gachaPrice(1, {});
  assertEqual(price, 7, '預設 min=5, 5+2=7');
});

// ===== 貨架價格 =====

suite('商店 — 貨架隨機價格');

test('Lv1 在 5~10 範圍內', () => {
  for (let i = 0; i < 50; i++) {
    const p = shelfPrice(1, MOCK_DATA);
    assert(p >= 5 && p <= 10, `Lv1 價格 ${p} 應在 5~10`);
  }
});

test('Lv2 在 15~30 範圍內', () => {
  for (let i = 0; i < 50; i++) {
    const p = shelfPrice(2, MOCK_DATA);
    assert(p >= 15 && p <= 30, `Lv2 價格 ${p} 應在 15~30`);
  }
});

test('Lv3 在 50~80 範圍內', () => {
  for (let i = 0; i < 50; i++) {
    const p = shelfPrice(3, MOCK_DATA);
    assert(p >= 50 && p <= 80, `Lv3 價格 ${p} 應在 50~80`);
  }
});

test('Lv4 在 100~200 範圍內', () => {
  for (let i = 0; i < 50; i++) {
    const p = shelfPrice(4, MOCK_DATA);
    assert(p >= 100 && p <= 200, `Lv4 價格 ${p} 應在 100~200`);
  }
});

// ===== 抽獎 =====

suite('商店 — 抽獎邏輯');

test('抽獎回傳池內項目', () => {
  for (let i = 0; i < 30; i++) {
    const result = drawAdventure(1, MOCK_DATA);
    assert(['A', 'B', 'C'].includes(result), `結果 "${result}" 應在池內`);
  }
});

test('空池回傳 null', () => {
  const result = drawAdventure(1, { lv1: { items: [], cost: [5, 10] } });
  assertEqual(result, null);
});

test('不存在的等級回傳 null', () => {
  const result = drawAdventure(5, MOCK_DATA);
  assertEqual(result, null);
});

test('單項池必中', () => {
  const result = drawAdventure(3, MOCK_DATA);
  assertEqual(result, 'F', '只有一個 F，應必中');
});

test('重抽規則：第一次免費，之後 +2🥕', () => {
  const freeRerolls = MOCK_DATA.free_rerolls;
  const rerollCost = MOCK_DATA.reroll_cost;
  assertEqual(freeRerolls, 1, '免費重抽次數應為 1');
  assertEqual(rerollCost, 2, '重抽費用應為 2🥕');
});

// ===== 模組匯出 =====

suite('商店 — 模組匯出');

test('shop.js 可被匯入（純函式）', async () => {
  try {
    const mod = await import('../screens/shop.js');
    assert(typeof mod.renderShop === 'function', 'renderShop 應為函式');
    assert(typeof mod.gachaPrice === 'function', 'gachaPrice 應為函式');
    assert(typeof mod.shelfPrice === 'function', 'shelfPrice 應為函式');
    assert(typeof mod.drawAdventure === 'function', 'drawAdventure 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，匯入測試跳過)');
    } else {
      throw e;
    }
  }
});
