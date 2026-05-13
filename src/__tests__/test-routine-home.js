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
