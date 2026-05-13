// 小蘿日誌 — 儀表板（Screen 1100）單元測試
// 測試純邏輯函式：calcStreak（已移至 helpers.js）

import { suite, test, assert, assertEqual } from './test-runner.js';
import { calcStreak } from '../utils/helpers.js';

suite('Dashboard — calcStreak 連續打卡天數');

test('全空陣列 → 0 天', () => {
  assertEqual(calcStreak([]), 0);
});

test('全部都有完成度 → 全部天數', () => {
  const records = [
    { date: '2026-05-10', pct: 0.3 },
    { date: '2026-05-11', pct: 0.5 },
    { date: '2026-05-12', pct: 0.8 },
  ];
  assertEqual(calcStreak(records), 3);
});

test('最後一天為 0 → 0 天（連續打卡斷裂）', () => {
  const records = [
    { date: '2026-05-10', pct: 0.5 },
    { date: '2026-05-11', pct: 0.8 },
    { date: '2026-05-12', pct: 0 },
  ];
  assertEqual(calcStreak(records), 0);
});

test('中間斷裂 → 只算最後連續段', () => {
  const records = [
    { date: '2026-05-08', pct: 0.5 },
    { date: '2026-05-09', pct: 0 },
    { date: '2026-05-10', pct: 0.3 },
    { date: '2026-05-11', pct: 0.5 },
    { date: '2026-05-12', pct: 0.8 },
  ];
  assertEqual(calcStreak(records), 3);
});

test('全部為 0 → 0 天', () => {
  const records = [
    { date: '2026-05-10', pct: 0 },
    { date: '2026-05-11', pct: 0 },
    { date: '2026-05-12', pct: 0 },
  ];
  assertEqual(calcStreak(records), 0);
});

test('只有一天有完成度 → 1 天', () => {
  const records = [
    { date: '2026-05-12', pct: 0.1 },
  ];
  assertEqual(calcStreak(records), 1);
});

test('極小完成度也算打卡（pct > 0）', () => {
  const records = [
    { date: '2026-05-11', pct: 0.001 },
    { date: '2026-05-12', pct: 0.001 },
  ];
  assertEqual(calcStreak(records), 2);
});
