// 小蘿日誌 — Step 編輯頁單元測試
// 測試 NumberStepper 邏輯 + 預覽格式化

import { suite, test, assert, assertEqual } from './test-runner.js';
import { formatTime } from '../utils/helpers.js';

suite('Step 編輯 — NumberStepper 邏輯');

// 複製 NumberStepper 的 min 邏輯
function clampMin(value, step, min) {
  return Math.max(min, value - step);
}

function clampPlus(value, step) {
  return value + step;
}

test('減到最小值不低於 min', () => {
  assertEqual(clampMin(20, 10, 10), 10);
});

test('減到 min 以下被夾住', () => {
  assertEqual(clampMin(10, 10, 10), 10);
});

test('加值正常', () => {
  assertEqual(clampPlus(60, 10), 70);
});

test('從 min 往下不會低於 min', () => {
  assertEqual(clampMin(15, 10, 10), 10);
});

suite('Step 編輯 — 預覽格式化');

test('60 秒 + 10 秒 pre-buffer → 總計 70 秒', () => {
  const time = 60;
  const pre = 10;
  const total = time + pre;
  assertEqual(total, 70);
  assertEqual(formatTime(total), '01:10');
});

test('300 秒 → 05:00', () => {
  assertEqual(formatTime(300), '05:00');
});

test('10 秒（最小值）→ 00:10', () => {
  assertEqual(formatTime(10), '00:10');
});

test('0 秒 → 00:00', () => {
  assertEqual(formatTime(0), '00:00');
});

test('3600 秒 → 60:00', () => {
  assertEqual(formatTime(3600), '60:00');
});
