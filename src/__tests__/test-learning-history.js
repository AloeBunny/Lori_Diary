// 小蘿日誌 — 學習回顧頁單元測試
// 測試日期格式化 + sub 文字格式化

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('學習回顧 — 日期格式化');

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatLearningLabel(dateStr, isToday) {
  const d = new Date(dateStr + 'T00:00:00');
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEK_DAYS[d.getDay()];
  if (isToday) {
    return `今日 · ${m}月 ${day} (${w})`;
  }
  return `${m}月 ${day} (${w})`;
}

test('今日格式', () => {
  const label = formatLearningLabel('2026-05-12', true);
  assertEqual(label, '今日 · 5月 12 (二)');
});

test('非今日格式', () => {
  const label = formatLearningLabel('2026-05-11', false);
  assertEqual(label, '5月 11 (一)');
});

test('週日格式', () => {
  const label = formatLearningLabel('2026-05-10', false);
  assertEqual(label, '5月 10 (日)');
});

suite('學習回顧 — sub 文字格式化');

function formatLearningSub(entry) {
  const { claimCount, completedCount, skillNames } = entry;
  if (claimCount === 0) return '未認領';

  const nameStr = skillNames && skillNames.length > 0
    ? [...new Set(skillNames)].join(' · ')
    : `${claimCount} quest`;

  if (completedCount === claimCount && claimCount > 0) {
    return `${nameStr} · 全勾`;
  }
  if (completedCount === 0) {
    return nameStr;
  }
  return `${nameStr} · ${completedCount}/${claimCount} 完成`;
}

test('未認領', () => {
  assertEqual(formatLearningSub({ claimCount: 0, completedCount: 0, skillNames: [] }), '未認領');
});

test('全勾', () => {
  const result = formatLearningSub({
    claimCount: 2,
    completedCount: 2,
    skillNames: ['IELTS', 'SAP'],
  });
  assertEqual(result, 'IELTS · SAP · 全勾');
});

test('部分完成', () => {
  const result = formatLearningSub({
    claimCount: 3,
    completedCount: 1,
    skillNames: ['IELTS', 'SAP', 'IELTS'],
  });
  // 去重後 IELTS · SAP
  assertEqual(result, 'IELTS · SAP · 1/3 完成');
});

test('無 skillNames 時用 quest 數', () => {
  const result = formatLearningSub({
    claimCount: 2,
    completedCount: 0,
    skillNames: [],
  });
  assertEqual(result, '2 quest');
});

test('零完成有名字', () => {
  const result = formatLearningSub({
    claimCount: 1,
    completedCount: 0,
    skillNames: ['IELTS'],
  });
  assertEqual(result, 'IELTS');
});

suite('學習回顧 — 日期正規化');

function normalizeDate(date) {
  return date.length === 8
    ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
    : date;
}

test('YYYYMMDD → YYYY-MM-DD', () => {
  assertEqual(normalizeDate('20260512'), '2026-05-12');
});

test('YYYY-MM-DD 不變', () => {
  assertEqual(normalizeDate('2026-05-12'), '2026-05-12');
});
