// 小蘿日誌 — 計時進行頁（Screen 1301）單元測試
// 測試純邏輯：計時器狀態、積分計算、step 流程

import { suite, test, assert, assertEqual, assertDeepEqual } from './test-runner.js';

// ===== 從 routine-timer.js 複製純函式以避免 DOM / Web Audio 依賴 =====

function createTimerState(steps) {
  return {
    steps: steps,
    currentStepIdx: 0,
    results: steps.map(() => 'pending'),
    phase: 'prebuffer',
    remainingSeconds: 0,
    intervalId: null,
    autoCompleteTimeoutId: null,
    redoMode: false,
    redoStepIdx: -1,
    // 計時追蹤
    startedAt: null,
    elapsedSeconds: 0,
    // B1：背景計時基準點
    phaseStartedAt: null,
    phaseStartDuration: 0,
    // F1：螢幕常亮
    wakeLock: null,
    // visibilitychange 監聯器引用（供 cleanup 移除）
    _onVisibilityChange: null,
  };
}

function calcRoutineCarrots(completedCount, totalCount) {
  if (totalCount === 0) return 0;
  const pct = (completedCount / totalCount) * 100;
  if (pct <= 0) return 0;
  if (pct <= 20) return 1;
  if (pct <= 40) return 2;
  if (pct <= 60) return 3;
  if (pct <= 80) return 4;
  return 5;
}

// ===== createTimerState 測試 =====

suite('計時器 — createTimerState');

test('初始化正確', () => {
  const steps = [
    { s_name: 'A', s_time: 60, s_prebuffer: 10 },
    { s_name: 'B', s_time: 120, s_prebuffer: 15 },
  ];
  const state = createTimerState(steps);
  assertEqual(state.currentStepIdx, 0);
  assertEqual(state.phase, 'prebuffer');
  assertEqual(state.remainingSeconds, 0);
  assertEqual(state.results.length, 2);
  assertEqual(state.results[0], 'pending');
  assertEqual(state.results[1], 'pending');
  assertEqual(state.redoMode, false);
});

test('空 steps', () => {
  const state = createTimerState([]);
  assertEqual(state.steps.length, 0);
  assertEqual(state.results.length, 0);
});

test('results 不共享參照', () => {
  const steps = [{ s_name: 'A' }, { s_name: 'B' }];
  const state = createTimerState(steps);
  state.results[0] = 'completed';
  assertEqual(state.results[0], 'completed');
  assertEqual(state.results[1], 'pending');
});

// ===== calcRoutineCarrots 積分計算 =====

suite('計時器 — 積分計算（calcRoutineCarrots）');

test('0% → 0 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(0, 10), 0);
});

test('10% (1/10) → 1 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(1, 10), 1);
});

test('20% (2/10) → 1 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(2, 10), 1);
});

test('21% (3/10=30%) → 2 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(3, 10), 2);
});

test('40% (4/10) → 2 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(4, 10), 2);
});

test('50% (5/10) → 3 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(5, 10), 3);
});

test('60% (6/10) → 3 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(6, 10), 3);
});

test('70% (7/10) → 4 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(7, 10), 4);
});

test('80% (8/10) → 4 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(8, 10), 4);
});

test('90% (9/10) → 5 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(9, 10), 5);
});

test('100% (10/10) → 5 紅蘿蔔', () => {
  assertEqual(calcRoutineCarrots(10, 10), 5);
});

test('totalCount=0 → 0', () => {
  assertEqual(calcRoutineCarrots(0, 0), 0);
});

test('1/1 = 100% → 5', () => {
  assertEqual(calcRoutineCarrots(1, 1), 5);
});

test('1/5 = 20% → 1', () => {
  assertEqual(calcRoutineCarrots(1, 5), 1);
});

test('2/5 = 40% → 2', () => {
  assertEqual(calcRoutineCarrots(2, 5), 2);
});

test('3/5 = 60% → 3', () => {
  assertEqual(calcRoutineCarrots(3, 5), 3);
});

test('4/5 = 80% → 4', () => {
  assertEqual(calcRoutineCarrots(4, 5), 4);
});

test('5/5 = 100% → 5', () => {
  assertEqual(calcRoutineCarrots(5, 5), 5);
});

// ===== step 流程模擬 =====

suite('計時器 — step 流程模擬');

test('完成 step 更新 results', () => {
  const steps = [
    { s_name: 'A', s_time: 60, s_prebuffer: 10 },
    { s_name: 'B', s_time: 120, s_prebuffer: 10 },
    { s_name: 'C', s_time: 30, s_prebuffer: 10 },
  ];
  const state = createTimerState(steps);

  // 模擬完成第一個
  state.results[0] = 'completed';
  state.currentStepIdx = 1;
  assertEqual(state.results[0], 'completed');
  assertEqual(state.results[1], 'pending');

  // 模擬跳過第二個
  state.results[1] = 'skipped';
  state.currentStepIdx = 2;
  assertEqual(state.results[1], 'skipped');

  // 模擬完成第三個
  state.results[2] = 'completed';
  state.currentStepIdx = 3;

  // 統計
  const completed = state.results.filter(r => r === 'completed').length;
  const skipped = state.results.filter(r => r === 'skipped').length;
  assertEqual(completed, 2);
  assertEqual(skipped, 1);
  assertEqual(calcRoutineCarrots(completed, state.steps.length), 4); // 2/3 ≈ 67% → 4
});

test('全部跳過 → 0 紅蘿蔔', () => {
  const steps = [{ s_name: 'A' }, { s_name: 'B' }];
  const state = createTimerState(steps);
  state.results[0] = 'skipped';
  state.results[1] = 'skipped';
  const completed = state.results.filter(r => r === 'completed').length;
  assertEqual(calcRoutineCarrots(completed, state.steps.length), 0);
});

test('全部完成 → 5 紅蘿蔔', () => {
  const steps = [{ s_name: 'A' }, { s_name: 'B' }, { s_name: 'C' }];
  const state = createTimerState(steps);
  state.results[0] = 'completed';
  state.results[1] = 'completed';
  state.results[2] = 'completed';
  const completed = state.results.filter(r => r === 'completed').length;
  assertEqual(calcRoutineCarrots(completed, state.steps.length), 5);
});

// ===== pre-buffer 邏輯 =====

suite('計時器 — pre-buffer 邏輯');

test('prebuffer 最低 10 秒', () => {
  const step = { s_prebuffer: 5 };
  const actual = Math.max(step.s_prebuffer || 10, 10);
  assertEqual(actual, 10);
});

test('prebuffer 0 → 用預設 10', () => {
  const step = { s_prebuffer: 0 };
  const actual = Math.max(step.s_prebuffer || 10, 10);
  assertEqual(actual, 10);
});

test('prebuffer undefined → 用預設 10', () => {
  const step = {};
  const actual = Math.max(step.s_prebuffer || 10, 10);
  assertEqual(actual, 10);
});

test('prebuffer 15 → 15', () => {
  const step = { s_prebuffer: 15 };
  const actual = Math.max(step.s_prebuffer || 10, 10);
  assertEqual(actual, 15);
});

test('prebuffer 10 → 10（邊界）', () => {
  const step = { s_prebuffer: 10 };
  const actual = Math.max(step.s_prebuffer || 10, 10);
  assertEqual(actual, 10);
});

// ===== 完成百分比計算 =====

suite('計時器 — 完成百分比');

test('8/11 完成 ≈ 73%', () => {
  const total = 11;
  const completed = 8;
  const pct = Math.round((completed / total) * 100);
  assertEqual(pct, 73);
});

test('0/5 完成 = 0%', () => {
  const pct = Math.round((0 / 5) * 100);
  assertEqual(pct, 0);
});

test('5/5 完成 = 100%', () => {
  const pct = Math.round((5 / 5) * 100);
  assertEqual(pct, 100);
});

test('1/3 完成 ≈ 33%', () => {
  const pct = Math.round((1 / 3) * 100);
  assertEqual(pct, 33);
});

// ===== B1：背景計時修正 — 新欄位測試 =====

suite('計時器 — B1 背景計時修正');

test('phaseStartedAt 初始值為 null', () => {
  const state = createTimerState([{ s_name: 'A', s_time: 60 }]);
  assertEqual(state.phaseStartedAt, null);
});

test('phaseStartDuration 初始值為 0', () => {
  const state = createTimerState([{ s_name: 'A', s_time: 60 }]);
  assertEqual(state.phaseStartDuration, 0);
});

test('_onVisibilityChange 初始值為 null', () => {
  const state = createTimerState([{ s_name: 'A', s_time: 60 }]);
  assertEqual(state._onVisibilityChange, null);
});

test('背景計時欄位可正常賦值', () => {
  const state = createTimerState([{ s_name: 'A', s_time: 60 }]);
  const now = Date.now();
  state.phaseStartedAt = now;
  state.phaseStartDuration = 30;
  assertEqual(state.phaseStartedAt, now);
  assertEqual(state.phaseStartDuration, 30);
});

test('_onVisibilityChange 可賦值函式並清除', () => {
  const state = createTimerState([{ s_name: 'A', s_time: 60 }]);
  const handler = () => {};
  state._onVisibilityChange = handler;
  assertEqual(state._onVisibilityChange, handler);
  state._onVisibilityChange = null;
  assertEqual(state._onVisibilityChange, null);
});

// ===== F1：螢幕常亮 — 新欄位測試 =====

suite('計時器 — F1 螢幕常亮');

test('wakeLock 初始值為 null', () => {
  const state = createTimerState([{ s_name: 'A', s_time: 60 }]);
  assertEqual(state.wakeLock, null);
});

test('wakeLock 可賦值物件並清除', () => {
  const state = createTimerState([{ s_name: 'A', s_time: 60 }]);
  const fakeLock = { released: false, release() { this.released = true; } };
  state.wakeLock = fakeLock;
  assertEqual(state.wakeLock, fakeLock);
  state.wakeLock.release();
  assertEqual(fakeLock.released, true);
  state.wakeLock = null;
  assertEqual(state.wakeLock, null);
});

// ===== F3：自動跳轉 delay 邏輯 =====

suite('計時器 — F3 自動跳轉 delay 邏輯');

test('非最後一步 delay 為 3000ms', () => {
  const state = createTimerState([
    { s_name: 'A', s_time: 60 },
    { s_name: 'B', s_time: 60 },
    { s_name: 'C', s_time: 60 },
  ]);
  state.currentStepIdx = 0;
  const isLastStep = state.currentStepIdx >= state.steps.length - 1;
  const delay = isLastStep ? 5000 : 3000;
  assertEqual(delay, 3000);
});

test('最後一步 delay 為 5000ms', () => {
  const state = createTimerState([
    { s_name: 'A', s_time: 60 },
    { s_name: 'B', s_time: 60 },
    { s_name: 'C', s_time: 60 },
  ]);
  state.currentStepIdx = 2; // 最後一步 (index 2, length 3)
  const isLastStep = state.currentStepIdx >= state.steps.length - 1;
  const delay = isLastStep ? 5000 : 3000;
  assertEqual(delay, 5000);
});

test('只有一步時 delay 為 5000ms', () => {
  const state = createTimerState([{ s_name: 'A', s_time: 60 }]);
  state.currentStepIdx = 0;
  const isLastStep = state.currentStepIdx >= state.steps.length - 1;
  const delay = isLastStep ? 5000 : 3000;
  assertEqual(delay, 5000);
});

test('倒數第二步 delay 為 3000ms', () => {
  const state = createTimerState([
    { s_name: 'A', s_time: 60 },
    { s_name: 'B', s_time: 60 },
  ]);
  state.currentStepIdx = 0;
  const isLastStep = state.currentStepIdx >= state.steps.length - 1;
  const delay = isLastStep ? 5000 : 3000;
  assertEqual(delay, 3000);
});

// ===== createTimerState 結構完整性 =====

suite('計時器 — createTimerState 結構完整性');

test('所有欄位都存在', () => {
  const state = createTimerState([{ s_name: 'A', s_time: 60 }]);
  const expectedKeys = [
    'steps', 'currentStepIdx', 'results', 'phase', 'remainingSeconds',
    'intervalId', 'autoCompleteTimeoutId', 'redoMode', 'redoStepIdx',
    'startedAt', 'elapsedSeconds',
    'phaseStartedAt', 'phaseStartDuration',
    'wakeLock', '_onVisibilityChange',
  ];
  for (const key of expectedKeys) {
    assert(key in state, `缺少欄位：${key}`);
  }
});

test('欄位總數正確（無多餘欄位）', () => {
  const state = createTimerState([{ s_name: 'A' }]);
  const actualKeys = Object.keys(state);
  assertEqual(actualKeys.length, 15);
});

test('所有初始值正確', () => {
  const steps = [{ s_name: 'X', s_time: 90 }];
  const state = createTimerState(steps);
  assertEqual(state.steps, steps);
  assertEqual(state.currentStepIdx, 0);
  assertEqual(state.results.length, 1);
  assertEqual(state.results[0], 'pending');
  assertEqual(state.phase, 'prebuffer');
  assertEqual(state.remainingSeconds, 0);
  assertEqual(state.intervalId, null);
  assertEqual(state.autoCompleteTimeoutId, null);
  assertEqual(state.redoMode, false);
  assertEqual(state.redoStepIdx, -1);
  assertEqual(state.startedAt, null);
  assertEqual(state.elapsedSeconds, 0);
  assertEqual(state.phaseStartedAt, null);
  assertEqual(state.phaseStartDuration, 0);
  assertEqual(state.wakeLock, null);
  assertEqual(state._onVisibilityChange, null);
});

// ===== calcRoutineCarrots 邊界補充 =====

suite('計時器 — 積分邊界補充');

test('剛好 0% (0/5) → 0', () => {
  assertEqual(calcRoutineCarrots(0, 5), 0);
});

test('剛好 20% (1/5) → 1（邊界值）', () => {
  assertEqual(calcRoutineCarrots(1, 5), 1);
});

test('剛好超過 20% (21%) → 2', () => {
  // 3/14 ≈ 21.4%
  assertEqual(calcRoutineCarrots(3, 14), 2);
});

test('剛好 100% (7/7) → 5', () => {
  assertEqual(calcRoutineCarrots(7, 7), 5);
});

test('極大數值 100/100 → 5', () => {
  assertEqual(calcRoutineCarrots(100, 100), 5);
});

test('completedCount 超過 totalCount 仍回傳 5', () => {
  // 理論上不該發生，但確認不會壞掉
  assertEqual(calcRoutineCarrots(10, 5), 5);
});

// ===== E3：簡化模式 steps.slice(0,3) =====

suite('計時器 — E3 簡化模式 steps.slice(0,3)');

test('簡化模式下 steps 被截斷為前 3 個', () => {
  const allSteps = [
    { s_name: 'A', s_time: 60, s_index: 1 },
    { s_name: 'B', s_time: 120, s_index: 2 },
    { s_name: 'C', s_time: 30, s_index: 3 },
    { s_name: 'D', s_time: 90, s_index: 4 },
    { s_name: 'E', s_time: 45, s_index: 5 },
  ];
  const simplifiedMode = true;
  const steps = simplifiedMode ? allSteps.slice(0, 3) : allSteps;
  assertEqual(steps.length, 3);
  assertEqual(steps[0].s_name, 'A');
  assertEqual(steps[1].s_name, 'B');
  assertEqual(steps[2].s_name, 'C');
});

test('非簡化模式保留全部 steps', () => {
  const allSteps = [
    { s_name: 'A', s_time: 60 },
    { s_name: 'B', s_time: 120 },
    { s_name: 'C', s_time: 30 },
    { s_name: 'D', s_time: 90 },
    { s_name: 'E', s_time: 45 },
  ];
  const simplifiedMode = false;
  const steps = simplifiedMode ? allSteps.slice(0, 3) : allSteps;
  assertEqual(steps.length, 5);
});

test('簡化模式下 createTimerState 只有 3 個 results', () => {
  const allSteps = [
    { s_name: 'A', s_time: 60 },
    { s_name: 'B', s_time: 120 },
    { s_name: 'C', s_time: 30 },
    { s_name: 'D', s_time: 90 },
    { s_name: 'E', s_time: 45 },
  ];
  const steps = allSteps.slice(0, 3);
  const state = createTimerState(steps);
  assertEqual(state.steps.length, 3);
  assertEqual(state.results.length, 3);
  assertEqual(state.results[0], 'pending');
  assertEqual(state.results[2], 'pending');
});

test('簡化模式全部完成 → 3/3 = 100% → 5 紅蘿蔔', () => {
  const steps = [
    { s_name: 'A', s_time: 60 },
    { s_name: 'B', s_time: 120 },
    { s_name: 'C', s_time: 30 },
  ];
  const state = createTimerState(steps);
  state.results[0] = 'completed';
  state.results[1] = 'completed';
  state.results[2] = 'completed';
  const completed = state.results.filter(r => r === 'completed').length;
  assertEqual(calcRoutineCarrots(completed, state.steps.length), 5);
});

test('resultData.simplified 標記為 true', () => {
  // 從 routine-timer.js _loadAndStart 結尾：state.simplified = simplifiedMode
  const resultData = {
    blockIndex: 1,
    blockName: '晨間 Routine',
    results: ['completed', 'completed', 'skipped'],
    steps: [{ s_name: 'A' }, { s_name: 'B' }, { s_name: 'C' }],
    elapsedSeconds: 120,
    simplified: true,
  };
  assertEqual(resultData.simplified, true);
  assertEqual(resultData.steps.length, 3);
});
