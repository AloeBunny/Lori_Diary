// 小蘿日誌 — 進度明細（Screen 1110）單元測試
// 測試純邏輯函式：formatDateDisplay（已移至 helpers.js）

import { suite, test, assert, assertEqual } from './test-runner.js';
import { formatDateDisplay } from '../utils/helpers.js';

suite('ProgressDetail — formatDateDisplay 日期格式化');

test('2026-05-12 格式正確（星期二）', () => {
  const result = formatDateDisplay('2026-05-12');
  assert(result.includes('2026'), '應包含年份');
  assert(result.includes('5月'), '應包含月份');
  assert(result.includes('12日'), '應包含日期');
  assert(result.includes('星期二'), '應包含星期二');
});

test('2026-01-01 格式正確（星期四）', () => {
  const result = formatDateDisplay('2026-01-01');
  assert(result.includes('2026'), '應包含年份');
  assert(result.includes('1月'), '應包含月份');
  assert(result.includes('1日'), '應包含日期');
  assert(result.includes('星期四'), '應包含星期四');
});

test('2026-12-31 格式正確（星期四）', () => {
  const result = formatDateDisplay('2026-12-31');
  assert(result.includes('2026'), '應包含年份');
  assert(result.includes('12月'), '應包含月份');
  assert(result.includes('31日'), '應包含日期');
  assert(result.includes('星期四'), '應包含星期四');
});

test('2026-03-01 星期日格式正確', () => {
  const result = formatDateDisplay('2026-03-01');
  assert(result.includes('星期日'), '應包含星期日');
});

test('格式包含分隔符號 ·', () => {
  const result = formatDateDisplay('2026-05-12');
  assert(result.includes(' · '), '應包含分隔符 ·');
});

test('回傳型態為字串', () => {
  const result = formatDateDisplay('2026-05-12');
  assertEqual(typeof result, 'string');
  assert(result.length > 0, '不應為空字串');
});

test('完整格式比對', () => {
  const result = formatDateDisplay('2026-05-12');
  assertEqual(result, '2026 · 5月 12日 · 星期二');
});
