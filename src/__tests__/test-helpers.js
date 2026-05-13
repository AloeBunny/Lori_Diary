// 小蘿日誌 — helpers 工具函式測試

import { suite, test, assert, assertEqual } from './test-runner.js';
import { todayStr, formatTime, pseudo, heatColor, HEAT_HUES, LORI_FACES, randomLoriFace } from '../utils/helpers.js';

suite('helpers — todayStr');

test('todayStr 格式正確', () => {
  const str = todayStr();
  assert(/^\d{4}-\d{2}-\d{2}$/.test(str), `格式應為 YYYY-MM-DD，得到 ${str}`);
});

suite('helpers — formatTime');

test('formatTime(0) = "00:00"', () => {
  assertEqual(formatTime(0), '00:00');
});

test('formatTime(61) = "01:01"', () => {
  assertEqual(formatTime(61), '01:01');
});

test('formatTime(3599) = "59:59"', () => {
  assertEqual(formatTime(3599), '59:59');
});

test('formatTime(300) = "05:00"', () => {
  assertEqual(formatTime(300), '05:00');
});

suite('helpers — pseudo 偽隨機');

test('pseudo 回傳 0~1 之間', () => {
  for (let i = 0; i < 100; i++) {
    const v = pseudo(i);
    assert(v >= 0 && v < 1, `pseudo(${i}) = ${v} 應在 [0,1)`);
  }
});

test('pseudo 同 seed 同結果', () => {
  assertEqual(pseudo(42), pseudo(42), 'pseudo(42) 應每次相同');
});

suite('helpers — heatColor');

test('heatColor 回傳有效色碼', () => {
  for (let i = 0; i < 50; i++) {
    const c = heatColor(i);
    assert(c.startsWith('#'), `heatColor(${i}) = ${c} 應以 # 開頭`);
    assert(c.length === 7, `色碼長度應為 7`);
  }
});

test('HEAT_HUES 有 9 個色相', () => {
  assertEqual(HEAT_HUES.length, 9);
});

test('每個色相有 5 階', () => {
  HEAT_HUES.forEach((hue, i) => {
    assertEqual(hue.length, 5, `HEAT_HUES[${i}] 應有 5 階`);
  });
});

suite('helpers — LORI_FACES');

test('至少有 4 個表情', () => {
  assert(LORI_FACES.length >= 4, `至少 4 個，得到 ${LORI_FACES.length}`);
});

test('randomLoriFace 回傳字串', () => {
  const face = randomLoriFace();
  assert(typeof face === 'string', '應回傳字串');
  assert(face.length > 0, '不應為空字串');
});
