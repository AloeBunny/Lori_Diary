// 小蘿日誌 — Block 列表頁單元測試
// 測試色票輪轉邏輯

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('Block 列表 — 色票輪轉');

// 複製 getBlockColor 邏輯
const BLOCK_COLORS = [
  'var(--hm-mint)',
  'var(--violet)',
  'var(--hm-lavender)',
  'var(--hm-sage)',
  'var(--hm-sky)',
  'var(--hm-coral)',
  'var(--hm-peach)',
  'var(--hm-rose)',
  'var(--hm-sun)',
];

function getBlockColor(idx) {
  return BLOCK_COLORS[idx % BLOCK_COLORS.length];
}

test('index 0 → mint', () => {
  assertEqual(getBlockColor(0), 'var(--hm-mint)');
});

test('index 1 → violet', () => {
  assertEqual(getBlockColor(1), 'var(--violet)');
});

test('index 9 → 循環回 mint（9 色）', () => {
  assertEqual(getBlockColor(9), 'var(--hm-mint)');
});

test('index 18 → 循環第三圈 mint', () => {
  assertEqual(getBlockColor(18), 'var(--hm-mint)');
});

test('顏色總數為 9', () => {
  assertEqual(BLOCK_COLORS.length, 9);
});
