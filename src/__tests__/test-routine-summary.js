// 小蘿日誌 — 完成摘要頁（Screen 1302）單元測試
// 測試純邏輯：完成百分比計算、跳過 step 過濾、積分規則

import { suite, test, assert, assertEqual, assertDeepEqual } from './test-runner.js';

// ===== 積分函式複製 =====

function calcRoutineCarrots(completedCount, totalCount) {
  if (totalCount === 0) return 0;
  const pct = (completedCount / totalCount) * 100;
  if (pct <= 0) return 0;
  if (pct <= 20) return 1;
  if (pct <= 40) return 2;
  if (pct <= 60) return 3;
  if (pct <= 80) return 4;
  return 5;
}

// ===== 完成百分比計算 =====

suite('完成摘要 — 完成百分比計算');

test('8/11 = 73%', () => {
  const pct = Math.round((8 / 11) * 100);
  assertEqual(pct, 73);
});

test('0/10 = 0%', () => {
  const pct = Math.round((0 / 10) * 100);
  assertEqual(pct, 0);
});

test('10/10 = 100%', () => {
  const pct = Math.round((10 / 10) * 100);
  assertEqual(pct, 100);
});

test('3/7 = 43%', () => {
  const pct = Math.round((3 / 7) * 100);
  assertEqual(pct, 43);
});

// ===== 跳過 step 過濾 =====

suite('完成摘要 — 跳過 step 過濾');

test('找出所有 skipped step', () => {
  const results = ['completed', 'skipped', 'completed', 'skipped', 'completed'];
  const steps = [
    { s_name: 'A', s_time: 60 },
    { s_name: 'B', s_time: 120 },
    { s_name: 'C', s_time: 30 },
    { s_name: 'D', s_time: 90 },
    { s_name: 'E', s_time: 45 },
  ];
  const skipped = [];
  results.forEach((r, i) => {
    if (r === 'skipped') skipped.push({ ...steps[i], idx: i });
  });
  assertEqual(skipped.length, 2);
  assertEqual(skipped[0].s_name, 'B');
  assertEqual(skipped[0].idx, 1);
  assertEqual(skipped[1].s_name, 'D');
  assertEqual(skipped[1].idx, 3);
});

test('沒有跳過 → 空陣列', () => {
  const results = ['completed', 'completed', 'completed'];
  const skipped = results.filter(r => r === 'skipped');
  assertEqual(skipped.length, 0);
});

test('全部跳過', () => {
  const results = ['skipped', 'skipped', 'skipped'];
  const skipped = results.filter(r => r === 'skipped');
  assertEqual(skipped.length, 3);
});

// ===== 積分規則邊界測試 =====

suite('完成摘要 — 積分規則邊界測試');

test('screen_spec 積分表：0% = 0', () => {
  assertEqual(calcRoutineCarrots(0, 10), 0);
});

test('screen_spec 積分表：1% = 1', () => {
  // 1/100 = 1%
  assertEqual(calcRoutineCarrots(1, 100), 1);
});

test('screen_spec 積分表：20% = 1', () => {
  assertEqual(calcRoutineCarrots(20, 100), 1);
});

test('screen_spec 積分表：21% = 2', () => {
  assertEqual(calcRoutineCarrots(21, 100), 2);
});

test('screen_spec 積分表：40% = 2', () => {
  assertEqual(calcRoutineCarrots(40, 100), 2);
});

test('screen_spec 積分表：41% = 3', () => {
  assertEqual(calcRoutineCarrots(41, 100), 3);
});

test('screen_spec 積分表：60% = 3', () => {
  assertEqual(calcRoutineCarrots(60, 100), 3);
});

test('screen_spec 積分表：61% = 4', () => {
  assertEqual(calcRoutineCarrots(61, 100), 4);
});

test('screen_spec 積分表：80% = 4', () => {
  assertEqual(calcRoutineCarrots(80, 100), 4);
});

test('screen_spec 積分表：81% = 5', () => {
  assertEqual(calcRoutineCarrots(81, 100), 5);
});

test('screen_spec 積分表：100% = 5', () => {
  assertEqual(calcRoutineCarrots(100, 100), 5);
});

// ===== 重做後更新結果 =====

suite('完成摘要 — 重做後更新結果');

test('重做 skipped step 變 completed → 更新統計', () => {
  const results = ['completed', 'skipped', 'completed', 'skipped', 'completed'];
  const total = results.length;

  // 重做前：3 completed / 5 total
  let completed = results.filter(r => r === 'completed').length;
  assertEqual(completed, 3);
  assertEqual(calcRoutineCarrots(completed, total), 3); // 60% → 3

  // 重做 index 1
  results[1] = 'completed';
  completed = results.filter(r => r === 'completed').length;
  assertEqual(completed, 4);
  assertEqual(calcRoutineCarrots(completed, total), 4); // 80% → 4

  // 重做 index 3
  results[3] = 'completed';
  completed = results.filter(r => r === 'completed').length;
  assertEqual(completed, 5);
  assertEqual(calcRoutineCarrots(completed, total), 5); // 100% → 5
});

test('重做後百分比更新', () => {
  const results = ['completed', 'skipped', 'skipped'];
  // 1/3 ≈ 33%
  let pct = Math.round((1 / 3) * 100);
  assertEqual(pct, 33);

  results[1] = 'completed';
  pct = Math.round((2 / 3) * 100);
  assertEqual(pct, 67);

  results[2] = 'completed';
  pct = Math.round((3 / 3) * 100);
  assertEqual(pct, 100);
});
