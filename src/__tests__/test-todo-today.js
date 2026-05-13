// 小蘿日誌 — TODO 當日頁（Screen 1200）單元測試
// 測試純邏輯函式：日期計算、拖欠天數計算

import { suite, test, assert, assertEqual, assertDeepEqual } from './test-runner.js';

// 直接 import 純函式（避免 top-level await 的 DOM 依賴）
// 因為 todo-today.js 有 top-level await import DOM 元件，
// 這裡單獨測試可提取的純邏輯

suite('TODO 當日 — 日期工具函式');

// ===== 日期工具函式（複製自 todo-today.js 以避免 DOM 依賴） =====

function toLocalDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function prevDateStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return toLocalDateStr(d);
}

function nextDateStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return toLocalDateStr(d);
}

test('prevDateStr：一般日期前一天', () => {
  assertEqual(prevDateStr('2026-05-12'), '2026-05-11');
});

test('prevDateStr：月初跨月', () => {
  assertEqual(prevDateStr('2026-05-01'), '2026-04-30');
});

test('prevDateStr：年初跨年', () => {
  assertEqual(prevDateStr('2026-01-01'), '2025-12-31');
});

test('nextDateStr：一般日期後一天', () => {
  assertEqual(nextDateStr('2026-05-12'), '2026-05-13');
});

test('nextDateStr：月底跨月', () => {
  assertEqual(nextDateStr('2026-05-31'), '2026-06-01');
});

test('nextDateStr：年末跨年', () => {
  assertEqual(nextDateStr('2025-12-31'), '2026-01-01');
});

// ===== calcOverdueDays 邏輯 =====

suite('TODO 當日 — calcOverdueDays 拖欠天數');

function calcOverdueDays(todo, targetDate) {
  const origin = todo.originDate || todo.date;
  if (!origin || origin >= targetDate) return 0;
  const a = new Date(origin + 'T00:00:00');
  const b = new Date(targetDate + 'T00:00:00');
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

test('同一天建立 → 0 天', () => {
  assertEqual(calcOverdueDays({ date: '2026-05-12' }, '2026-05-12'), 0);
});

test('拖欠 1 天', () => {
  assertEqual(calcOverdueDays({ date: '2026-05-11' }, '2026-05-12'), 1);
});

test('拖欠 3 天', () => {
  assertEqual(calcOverdueDays({ date: '2026-05-09' }, '2026-05-12'), 3);
});

test('使用 originDate 而非 date', () => {
  assertEqual(calcOverdueDays({ date: '2026-05-11', originDate: '2026-05-08' }, '2026-05-12'), 4);
});

test('targetDate 早於 originDate → 0', () => {
  assertEqual(calcOverdueDays({ date: '2026-05-15' }, '2026-05-12'), 0);
});

test('無日期 → 0', () => {
  assertEqual(calcOverdueDays({}, '2026-05-12'), 0);
});

test('跨月拖欠', () => {
  assertEqual(calcOverdueDays({ date: '2026-04-30' }, '2026-05-02'), 2);
});

// ===== 排序邏輯 =====

suite('TODO 當日 — 排序邏輯（已完成沉底）');

test('未完成在前、已完成在後', () => {
  const todos = [
    { name: 'A', done: true },
    { name: 'B', done: false },
    { name: 'C', done: true },
    { name: 'D', done: false },
  ];
  const sorted = [...todos].sort((a, b) => {
    if (a.done && !b.done) return 1;
    if (!a.done && b.done) return -1;
    return 0;
  });
  assertEqual(sorted[0].name, 'B');
  assertEqual(sorted[1].name, 'D');
  assertEqual(sorted[2].name, 'A');
  assertEqual(sorted[3].name, 'C');
});

test('全部未完成 → 維持原序', () => {
  const todos = [
    { name: 'A', done: false },
    { name: 'B', done: false },
  ];
  const sorted = [...todos].sort((a, b) => {
    if (a.done && !b.done) return 1;
    if (!a.done && b.done) return -1;
    return 0;
  });
  assertEqual(sorted[0].name, 'A');
  assertEqual(sorted[1].name, 'B');
});

test('全部已完成 → 維持原序', () => {
  const todos = [
    { name: 'A', done: true },
    { name: 'B', done: true },
  ];
  const sorted = [...todos].sort((a, b) => {
    if (a.done && !b.done) return 1;
    if (!a.done && b.done) return -1;
    return 0;
  });
  assertEqual(sorted[0].name, 'A');
  assertEqual(sorted[1].name, 'B');
});

// ===== 完成度計算 =====

suite('TODO 當日 — 完成度計算');

test('空列表 → 進度 0', () => {
  const todos = [];
  const total = todos.length;
  const done = todos.filter(t => t.done).length;
  const progress = total > 0 ? done / total : 0;
  assertEqual(progress, 0);
});

test('3/5 完成 → 0.6', () => {
  const todos = [
    { done: true }, { done: true }, { done: true },
    { done: false }, { done: false },
  ];
  const total = todos.length;
  const done = todos.filter(t => t.done).length;
  const progress = total > 0 ? done / total : 0;
  assertEqual(progress, 0.6);
});

test('全部完成 → 1', () => {
  const todos = [
    { done: true }, { done: true }, { done: true },
  ];
  const total = todos.length;
  const done = todos.filter(t => t.done).length;
  const progress = total > 0 ? done / total : 0;
  assertEqual(progress, 1);
});

// ===== 急迫標前綴邏輯 =====

suite('TODO 當日 — 急迫標前綴');

test('拖欠 1 天 → 1 個 !', () => {
  const overdueDays = 1;
  const prefix = '!'.repeat(overdueDays);
  const baseName = '做運動';
  assertEqual(prefix + baseName, '!做運動');
});

test('拖欠 3 天 → 3 個 !', () => {
  const overdueDays = 3;
  const prefix = '!'.repeat(overdueDays);
  const baseName = '做運動';
  assertEqual(prefix + baseName, '!!!做運動');
});

test('去掉原有 ! 前綴再重新計算', () => {
  const name = '!!做運動';
  const baseName = name.replace(/^!+/, '');
  assertEqual(baseName, '做運動');
  const newPrefix = '!!!';
  assertEqual(newPrefix + baseName, '!!!做運動');
});

test('沒有 ! 前綴的名稱不受影響', () => {
  const name = '做運動';
  const baseName = name.replace(/^!+/, '');
  assertEqual(baseName, '做運動');
});
