// 小蘿日誌 — DateStackRow 元件單元測試
// 測試背景色計算邏輯

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('DateStackRow — 背景色計算');

/**
 * 複製 _calcBgColor 邏輯進行測試
 */
function calcBgColor(percent) {
  const minOpacity = 0.14;
  const maxOpacity = 0.55;
  const opacity = minOpacity + (maxOpacity - minOpacity) * percent;
  return `rgba(168,216,190,${opacity.toFixed(2)})`;
}

test('完成度 0% → 最低透明度 0.14', () => {
  assertEqual(calcBgColor(0), 'rgba(168,216,190,0.14)');
});

test('完成度 100% → 最高透明度 0.55', () => {
  assertEqual(calcBgColor(1), 'rgba(168,216,190,0.55)');
});

test('完成度 50% → 中間透明度', () => {
  const result = calcBgColor(0.5);
  // 0.14 + (0.55 - 0.14) * 0.5 = 0.14 + 0.205 = 0.345
  assertEqual(result, 'rgba(168,216,190,0.35)');
});

test('完成度接近 0 → 接近 0.14', () => {
  const result = calcBgColor(0.01);
  // 0.14 + 0.41 * 0.01 = 0.1441
  assertEqual(result, 'rgba(168,216,190,0.14)');
});

// ===== TODO 歷史 — 格式化函式 =====

suite('TODO 歷史 — 格式化函式');

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatHistoryLabel(dateStr, isToday) {
  const d = new Date(dateStr + 'T00:00:00');
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEK_DAYS[d.getDay()];
  if (isToday) {
    return `今日 · ${m}月 ${day} (${w})`;
  }
  return `${m}月 ${day} (${w})`;
}

function formatSub(done, total) {
  if (total === 0) return '無待辦';
  let text = `${done} / ${total} 完成`;
  if (done === total) text += ' · 滿勾';
  else if (done === 0) text += ' · 全跳過';
  return text;
}

test('formatHistoryLabel：今日', () => {
  // 2026-05-12 是星期二
  assertEqual(formatHistoryLabel('2026-05-12', true), '今日 · 5月 12 (二)');
});

test('formatHistoryLabel：非今日', () => {
  assertEqual(formatHistoryLabel('2026-05-11', false), '5月 11 (一)');
});

test('formatSub：有完成', () => {
  assertEqual(formatSub(3, 5), '3 / 5 完成');
});

test('formatSub：滿勾', () => {
  assertEqual(formatSub(5, 5), '5 / 5 完成 · 滿勾');
});

test('formatSub：全跳過', () => {
  assertEqual(formatSub(0, 5), '0 / 5 完成 · 全跳過');
});

test('formatSub：無待辦', () => {
  assertEqual(formatSub(0, 0), '無待辦');
});
