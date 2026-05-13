// 小蘿日誌 — 學習主頁（Screen 1400）單元測試
// 測試純邏輯函式：積分計算、完成度計算、技能色彩、週日期、熱度

import { suite, test, assert, assertEqual, assertDeepEqual } from './test-runner.js';

// ===== 從 learning-home.js 複製純函式以避免 DOM 依賴 =====

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

function skillColor(skIndex) {
  return SKILL_COLORS[(skIndex - 1) % SKILL_COLORS.length];
}

function calcLearningCarrots(pct) {
  if (pct > 1) return 2;
  if (pct > 0.5) return 1;
  return 0;
}

function calcClaimsProgress(claims) {
  if (!claims || claims.length === 0) return 0;
  const totalTarget = claims.reduce((s, c) => s + (c.c_target || 0), 0);
  const totalActual = claims.reduce((s, c) => s + (c.c_actual || 0), 0);
  if (totalTarget === 0) return 0;
  return totalActual / totalTarget;
}

function getWeekDates() {
  const today = new Date();
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function calcWeeklyHeat(skills, claims, weekDates) {
  return skills.map(sk => {
    const days = weekDates.map(dateStr => {
      return claims.some(c =>
        c.sk_index === sk.sk_index &&
        c.c_date === dateStr &&
        c.c_actual > 0
      );
    });
    return {
      name: sk.sk_name,
      color: skillColor(sk.sk_index),
      days,
    };
  });
}

// ===== 紅蘿蔔積分 =====

suite('學習主頁 — 紅蘿蔔積分');

test('完成度 0% → 0 紅蘿蔔', () => {
  assertEqual(calcLearningCarrots(0), 0);
});

test('完成度 50% → 0 紅蘿蔔（邊界）', () => {
  assertEqual(calcLearningCarrots(0.5), 0);
});

test('完成度 50.01% → 1 紅蘿蔔', () => {
  assertEqual(calcLearningCarrots(0.5001), 1);
});

test('完成度 100% → 1 紅蘿蔔', () => {
  assertEqual(calcLearningCarrots(1), 1);
});

test('完成度 150%（超額）→ 2 紅蘿蔔', () => {
  assertEqual(calcLearningCarrots(1.5), 2);
});

test('完成度 25% → 0 紅蘿蔔', () => {
  assertEqual(calcLearningCarrots(0.25), 0);
});

test('完成度 75% → 1 紅蘿蔔', () => {
  assertEqual(calcLearningCarrots(0.75), 1);
});

// ===== 完成度計算 =====

suite('學習主頁 — 完成度計算');

test('空認領 → 0', () => {
  assertEqual(calcClaimsProgress([]), 0);
});

test('null 認領 → 0', () => {
  assertEqual(calcClaimsProgress(null), 0);
});

test('單筆全完成 → 1', () => {
  const claims = [{ c_target: 10, c_actual: 10 }];
  assertEqual(calcClaimsProgress(claims), 1);
});

test('單筆半完成 → 0.5', () => {
  const claims = [{ c_target: 10, c_actual: 5 }];
  assertEqual(calcClaimsProgress(claims), 0.5);
});

test('多筆混合', () => {
  const claims = [
    { c_target: 10, c_actual: 10 },
    { c_target: 20, c_actual: 5 },
  ];
  // total target = 30, total actual = 15 → 0.5
  assertEqual(calcClaimsProgress(claims), 0.5);
});

test('target 全為 0 → 0', () => {
  const claims = [{ c_target: 0, c_actual: 0 }];
  assertEqual(calcClaimsProgress(claims), 0);
});

test('超額完成 → > 1', () => {
  const claims = [{ c_target: 10, c_actual: 15 }];
  assertEqual(calcClaimsProgress(claims), 1.5);
});

// ===== 技能色彩 =====

suite('學習主頁 — 技能色彩');

test('skIndex 1 → sun', () => {
  assertEqual(skillColor(1), 'var(--hm-sun)');
});

test('skIndex 2 → mint', () => {
  assertEqual(skillColor(2), 'var(--hm-mint)');
});

test('skIndex 9 → rose', () => {
  assertEqual(skillColor(9), 'var(--hm-rose)');
});

test('skIndex 10 → 循環回 sun', () => {
  assertEqual(skillColor(10), 'var(--hm-sun)');
});

// ===== 週日期 =====

suite('學習主頁 — 週日期');

test('getWeekDates 回傳 7 天', () => {
  const dates = getWeekDates();
  assertEqual(dates.length, 7);
});

test('getWeekDates 第一天是週一', () => {
  const dates = getWeekDates();
  const monday = new Date(dates[0] + 'T00:00:00');
  assertEqual(monday.getDay(), 1, '第一天應為週一');
});

test('getWeekDates 最後一天是週日', () => {
  const dates = getWeekDates();
  const sunday = new Date(dates[6] + 'T00:00:00');
  assertEqual(sunday.getDay(), 0, '最後一天應為週日');
});

test('getWeekDates 連續 7 天', () => {
  const dates = getWeekDates();
  for (let i = 1; i < 7; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00');
    const curr = new Date(dates[i] + 'T00:00:00');
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    assertEqual(diff, 1, `第 ${i} 天應與前一天差 1 天`);
  }
});

// ===== 本週熱度 =====

suite('學習主頁 — 本週技能熱度');

test('無 claims → 全 false', () => {
  const skills = [{ sk_index: 1, sk_name: 'A' }];
  const weekDates = ['2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-17'];
  const result = calcWeeklyHeat(skills, [], weekDates);
  assertEqual(result.length, 1);
  assertDeepEqual(result[0].days, [false, false, false, false, false, false, false]);
});

test('有 claim 且 actual > 0 → true', () => {
  const skills = [{ sk_index: 1, sk_name: 'A' }];
  const weekDates = ['2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-17'];
  const claims = [
    { sk_index: 1, c_date: '2026-05-12', c_actual: 5 },
    { sk_index: 1, c_date: '2026-05-14', c_actual: 3 },
  ];
  const result = calcWeeklyHeat(skills, claims, weekDates);
  assertDeepEqual(result[0].days, [false, true, false, true, false, false, false]);
});

test('actual = 0 → false', () => {
  const skills = [{ sk_index: 1, sk_name: 'A' }];
  const weekDates = ['2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-17'];
  const claims = [
    { sk_index: 1, c_date: '2026-05-12', c_actual: 0 },
  ];
  const result = calcWeeklyHeat(skills, claims, weekDates);
  assertDeepEqual(result[0].days, [false, false, false, false, false, false, false]);
});

test('不同技能分開計算', () => {
  const skills = [
    { sk_index: 1, sk_name: 'A' },
    { sk_index: 2, sk_name: 'B' },
  ];
  const weekDates = ['2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-17'];
  const claims = [
    { sk_index: 1, c_date: '2026-05-11', c_actual: 5 },
    { sk_index: 2, c_date: '2026-05-13', c_actual: 3 },
  ];
  const result = calcWeeklyHeat(skills, claims, weekDates);
  assertDeepEqual(result[0].days, [true, false, false, false, false, false, false]);
  assertDeepEqual(result[1].days, [false, false, true, false, false, false, false]);
});

test('多個技能 → 回傳正確色彩', () => {
  const skills = [
    { sk_index: 1, sk_name: 'A' },
    { sk_index: 3, sk_name: 'C' },
  ];
  const result = calcWeeklyHeat(skills, [], ['2026-05-11']);
  assertEqual(result[0].color, 'var(--hm-sun)');
  assertEqual(result[1].color, 'var(--hm-lavender)');
});
