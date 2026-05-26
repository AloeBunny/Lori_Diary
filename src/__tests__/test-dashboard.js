// 小蘿日誌 — 儀表板（Screen 1100）單元測試
// 測試純邏輯函式：calcStreak（已移至 helpers.js）
// F6：calcStreak 回傳 { total, current, gaps }

import { suite, test, assert, assertEqual } from './test-runner.js';
import { calcStreak } from '../utils/helpers.js';

suite('Dashboard — calcStreak 打卡統計');

test('全空陣列 → 全部 0', () => {
  const result = calcStreak([]);
  assertEqual(result.total, 0);
  assertEqual(result.current, 0);
  assertEqual(result.gaps, 0);
});

test('全部都有完成度 → total=current=3, gaps=0', () => {
  const records = [
    { date: '2026-05-10', pct: 0.3 },
    { date: '2026-05-11', pct: 0.5 },
    { date: '2026-05-12', pct: 0.8 },
  ];
  const result = calcStreak(records);
  assertEqual(result.total, 3);
  assertEqual(result.current, 3);
  assertEqual(result.gaps, 0);
});

test('最後一天為 0 → current=0, total=2, gaps=1', () => {
  const records = [
    { date: '2026-05-10', pct: 0.5 },
    { date: '2026-05-11', pct: 0.8 },
    { date: '2026-05-12', pct: 0 },
  ];
  const result = calcStreak(records);
  assertEqual(result.total, 2);
  assertEqual(result.current, 0);
  assertEqual(result.gaps, 1);
});

test('中間斷裂 → current=3, total=4, gaps=1', () => {
  const records = [
    { date: '2026-05-08', pct: 0.5 },
    { date: '2026-05-09', pct: 0 },
    { date: '2026-05-10', pct: 0.3 },
    { date: '2026-05-11', pct: 0.5 },
    { date: '2026-05-12', pct: 0.8 },
  ];
  const result = calcStreak(records);
  assertEqual(result.total, 4);
  assertEqual(result.current, 3);
  assertEqual(result.gaps, 1);
});

test('全部為 0 → total=0, current=0, gaps=3', () => {
  const records = [
    { date: '2026-05-10', pct: 0 },
    { date: '2026-05-11', pct: 0 },
    { date: '2026-05-12', pct: 0 },
  ];
  const result = calcStreak(records);
  assertEqual(result.total, 0);
  assertEqual(result.current, 0);
  assertEqual(result.gaps, 3);
});

test('只有一天有完成度 → total=1, current=1, gaps=0', () => {
  const records = [
    { date: '2026-05-12', pct: 0.1 },
  ];
  const result = calcStreak(records);
  assertEqual(result.total, 1);
  assertEqual(result.current, 1);
  assertEqual(result.gaps, 0);
});

test('極小完成度也算打卡（pct > 0）', () => {
  const records = [
    { date: '2026-05-11', pct: 0.001 },
    { date: '2026-05-12', pct: 0.001 },
  ];
  const result = calcStreak(records);
  assertEqual(result.total, 2);
  assertEqual(result.current, 2);
  assertEqual(result.gaps, 0);
});
