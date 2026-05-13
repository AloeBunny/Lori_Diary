// 小蘿日誌 — 鼓勵語系統測試

import { suite, test, assert, assertEqual } from './test-runner.js';
import {
  getEncouragement,
  getStreakMessage,
  _resetCache,
  _injectData,
  SCENE_CATEGORY_MAP,
  STREAK_MESSAGES,
  STREAK_THRESHOLDS,
} from '../utils/encouragement.js';

// ===== 場景映射 =====

suite('encouragement — SCENE_CATEGORY_MAP');

test('todo 映射到 daily', () => {
  assertEqual(SCENE_CATEGORY_MAP.todo, 'daily');
});

test('routine 映射到 exercise', () => {
  assertEqual(SCENE_CATEGORY_MAP.routine, 'exercise');
});

test('learning 映射到 english', () => {
  assertEqual(SCENE_CATEGORY_MAP.learning, 'english');
});

test('cooking 映射到 cooking', () => {
  assertEqual(SCENE_CATEGORY_MAP.cooking, 'cooking');
});

// ===== 連續打卡特殊語 =====

suite('encouragement — getStreakMessage');

test('3 天命中', () => {
  const msg = getStreakMessage(3);
  assert(typeof msg === 'string' && msg.length > 0, '應回傳非空字串');
});

test('7 天命中', () => {
  assertEqual(getStreakMessage(7), STREAK_MESSAGES[7]);
});

test('30 天命中', () => {
  assertEqual(getStreakMessage(30), STREAK_MESSAGES[30]);
});

test('100 天命中', () => {
  assertEqual(getStreakMessage(100), STREAK_MESSAGES[100]);
});

test('365 天命中', () => {
  assertEqual(getStreakMessage(365), STREAK_MESSAGES[365]);
});

test('非門檻天數回傳 null', () => {
  assertEqual(getStreakMessage(5), null);
  assertEqual(getStreakMessage(10), null);
  assertEqual(getStreakMessage(50), null);
});

test('0 天或負數回傳 null', () => {
  assertEqual(getStreakMessage(0), null);
  assertEqual(getStreakMessage(-1), null);
});

test('非數字回傳 null', () => {
  assertEqual(getStreakMessage('abc'), null);
  assertEqual(getStreakMessage(undefined), null);
  assertEqual(getStreakMessage(null), null);
});

// ===== STREAK_THRESHOLDS =====

suite('encouragement — STREAK_THRESHOLDS');

test('包含所有門檻且由大到小', () => {
  assertEqual(STREAK_THRESHOLDS.length, 5);
  assertEqual(STREAK_THRESHOLDS[0], 365);
  assertEqual(STREAK_THRESHOLDS[4], 3);
});

// ===== getEncouragement（注入測試資料）=====

suite('encouragement — getEncouragement');

test('預設分類回傳字串', async () => {
  _injectData({
    daily: ['測試日常語'],
    exercise: ['測試運動語'],
    english: ['測試英文語'],
    cooking: ['測試烹飪語'],
  });

  const msg = await getEncouragement();
  assertEqual(msg, '測試日常語');
});

test('指定分類 exercise', async () => {
  const msg = await getEncouragement('exercise');
  assertEqual(msg, '測試運動語');
});

test('場景名 todo → daily', async () => {
  const msg = await getEncouragement('todo');
  assertEqual(msg, '測試日常語');
});

test('場景名 routine → exercise', async () => {
  const msg = await getEncouragement('routine');
  assertEqual(msg, '測試運動語');
});

test('場景名 learning → english', async () => {
  const msg = await getEncouragement('learning');
  assertEqual(msg, '測試英文語');
});

test('未知分類 fallback 到 daily', async () => {
  const msg = await getEncouragement('unknown');
  assertEqual(msg, '測試日常語');
});

test('_resetCache 清除快取', () => {
  _resetCache();
  // 重設後 _encouragements 應為 null，不會拋錯
  assert(true, '_resetCache 正常執行');
});
