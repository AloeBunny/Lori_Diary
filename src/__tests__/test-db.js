// 小蘿日誌 — DB 模組測試
// 測試 schema 定義和常數正確性（不需要真實 IndexedDB）

import { suite, test, assert, assertEqual, assertDeepEqual } from './test-runner.js';
import { DB_NAME, DB_VERSION, DEFAULT_BLOCKS, DEFAULT_STEPS } from '../db.js';

suite('DB — 常數');

test('DB_NAME 為 lori_diary_db', () => {
  assertEqual(DB_NAME, 'lori_diary_db');
});

test('DB_VERSION 為 2', () => {
  assertEqual(DB_VERSION, 2);
});

suite('DB — 預設 Block');

test('有 2 個預設 Block', () => {
  assertEqual(DEFAULT_BLOCKS.length, 2);
});

test('晨間 Block 設定正確', () => {
  const morning = DEFAULT_BLOCKS[0];
  assertEqual(morning.b_index, 1);
  assertEqual(morning.b_name, '晨間 Routine');
  assertEqual(morning.b_rise, '0500');
  assertEqual(morning.b_start, '0530');
  assertEqual(morning.b_set, '0730');
});

test('晚間 Block 設定正確', () => {
  const evening = DEFAULT_BLOCKS[1];
  assertEqual(evening.b_index, 2);
  assertEqual(evening.b_name, '晚間 Routine');
  assertEqual(evening.b_rise, '1800');
  assertEqual(evening.b_start, '1830');
  assertEqual(evening.b_set, '2230');
});

suite('DB — 預設 Step');

test('晨間 Step 有 10 個', () => {
  const morningSteps = DEFAULT_STEPS.filter(s => s.b_index === 1);
  assertEqual(morningSteps.length, 10);
});

test('晚間 Step 有 7 個', () => {
  const eveningSteps = DEFAULT_STEPS.filter(s => s.b_index === 2);
  assertEqual(eveningSteps.length, 7);
});

test('所有 Step 的 s_prebuffer >= 10', () => {
  DEFAULT_STEPS.forEach(s => {
    assert(s.s_prebuffer >= 10, `step ${s.s_name} 的 prebuffer 應 >= 10`);
  });
});

test('Step s_index 在同一 Block 內不重複', () => {
  const groups = {};
  DEFAULT_STEPS.forEach(s => {
    const key = s.b_index;
    if (!groups[key]) groups[key] = new Set();
    assert(!groups[key].has(s.s_index), `Block ${key} 內 s_index ${s.s_index} 重複`);
    groups[key].add(s.s_index);
  });
});

test('晨間第一步是賴床', () => {
  const first = DEFAULT_STEPS.find(s => s.b_index === 1 && s.s_index === 1);
  assertEqual(first.s_name, '賴床');
  assertEqual(first.s_time, 300); // 5 min
});

test('晨間運動 30 min', () => {
  const step = DEFAULT_STEPS.find(s => s.b_index === 1 && s.s_index === 3);
  assertEqual(step.s_name, '運動');
  assertEqual(step.s_time, 1800);
});
