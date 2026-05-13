// 小蘿日誌 — Quest 編輯頁單元測試
// 測試頻率選項 + Toggle 排序邏輯

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('Quest 編輯 — 頻率選項');

const FREQ_OPTIONS = ['每日', '每週', '每月', '不限'];

test('頻率選項共 4 種', () => {
  assertEqual(FREQ_OPTIONS.length, 4);
});

test('包含「每日」', () => {
  assert(FREQ_OPTIONS.includes('每日'), '應包含每日');
});

test('包含「每週」', () => {
  assert(FREQ_OPTIONS.includes('每週'), '應包含每週');
});

test('包含「每月」', () => {
  assert(FREQ_OPTIONS.includes('每月'), '應包含每月');
});

test('包含「不限」', () => {
  assert(FREQ_OPTIONS.includes('不限'), '應包含不限');
});

suite('Quest 編輯 — Toggle 排序邏輯');

// Toggle: checked=true → 無序 → q_seq = 0
// Toggle: checked=false → 有序 → q_seq = 1

function toggleToSeq(checked) {
  return checked ? 0 : 1;
}

function seqToToggle(q_seq) {
  return q_seq === 0;
}

test('checked=true（無序）→ q_seq=0', () => {
  assertEqual(toggleToSeq(true), 0);
});

test('checked=false（有序）→ q_seq=1', () => {
  assertEqual(toggleToSeq(false), 1);
});

test('q_seq=0 → checked=true（無序）', () => {
  assertEqual(seqToToggle(0), true);
});

test('q_seq=1 → checked=false（有序）', () => {
  assertEqual(seqToToggle(1), false);
});

test('q_seq=5 → checked=false（有序）', () => {
  assertEqual(seqToToggle(5), false);
});

suite('Quest 編輯 — 紅蘿蔔獎勵 clamp');

function clampCarrot(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

test('獎勵值在範圍內', () => {
  assertEqual(clampCarrot(5, 0, 999), 5);
});

test('獎勵值夾低', () => {
  assertEqual(clampCarrot(-1, 0, 999), 0);
});

test('獎勵值夾高', () => {
  assertEqual(clampCarrot(1000, 0, 999), 999);
});
