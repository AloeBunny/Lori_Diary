// 小蘿日誌 — 技能列表頁單元測試
// 測試色票輪轉 + 進度計算邏輯

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('技能列表 — 色票輪轉');

// 複製 getSkillColor 邏輯
const SKILL_COLORS = [
  'var(--hm-sun)',
  'var(--hm-mint)',
  'var(--hm-lavender)',
  'var(--carrot)',
  'var(--hm-sky)',
  'var(--hm-coral)',
  'var(--hm-sage)',
  'var(--hm-peach)',
  'var(--hm-rose)',
];

function getSkillColor(idx) {
  return SKILL_COLORS[idx % SKILL_COLORS.length];
}

test('index 0 → sun', () => {
  assertEqual(getSkillColor(0), 'var(--hm-sun)');
});

test('index 1 → mint', () => {
  assertEqual(getSkillColor(1), 'var(--hm-mint)');
});

test('index 9 → 循環回 sun（9 色）', () => {
  assertEqual(getSkillColor(9), 'var(--hm-sun)');
});

test('顏色總數為 9', () => {
  assertEqual(SKILL_COLORS.length, 9);
});

suite('技能列表 — 進度計算');

// 複製 calcSkillProgress 邏輯
function calcSkillProgress(quests) {
  if (!quests || quests.length === 0) return 0;
  const completed = quests.filter(q => q.q_total > 0 && q.q_done >= q.q_total).length;
  return completed / quests.length;
}

test('空 quests → 0', () => {
  assertEqual(calcSkillProgress([]), 0);
});

test('null quests → 0', () => {
  assertEqual(calcSkillProgress(null), 0);
});

test('1/2 完成 → 0.5', () => {
  const quests = [
    { q_total: 10, q_done: 10 },
    { q_total: 10, q_done: 5 },
  ];
  assertEqual(calcSkillProgress(quests), 0.5);
});

test('全部完成 → 1', () => {
  const quests = [
    { q_total: 10, q_done: 10 },
    { q_total: 5, q_done: 5 },
    { q_total: 20, q_done: 25 },
  ];
  assertEqual(calcSkillProgress(quests), 1);
});

test('q_total = 0 不算完成', () => {
  const quests = [
    { q_total: 0, q_done: 0 },
    { q_total: 10, q_done: 10 },
  ];
  assertEqual(calcSkillProgress(quests), 0.5);
});

test('超過目標也算完成', () => {
  const quests = [
    { q_total: 10, q_done: 15 },
  ];
  assertEqual(calcSkillProgress(quests), 1);
});
