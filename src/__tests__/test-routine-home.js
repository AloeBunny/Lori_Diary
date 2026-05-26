// 小蘿日誌 — Routine 主頁（Screen 1300）單元測試
// 測試純邏輯函式：block-rise 匹配、總秒數計算、時段判斷

import { suite, test, assert, assertEqual } from './test-runner.js';

// ===== 從 routine-home.js 複製純函式以避免 DOM 依賴 =====

function matchBlockByRise(blocks, nowHHMM) {
  let best = null;
  let bestRise = '';
  for (const b of blocks) {
    if (!b.b_rise || !b.b_set) continue;
    if (b.b_rise <= nowHHMM && b.b_set >= nowHHMM) {
      if (!best || b.b_rise > bestRise) {
        best = b;
        bestRise = b.b_rise;
      }
    }
  }
  return best;
}

function calcBlockTotalSeconds(steps) {
  return steps.reduce((sum, s) => sum + (s.s_time || 0), 0);
}

function getTimePeriodHint(hour) {
  if (hour < 6) return '凌晨時段';
  if (hour < 12) return '上午時段';
  if (hour < 14) return '中午時段';
  if (hour < 18) return '下午時段';
  if (hour < 22) return '晚間時段';
  return '深夜時段';
}

// ===== block-rise 匹配 =====

suite('Routine 主頁 — block-rise 匹配');

const BLOCKS = [
  { b_index: 1, b_name: '晨間 Routine', b_rise: '0500', b_set: '0730' },
  { b_index: 2, b_name: '晚間 Routine', b_rise: '1800', b_set: '2230' },
];

test('05:30 應匹配晨間 Block', () => {
  const result = matchBlockByRise(BLOCKS, '0530');
  assert(result !== null, '應該找到匹配的 block');
  assertEqual(result.b_index, 1);
});

test('19:00 應匹配晚間 Block', () => {
  const result = matchBlockByRise(BLOCKS, '1900');
  assert(result !== null, '應該找到匹配的 block');
  assertEqual(result.b_index, 2);
});

test('12:00 無匹配 → null', () => {
  const result = matchBlockByRise(BLOCKS, '1200');
  assertEqual(result, null);
});

test('0500 邊界 → 匹配晨間', () => {
  const result = matchBlockByRise(BLOCKS, '0500');
  assert(result !== null, '邊界值應該匹配');
  assertEqual(result.b_index, 1);
});

test('0730 邊界 → 匹配晨間', () => {
  const result = matchBlockByRise(BLOCKS, '0730');
  assert(result !== null, '邊界值應該匹配');
  assertEqual(result.b_index, 1);
});

test('2230 邊界 → 匹配晚間', () => {
  const result = matchBlockByRise(BLOCKS, '2230');
  assert(result !== null, '邊界值應該匹配');
  assertEqual(result.b_index, 2);
});

test('2231 超出晚間 → null', () => {
  const result = matchBlockByRise(BLOCKS, '2231');
  assertEqual(result, null);
});

test('一次性 block（無 rise/set）不參與匹配', () => {
  const blocks = [
    { b_index: 3, b_name: '一次性', b_rise: '', b_set: '' },
    { b_index: 1, b_name: '晨間', b_rise: '0500', b_set: '0730' },
  ];
  const result = matchBlockByRise(blocks, '0600');
  assertEqual(result.b_index, 1);
});

test('重疊時段 → 選 rise 最接近的', () => {
  const blocks = [
    { b_index: 1, b_name: 'A', b_rise: '0500', b_set: '0730' },
    { b_index: 2, b_name: 'B', b_rise: '0600', b_set: '0700' },
  ];
  const result = matchBlockByRise(blocks, '0630');
  assertEqual(result.b_index, 2, '應選 rise 最接近（最晚）的');
});

test('空 blocks 陣列 → null', () => {
  assertEqual(matchBlockByRise([], '1200'), null);
});

// ===== 總秒數計算 =====

suite('Routine 主頁 — Block 總秒數計算');

test('正常 step 加總', () => {
  const steps = [
    { s_time: 300 },
    { s_time: 600 },
    { s_time: 1800 },
  ];
  assertEqual(calcBlockTotalSeconds(steps), 2700);
});

test('空 steps → 0', () => {
  assertEqual(calcBlockTotalSeconds([]), 0);
});

test('含 s_time 為 0 的 step', () => {
  const steps = [
    { s_time: 300 },
    { s_time: 0 },
    { s_time: 600 },
  ];
  assertEqual(calcBlockTotalSeconds(steps), 900);
});

test('s_time 缺失 → 當 0', () => {
  const steps = [{ s_time: 300 }, {}];
  assertEqual(calcBlockTotalSeconds(steps), 300);
});

// ===== 時段判斷 =====

suite('Routine 主頁 — 時段判斷');

test('凌晨 3 點', () => {
  assertEqual(getTimePeriodHint(3), '凌晨時段');
});

test('上午 8 點', () => {
  assertEqual(getTimePeriodHint(8), '上午時段');
});

test('中午 12 點', () => {
  assertEqual(getTimePeriodHint(12), '中午時段');
});

test('下午 15 點', () => {
  assertEqual(getTimePeriodHint(15), '下午時段');
});

test('晚間 20 點', () => {
  assertEqual(getTimePeriodHint(20), '晚間時段');
});

test('深夜 23 點', () => {
  assertEqual(getTimePeriodHint(23), '深夜時段');
});

test('邊界 6 點 = 上午', () => {
  assertEqual(getTimePeriodHint(6), '上午時段');
});

test('邊界 22 點 = 深夜', () => {
  assertEqual(getTimePeriodHint(22), '深夜時段');
});

// ===== F11：今日建議推薦邏輯 =====
// 從 routine-home.js _loadRoutineData 中提取的 F11 推薦邏輯

const morningPattern = /早|晨|morning/i;
const eveningPattern = /晚|夜|evening/i;

/**
 * F11 推薦邏輯：從未完成 blocks 中依時段推薦
 * @param {Array} pendingBlocks - 未完成的 block 陣列
 * @param {number} hour - 當前小時（0-23）
 * @returns {object|null} 推薦的 block，或 null（全部完成）
 */
function suggestBlock(pendingBlocks, hour) {
  if (pendingBlocks.length === 0) return null;

  const isMorning = hour < 12;
  let suggested = null;
  if (isMorning) {
    suggested = pendingBlocks.find(b => morningPattern.test(b.b_name));
  } else {
    suggested = pendingBlocks.find(b => eveningPattern.test(b.b_name));
  }
  if (!suggested) {
    suggested = pendingBlocks[0];
  }
  return suggested;
}

suite('Routine 主頁 — F11 時段推薦邏輯');

test('早上 + 有「早晨 Routine」→ 推薦它', () => {
  const blocks = [
    { b_index: 0, b_name: '早晨 Routine' },
    { b_index: 1, b_name: '晚間 Routine' },
  ];
  const result = suggestBlock(blocks, 8);
  assertEqual(result.b_name, '早晨 Routine');
});

test('早上 + 有「Morning Routine」→ 推薦它', () => {
  const blocks = [
    { b_index: 0, b_name: '晚間 Routine' },
    { b_index: 1, b_name: 'Morning Routine' },
  ];
  const result = suggestBlock(blocks, 6);
  assertEqual(result.b_name, 'Morning Routine');
});

test('早上 + hour=0（凌晨）→ 仍算 isMorning，推薦早晨 block', () => {
  const blocks = [
    { b_index: 0, b_name: '晚間 Routine' },
    { b_index: 1, b_name: '早晨流程' },
  ];
  const result = suggestBlock(blocks, 0);
  assertEqual(result.b_name, '早晨流程');
});

test('早上 + hour=11（邊界）→ 仍算 isMorning', () => {
  const blocks = [
    { b_index: 0, b_name: '晨間打理' },
    { b_index: 1, b_name: '晚間 Routine' },
  ];
  const result = suggestBlock(blocks, 11);
  assertEqual(result.b_name, '晨間打理');
});

test('下午 + hour=12（邊界）→ isMorning=false，推薦晚間 block', () => {
  const blocks = [
    { b_index: 0, b_name: '早晨 Routine' },
    { b_index: 1, b_name: '晚間 Routine' },
  ];
  const result = suggestBlock(blocks, 12);
  assertEqual(result.b_name, '晚間 Routine');
});

test('下午 + 有「Evening Routine」→ 推薦它', () => {
  const blocks = [
    { b_index: 0, b_name: '早晨 Routine' },
    { b_index: 1, b_name: 'Evening Routine' },
  ];
  const result = suggestBlock(blocks, 20);
  assertEqual(result.b_name, 'Evening Routine');
});

test('下午 + 有「深夜流程」→ 「夜」匹配 eveningPattern', () => {
  const blocks = [
    { b_index: 0, b_name: '早晨 Routine' },
    { b_index: 1, b_name: '深夜流程' },
  ];
  const result = suggestBlock(blocks, 23);
  assertEqual(result.b_name, '深夜流程');
});

test('早上 + 沒有名稱匹配 → fallback 到第一個未完成', () => {
  const blocks = [
    { b_index: 0, b_name: '下午 Routine' },
    { b_index: 1, b_name: '運動流程' },
  ];
  const result = suggestBlock(blocks, 9);
  assertEqual(result.b_name, '下午 Routine');
});

test('下午 + 沒有匹配 eveningPattern → fallback 到第一個未完成', () => {
  const blocks = [
    { b_index: 0, b_name: '運動流程' },
    { b_index: 1, b_name: '下午 Routine' },
  ];
  const result = suggestBlock(blocks, 15);
  assertEqual(result.b_name, '運動流程');
});

test('全部完成（空陣列）→ 推薦為 null', () => {
  const result = suggestBlock([], 10);
  assertEqual(result, null);
});

test('只有一個 block + 名稱不匹配 → fallback 推薦它', () => {
  const blocks = [{ b_index: 0, b_name: '通用流程' }];
  const result = suggestBlock(blocks, 8);
  assertEqual(result.b_name, '通用流程');
});

test('多個早晨匹配 → 取 find 找到的第一個', () => {
  const blocks = [
    { b_index: 0, b_name: '早晨護膚' },
    { b_index: 1, b_name: '晨間運動' },
    { b_index: 2, b_name: '晚間 Routine' },
  ];
  const result = suggestBlock(blocks, 7);
  assertEqual(result.b_name, '早晨護膚');
});

// ===== F11：正則匹配測試 =====

suite('Routine 主頁 — F11 正則匹配');

test('morningPattern 匹配「早晨 Routine」', () => {
  assert(morningPattern.test('早晨 Routine'), '應匹配「早晨 Routine」');
});

test('morningPattern 匹配「早安流程」', () => {
  assert(morningPattern.test('早安流程'), '應匹配含「早」');
});

test('morningPattern 匹配「晨間打理」', () => {
  assert(morningPattern.test('晨間打理'), '應匹配含「晨」');
});

test('morningPattern 匹配「Morning Routine」', () => {
  assert(morningPattern.test('Morning Routine'), '應匹配 Morning');
});

test('morningPattern 匹配「morning routine」（小寫）', () => {
  assert(morningPattern.test('morning routine'), '應匹配小寫 morning（/i flag）');
});

test('morningPattern 匹配「MORNING」（大寫）', () => {
  assert(morningPattern.test('MORNING'), '應匹配大寫 MORNING（/i flag）');
});

test('morningPattern 不匹配「下午 Routine」', () => {
  assert(!morningPattern.test('下午 Routine'), '不應匹配');
});

test('morningPattern 不匹配「晚間 Routine」', () => {
  assert(!morningPattern.test('晚間 Routine'), '不應匹配');
});

test('morningPattern 不匹配「運動流程」', () => {
  assert(!morningPattern.test('運動流程'), '不應匹配');
});

test('eveningPattern 匹配「晚間 Routine」', () => {
  assert(eveningPattern.test('晚間 Routine'), '應匹配含「晚」');
});

test('eveningPattern 匹配「Evening Routine」', () => {
  assert(eveningPattern.test('Evening Routine'), '應匹配 Evening');
});

test('eveningPattern 匹配「evening routine」（小寫）', () => {
  assert(eveningPattern.test('evening routine'), '應匹配小寫 evening（/i flag）');
});

test('eveningPattern 匹配「深夜流程」', () => {
  assert(eveningPattern.test('深夜流程'), '應匹配含「夜」');
});

test('eveningPattern 匹配「夜間護膚」', () => {
  assert(eveningPattern.test('夜間護膚'), '應匹配含「夜」');
});

test('eveningPattern 不匹配「早晨 Routine」', () => {
  assert(!eveningPattern.test('早晨 Routine'), '不應匹配');
});

test('eveningPattern 不匹配「下午 Routine」', () => {
  assert(!eveningPattern.test('下午 Routine'), '不應匹配');
});

test('「下午 Routine」不匹配任何 pattern → 會走 fallback', () => {
  const name = '下午 Routine';
  assert(!morningPattern.test(name), '不應匹配 morningPattern');
  assert(!eveningPattern.test(name), '不應匹配 eveningPattern');
});

// ===== F7：完成判斷 =====

suite('Routine 主頁 — F7 完成判斷');

test('block 在 completedIndexSet 裡 → isDone = true', () => {
  const set = new Set([0, 2, 5]);
  assertEqual(set.has(0), true);
  assertEqual(set.has(2), true);
  assertEqual(set.has(5), true);
});

test('block 不在 completedIndexSet 裡 → isDone = false', () => {
  const set = new Set([0, 2, 5]);
  assertEqual(set.has(1), false);
  assertEqual(set.has(3), false);
  assertEqual(set.has(99), false);
});

test('空 completedIndexSet → 全部 isDone = false', () => {
  const set = new Set();
  assertEqual(set.has(0), false);
  assertEqual(set.has(1), false);
});

test('所有 block 都完成 → 全部 isDone = true', () => {
  const blocks = [{ b_index: 0 }, { b_index: 1 }, { b_index: 2 }];
  const set = new Set(blocks.map(b => b.b_index));
  for (const b of blocks) {
    assertEqual(set.has(b.b_index), true);
  }
});

test('completedIndexSet 從 records 建構（只算當天）', () => {
  const records = [
    { date: '2026-05-26', type: 'routine', blockIndex: 0 },
    { date: '2026-05-26', type: 'routine', blockIndex: 2 },
    { date: '2026-05-25', type: 'routine', blockIndex: 1 },  // 不同日期
    { date: '2026-05-26', type: 'quest', blockIndex: 3 },    // 不同 type
    { date: '2026-05-26', type: 'routine' },                 // 無 blockIndex
  ];
  const dateStr = '2026-05-26';
  const todayRecords = records.filter(r =>
    r.date === dateStr && r.type === 'routine' && r.blockIndex !== undefined
  );
  const completedIndexSet = new Set(todayRecords.map(r => r.blockIndex));

  assertEqual(completedIndexSet.has(0), true);
  assertEqual(completedIndexSet.has(2), true);
  assertEqual(completedIndexSet.has(1), false);  // 不同日期
  assertEqual(completedIndexSet.has(3), false);  // type 不是 routine
});

// ===== F7 + F11 整合：過濾未完成後推薦 =====

suite('Routine 主頁 — F7+F11 整合邏輯');

test('早晨已完成 → 推薦下一個可用 block', () => {
  const blocks = [
    { b_index: 0, b_name: '早晨 Routine' },
    { b_index: 1, b_name: '晚間 Routine' },
    { b_index: 2, b_name: '運動流程' },
  ];
  const completedIndexSet = new Set([0]);
  const pendingBlocks = blocks.filter(b => !completedIndexSet.has(b.b_index));
  assertEqual(pendingBlocks.length, 2);

  // 早上，早晨已完成 → 沒有匹配 morningPattern 的 pending block → fallback
  const result = suggestBlock(pendingBlocks, 8);
  assertEqual(result.b_name, '晚間 Routine');
});

test('早晨已完成 + 另有晨間 block → 推薦另一個', () => {
  const blocks = [
    { b_index: 0, b_name: '早晨 Routine' },
    { b_index: 1, b_name: '晨間運動' },
    { b_index: 2, b_name: '晚間 Routine' },
  ];
  const completedIndexSet = new Set([0]);
  const pendingBlocks = blocks.filter(b => !completedIndexSet.has(b.b_index));
  const result = suggestBlock(pendingBlocks, 9);
  assertEqual(result.b_name, '晨間運動');
});

test('全部完成 → pendingBlocks 為空 → 推薦 null', () => {
  const blocks = [
    { b_index: 0, b_name: '早晨 Routine' },
    { b_index: 1, b_name: '晚間 Routine' },
  ];
  const completedIndexSet = new Set([0, 1]);
  const pendingBlocks = blocks.filter(b => !completedIndexSet.has(b.b_index));
  assertEqual(pendingBlocks.length, 0);
  assertEqual(suggestBlock(pendingBlocks, 10), null);
});

test('下午 + 晚間已完成 → fallback 到第一個未完成', () => {
  const blocks = [
    { b_index: 0, b_name: '早晨 Routine' },
    { b_index: 1, b_name: '晚間 Routine' },
    { b_index: 2, b_name: '運動流程' },
  ];
  const completedIndexSet = new Set([1]);
  const pendingBlocks = blocks.filter(b => !completedIndexSet.has(b.b_index));
  // 下午找 eveningPattern → 晚間已完成不在 pending → fallback
  const result = suggestBlock(pendingBlocks, 18);
  assertEqual(result.b_name, '早晨 Routine');
});

test('部分完成 + 下午有晚間 pending → 推薦晚間', () => {
  const blocks = [
    { b_index: 0, b_name: '早晨 Routine' },
    { b_index: 1, b_name: '晚間 Routine' },
    { b_index: 2, b_name: '運動流程' },
  ];
  const completedIndexSet = new Set([0, 2]);
  const pendingBlocks = blocks.filter(b => !completedIndexSet.has(b.b_index));
  assertEqual(pendingBlocks.length, 1);
  const result = suggestBlock(pendingBlocks, 20);
  assertEqual(result.b_name, '晚間 Routine');
});

// ===== B2：completedBlockMap 邏輯 =====
// 測試從 dayRecord.completedBlocks 建立 Map 的邏輯

suite('Routine 主頁 — B2 completedBlockMap 建構');

test('從 completedBlocks 陣列建立 Map', () => {
  const completedBlocks = [
    { blockIndex: 1, completionPct: 0.8, completedCount: 4, totalCount: 5 },
    { blockIndex: 2, completionPct: 1.0, completedCount: 7, totalCount: 7 },
  ];
  const completedBlockMap = new Map();
  completedBlocks.forEach(cb => {
    completedBlockMap.set(cb.blockIndex, cb);
  });
  assertEqual(completedBlockMap.size, 2);
  assertEqual(completedBlockMap.has(1), true);
  assertEqual(completedBlockMap.has(2), true);
  assertEqual(completedBlockMap.has(3), false);
});

test('completedBlockMap 查詢 completionPct 正確', () => {
  const completedBlocks = [
    { blockIndex: 1, completionPct: 0.8 },
    { blockIndex: 2, completionPct: 0.6 },
  ];
  const completedBlockMap = new Map();
  completedBlocks.forEach(cb => {
    completedBlockMap.set(cb.blockIndex, cb);
  });
  const rec1 = completedBlockMap.get(1);
  assertEqual(Math.round((rec1.completionPct || 0) * 100), 80);
  const rec2 = completedBlockMap.get(2);
  assertEqual(Math.round((rec2.completionPct || 0) * 100), 60);
});

test('同一 block 多筆紀錄（redo）取最後一筆', () => {
  const completedBlocks = [
    { blockIndex: 1, completionPct: 0.5 },  // 第一次
    { blockIndex: 1, completionPct: 0.9 },  // redo 後
  ];
  const completedBlockMap = new Map();
  completedBlocks.forEach(cb => {
    // forEach 順序覆蓋，最後一筆勝出
    completedBlockMap.set(cb.blockIndex, cb);
  });
  const rec = completedBlockMap.get(1);
  assertEqual(rec.completionPct, 0.9, '應取最後一筆（redo 後的結果）');
});

test('completedBlocks 為空陣列 → Map 為空', () => {
  const completedBlocks = [];
  const completedBlockMap = new Map();
  completedBlocks.forEach(cb => {
    completedBlockMap.set(cb.blockIndex, cb);
  });
  assertEqual(completedBlockMap.size, 0);
  const completedIndexSet = new Set(completedBlockMap.keys());
  assertEqual(completedIndexSet.size, 0);
});

test('completedBlocks 為 undefined → 安全處理', () => {
  const dayRec = { date: '2026-05-26', type: 'routine' };
  const completedBlocks = (dayRec && dayRec.completedBlocks) || [];
  assertEqual(completedBlocks.length, 0);
});

test('completedBlockMap + completedIndexSet 聯動正確', () => {
  const completedBlocks = [
    { blockIndex: 0, completionPct: 1.0 },
    { blockIndex: 2, completionPct: 0.6 },
  ];
  const completedBlockMap = new Map();
  completedBlocks.forEach(cb => {
    completedBlockMap.set(cb.blockIndex, cb);
  });
  const completedIndexSet = new Set(completedBlockMap.keys());

  // block 0 已完成
  const isDone0 = completedIndexSet.has(0);
  const blockRec0 = completedBlockMap.get(0);
  const pct0 = isDone0 && blockRec0 ? Math.round((blockRec0.completionPct || 0) * 100) : 0;
  assertEqual(pct0, 100);

  // block 1 未完成
  const isDone1 = completedIndexSet.has(1);
  const blockRec1 = completedBlockMap.get(1);
  const pct1 = isDone1 && blockRec1 ? Math.round((blockRec1.completionPct || 0) * 100) : 0;
  assertEqual(pct1, 0);

  // block 2 部分完成
  const isDone2 = completedIndexSet.has(2);
  const blockRec2 = completedBlockMap.get(2);
  const pct2 = isDone2 && blockRec2 ? Math.round((blockRec2.completionPct || 0) * 100) : 0;
  assertEqual(pct2, 60);
});

test('多個 block 完成時都能正確查到 completionPct', () => {
  const completedBlocks = [
    { blockIndex: 1, completionPct: 0.3 },
    { blockIndex: 2, completionPct: 0.5 },
    { blockIndex: 3, completionPct: 0.8 },
    { blockIndex: 4, completionPct: 1.0 },
  ];
  const completedBlockMap = new Map();
  completedBlocks.forEach(cb => {
    completedBlockMap.set(cb.blockIndex, cb);
  });

  assertEqual(Math.round(completedBlockMap.get(1).completionPct * 100), 30);
  assertEqual(Math.round(completedBlockMap.get(2).completionPct * 100), 50);
  assertEqual(Math.round(completedBlockMap.get(3).completionPct * 100), 80);
  assertEqual(Math.round(completedBlockMap.get(4).completionPct * 100), 100);
});

// ===== E2：簡化模式切換閉包邏輯 =====

suite('Routine 主頁 — E2 簡化模式切換');

test('_simplifiedMode 初始為 false', () => {
  let _simplifiedMode = false;
  assertEqual(_simplifiedMode, false);
});

test('toggle 翻轉為 true', () => {
  let _simplifiedMode = false;
  _simplifiedMode = !_simplifiedMode;
  assertEqual(_simplifiedMode, true);
});

test('toggle 再次翻轉回 false', () => {
  let _simplifiedMode = false;
  _simplifiedMode = !_simplifiedMode;
  _simplifiedMode = !_simplifiedMode;
  assertEqual(_simplifiedMode, false);
});

test('DB 讀取值同步回閉包（模擬 getSetting 回傳 true）', () => {
  let _simplifiedMode = false;
  // 模擬 _loadRoutineData 裡的同步邏輯
  const simplifiedMode = true; // 假設 DB 存的是 true
  _simplifiedMode = simplifiedMode;
  assertEqual(_simplifiedMode, true);
});

test('DB 讀取值同步回閉包（模擬 getSetting 回傳 false）', () => {
  let _simplifiedMode = true; // 之前已開啟
  const simplifiedMode = false; // DB 讀回 false
  _simplifiedMode = simplifiedMode;
  assertEqual(_simplifiedMode, false);
});

test('簡化模式下 steps 只取前 3 個', () => {
  const allSteps = [
    { s_index: 1, s_name: 'A' },
    { s_index: 2, s_name: 'B' },
    { s_index: 3, s_name: 'C' },
    { s_index: 4, s_name: 'D' },
    { s_index: 5, s_name: 'E' },
  ];
  const simplifiedMode = true;
  const blockSteps = simplifiedMode ? allSteps.slice(0, 3) : allSteps;
  assertEqual(blockSteps.length, 3);
  assertEqual(blockSteps[0].s_name, 'A');
  assertEqual(blockSteps[2].s_name, 'C');
});

test('非簡化模式保留全部 steps', () => {
  const allSteps = [
    { s_index: 1, s_name: 'A' },
    { s_index: 2, s_name: 'B' },
    { s_index: 3, s_name: 'C' },
    { s_index: 4, s_name: 'D' },
    { s_index: 5, s_name: 'E' },
  ];
  const simplifiedMode = false;
  const blockSteps = simplifiedMode ? allSteps.slice(0, 3) : allSteps;
  assertEqual(blockSteps.length, 5);
});

test('steps 少於 3 個時 slice(0,3) 不報錯', () => {
  const allSteps = [{ s_index: 1, s_name: 'A' }, { s_index: 2, s_name: 'B' }];
  const blockSteps = allSteps.slice(0, 3);
  assertEqual(blockSteps.length, 2);
});

test('steps 剛好 3 個時 slice(0,3) 返回全部', () => {
  const allSteps = [
    { s_index: 1, s_name: 'A' },
    { s_index: 2, s_name: 'B' },
    { s_index: 3, s_name: 'C' },
  ];
  const blockSteps = allSteps.slice(0, 3);
  assertEqual(blockSteps.length, 3);
});

test('步驟標籤根據模式不同', () => {
  const simplifiedMode = true;
  const blockSteps = [{ s_name: 'A' }, { s_name: 'B' }, { s_name: 'C' }];
  const stepLabel = simplifiedMode
    ? `前 ${blockSteps.length} 個 step（簡化模式）`
    : `共 ${blockSteps.length} 個 step`;
  assertEqual(stepLabel, '前 3 個 step（簡化模式）');
});

test('非簡化模式的步驟標籤', () => {
  const simplifiedMode = false;
  const blockSteps = [{ s_name: 'A' }, { s_name: 'B' }, { s_name: 'C' }, { s_name: 'D' }, { s_name: 'E' }];
  const stepLabel = simplifiedMode
    ? `前 ${blockSteps.length} 個 step（簡化模式）`
    : `共 ${blockSteps.length} 個 step`;
  assertEqual(stepLabel, '共 5 個 step');
});
