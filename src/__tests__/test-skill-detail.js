// 小蘿日誌 — Skill 明細頁單元測試
// 測試分類選項 + 進度百分比計算

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('Skill 明細 — 分類選項');

const SKILL_CATEGORIES = ['工作', '語言', '閱讀', '其他'];

test('分類共 4 種', () => {
  assertEqual(SKILL_CATEGORIES.length, 4);
});

test('包含「工作」', () => {
  assert(SKILL_CATEGORIES.includes('工作'), '應包含工作');
});

test('包含「語言」', () => {
  assert(SKILL_CATEGORIES.includes('語言'), '應包含語言');
});

test('包含「閱讀」', () => {
  assert(SKILL_CATEGORIES.includes('閱讀'), '應包含閱讀');
});

test('包含「其他」', () => {
  assert(SKILL_CATEGORIES.includes('其他'), '應包含其他');
});

suite('Skill 明細 — 進度百分比');

// 複製 calcProgressPercent 邏輯
function calcProgressPercent(quests) {
  if (!quests || quests.length === 0) return 0;
  const completed = quests.filter(q => q.q_total > 0 && q.q_done >= q.q_total).length;
  return Math.round((completed / quests.length) * 100);
}

test('空 quests → 0%', () => {
  assertEqual(calcProgressPercent([]), 0);
});

test('null → 0%', () => {
  assertEqual(calcProgressPercent(null), 0);
});

test('1/3 完成 → 33%', () => {
  const quests = [
    { q_total: 10, q_done: 10 },
    { q_total: 10, q_done: 5 },
    { q_total: 10, q_done: 3 },
  ];
  assertEqual(calcProgressPercent(quests), 33);
});

test('2/3 完成 → 67%', () => {
  const quests = [
    { q_total: 10, q_done: 10 },
    { q_total: 10, q_done: 10 },
    { q_total: 10, q_done: 3 },
  ];
  assertEqual(calcProgressPercent(quests), 67);
});

test('全部完成 → 100%', () => {
  const quests = [
    { q_total: 10, q_done: 10 },
    { q_total: 5, q_done: 5 },
  ];
  assertEqual(calcProgressPercent(quests), 100);
});

test('q_total 為 0 不算完成', () => {
  const quests = [
    { q_total: 0, q_done: 0 },
  ];
  assertEqual(calcProgressPercent(quests), 0);
});
