// 小蘿日誌 — Routine 回顧頁單元測試
// 測試日期格式化 + sub 文字格式化

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('Routine 回顧 — 日期格式化');

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatRoutineLabel(dateStr, isToday) {
  const d = new Date(dateStr + 'T00:00:00');
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEK_DAYS[d.getDay()];
  if (isToday) {
    return `今日 · ${m}月 ${day} (${w})`;
  }
  return `${m}月 ${day} (${w})`;
}

function formatRoutineSub(entry) {
  const { blockCount, completedSteps, totalSteps, blockNames } = entry;
  if (blockCount === 0) return '無 Routine 紀錄';
  const nameStr = blockNames && blockNames.length > 0
    ? blockNames.join(' + ')
    : `${blockCount} block`;
  if (completedSteps === totalSteps && totalSteps > 0) {
    return `${nameStr} · 全勾`;
  }
  if (completedSteps === 0) {
    return `${nameStr} · 全跳過`;
  }
  return `${nameStr} · ${completedSteps}/${totalSteps} step`;
}

test('formatRoutineLabel：今日', () => {
  // 2026-05-12 是星期二
  assertEqual(formatRoutineLabel('2026-05-12', true), '今日 · 5月 12 (二)');
});

test('formatRoutineLabel：非今日', () => {
  assertEqual(formatRoutineLabel('2026-05-11', false), '5月 11 (一)');
});

suite('Routine 回顧 — Sub 文字格式化');

test('無紀錄', () => {
  assertEqual(
    formatRoutineSub({ blockCount: 0, completedSteps: 0, totalSteps: 0, blockNames: [] }),
    '無 Routine 紀錄'
  );
});

test('全勾（有 block 名稱）', () => {
  assertEqual(
    formatRoutineSub({ blockCount: 1, completedSteps: 10, totalSteps: 10, blockNames: ['晨間'] }),
    '晨間 · 全勾'
  );
});

test('全跳過', () => {
  assertEqual(
    formatRoutineSub({ blockCount: 1, completedSteps: 0, totalSteps: 10, blockNames: ['晨間'] }),
    '晨間 · 全跳過'
  );
});

test('部分完成', () => {
  assertEqual(
    formatRoutineSub({ blockCount: 2, completedSteps: 8, totalSteps: 15, blockNames: ['晨間', '晚間'] }),
    '晨間 + 晚間 · 8/15 step'
  );
});

test('無 blockNames 用 blockCount', () => {
  assertEqual(
    formatRoutineSub({ blockCount: 3, completedSteps: 5, totalSteps: 20, blockNames: [] }),
    '3 block · 5/20 step'
  );
});
