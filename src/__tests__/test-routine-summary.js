// 小蘿日誌 — 完成摘要頁（Screen 1302）單元測試
// 測試純邏輯：完成百分比計算、跳過 step 過濾、積分規則

import { suite, test, assert, assertEqual, assertDeepEqual } from './test-runner.js';

// ===== 積分函式複製 =====

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

// ===== 完成百分比計算 =====

suite('完成摘要 — 完成百分比計算');

test('8/11 = 73%', () => {
  const pct = Math.round((8 / 11) * 100);
  assertEqual(pct, 73);
});

test('0/10 = 0%', () => {
  const pct = Math.round((0 / 10) * 100);
  assertEqual(pct, 0);
});

test('10/10 = 100%', () => {
  const pct = Math.round((10 / 10) * 100);
  assertEqual(pct, 100);
});

test('3/7 = 43%', () => {
  const pct = Math.round((3 / 7) * 100);
  assertEqual(pct, 43);
});

// ===== 跳過 step 過濾 =====

suite('完成摘要 — 跳過 step 過濾');

test('找出所有 skipped step', () => {
  const results = ['completed', 'skipped', 'completed', 'skipped', 'completed'];
  const steps = [
    { s_name: 'A', s_time: 60 },
    { s_name: 'B', s_time: 120 },
    { s_name: 'C', s_time: 30 },
    { s_name: 'D', s_time: 90 },
    { s_name: 'E', s_time: 45 },
  ];
  const skipped = [];
  results.forEach((r, i) => {
    if (r === 'skipped') skipped.push({ ...steps[i], idx: i });
  });
  assertEqual(skipped.length, 2);
  assertEqual(skipped[0].s_name, 'B');
  assertEqual(skipped[0].idx, 1);
  assertEqual(skipped[1].s_name, 'D');
  assertEqual(skipped[1].idx, 3);
});

test('沒有跳過 → 空陣列', () => {
  const results = ['completed', 'completed', 'completed'];
  const skipped = results.filter(r => r === 'skipped');
  assertEqual(skipped.length, 0);
});

test('全部跳過', () => {
  const results = ['skipped', 'skipped', 'skipped'];
  const skipped = results.filter(r => r === 'skipped');
  assertEqual(skipped.length, 3);
});

// ===== 積分規則邊界測試 =====

suite('完成摘要 — 積分規則邊界測試');

test('screen_spec 積分表：0% = 0', () => {
  assertEqual(calcRoutineCarrots(0, 10), 0);
});

test('screen_spec 積分表：1% = 1', () => {
  // 1/100 = 1%
  assertEqual(calcRoutineCarrots(1, 100), 1);
});

test('screen_spec 積分表：20% = 1', () => {
  assertEqual(calcRoutineCarrots(20, 100), 1);
});

test('screen_spec 積分表：21% = 2', () => {
  assertEqual(calcRoutineCarrots(21, 100), 2);
});

test('screen_spec 積分表：40% = 2', () => {
  assertEqual(calcRoutineCarrots(40, 100), 2);
});

test('screen_spec 積分表：41% = 3', () => {
  assertEqual(calcRoutineCarrots(41, 100), 3);
});

test('screen_spec 積分表：60% = 3', () => {
  assertEqual(calcRoutineCarrots(60, 100), 3);
});

test('screen_spec 積分表：61% = 4', () => {
  assertEqual(calcRoutineCarrots(61, 100), 4);
});

test('screen_spec 積分表：80% = 4', () => {
  assertEqual(calcRoutineCarrots(80, 100), 4);
});

test('screen_spec 積分表：81% = 5', () => {
  assertEqual(calcRoutineCarrots(81, 100), 5);
});

test('screen_spec 積分表：100% = 5', () => {
  assertEqual(calcRoutineCarrots(100, 100), 5);
});

// ===== 重做後更新結果 =====

suite('完成摘要 — 重做後更新結果');

test('重做 skipped step 變 completed → 更新統計', () => {
  const results = ['completed', 'skipped', 'completed', 'skipped', 'completed'];
  const total = results.length;

  // 重做前：3 completed / 5 total
  let completed = results.filter(r => r === 'completed').length;
  assertEqual(completed, 3);
  assertEqual(calcRoutineCarrots(completed, total), 3); // 60% → 3

  // 重做 index 1
  results[1] = 'completed';
  completed = results.filter(r => r === 'completed').length;
  assertEqual(completed, 4);
  assertEqual(calcRoutineCarrots(completed, total), 4); // 80% → 4

  // 重做 index 3
  results[3] = 'completed';
  completed = results.filter(r => r === 'completed').length;
  assertEqual(completed, 5);
  assertEqual(calcRoutineCarrots(completed, total), 5); // 100% → 5
});

test('重做後百分比更新', () => {
  const results = ['completed', 'skipped', 'skipped'];
  // 1/3 ≈ 33%
  let pct = Math.round((1 / 3) * 100);
  assertEqual(pct, 33);

  results[1] = 'completed';
  pct = Math.round((2 / 3) * 100);
  assertEqual(pct, 67);

  results[2] = 'completed';
  pct = Math.round((3 / 3) * 100);
  assertEqual(pct, 100);
});

// ===== 從 routine-summary.js 提取的 F4/F5 純邏輯 =====
// 避免 DOM / sessionStorage / DB 依賴，只測計算與分支

/**
 * 從 _loadSummary 提取的 bonus 決策邏輯
 * @param {object} resultData - sessionStorage 中的結果資料
 * @param {function} rng - 隨機數產生器（注入以方便測試）
 * @returns {number} bonusCarrots
 */
function decideBonusCarrots(resultData, rng = Math.random) {
  if (resultData._settled && resultData._bonusCarrots !== undefined) {
    return resultData._bonusCarrots;
  }
  if (rng() < 0.3) {
    return Math.floor(rng() * 3) + 1;
  }
  return 0;
}

/**
 * 從 cleanup 函式提取的 sessionStorage 清除邏輯
 * @param {object} storage - 模擬 sessionStorage（key-value map）
 * @returns {object} 清除後的 storage 狀態
 */
function simulateCleanup(storage) {
  const result = { ...storage };
  if (!result['routine_redo_pending']) {
    delete result['routine_result'];
    delete result['routine_redo'];
  }
  delete result['routine_redo_pending'];
  return result;
}

/**
 * 判斷是否應執行自動打卡
 * @param {object} resultData
 * @returns {boolean}
 */
function shouldAutoComplete(resultData) {
  return !resultData._settled;
}

// ===== F5：_settled 標記邏輯 =====

suite('完成摘要 — F5 _settled bonus 標記');

test('已打卡（_settled=true）且有 _bonusCarrots → 使用存下的值', () => {
  const data = { _settled: true, _bonusCarrots: 2 };
  const bonus = decideBonusCarrots(data, () => 0.1); // rng 不該被用到
  assertEqual(bonus, 2);
});

test('已打卡（_settled=true）且 _bonusCarrots=0 → 使用存下的 0', () => {
  const data = { _settled: true, _bonusCarrots: 0 };
  const bonus = decideBonusCarrots(data, () => 0.1);
  assertEqual(bonus, 0);
});

test('已打卡但 _bonusCarrots=undefined → 重新擲骰', () => {
  const data = { _settled: true };
  // rng 回傳 0.1 < 0.3 → 觸發 bonus
  const bonus = decideBonusCarrots(data, () => 0.1);
  assert(bonus >= 1 && bonus <= 3, `bonus 應在 1-3，得到 ${bonus}`);
});

test('未打卡（_settled=false）→ 用 rng 決定', () => {
  const data = { _settled: false };
  const bonus = decideBonusCarrots(data, () => 0.1);
  assert(bonus >= 1 && bonus <= 3, `bonus 應在 1-3，得到 ${bonus}`);
});

test('未打卡且無 _settled 欄位 → 用 rng 決定', () => {
  const data = {};
  const bonus = decideBonusCarrots(data, () => 0.5); // 0.5 >= 0.3 → 無 bonus
  assertEqual(bonus, 0);
});

// ===== F5：bonus 計算（統計測試）=====

suite('完成摘要 — F5 bonus 統計分布');

test('1000 次擲骰：觸發率約 30%（20%-40% 容許範圍）', () => {
  let triggerCount = 0;
  const N = 1000;
  for (let i = 0; i < N; i++) {
    const data = {};
    const bonus = decideBonusCarrots(data);
    if (bonus > 0) triggerCount++;
  }
  const rate = triggerCount / N;
  assert(rate >= 0.20 && rate <= 0.40,
    `觸發率 ${(rate * 100).toFixed(1)}% 超出 20%-40% 容許範圍`);
});

test('1000 次強制觸發：值域全在 1-3，三個值都出現', () => {
  const seen = new Set();
  let outOfRange = 0;
  for (let i = 0; i < 1000; i++) {
    const data = {};
    let callCount = 0;
    const bonus = decideBonusCarrots(data, () => {
      callCount++;
      if (callCount === 1) return 0.1; // 強制觸發
      return Math.random();            // 決定值
    });
    if (bonus > 0) {
      seen.add(bonus);
      if (bonus < 1 || bonus > 3) outOfRange++;
    }
  }
  assertEqual(outOfRange, 0, `有 ${outOfRange} 次超出範圍`);
  assert(seen.has(1), '應該出現過 bonus=1');
  assert(seen.has(2), '應該出現過 bonus=2');
  assert(seen.has(3), '應該出現過 bonus=3');
  assert(!seen.has(4), '不應出現 bonus=4');
});

test('rng 固定 0.29（剛好觸發）→ bonus = 1', () => {
  const data = {};
  const bonus = decideBonusCarrots(data, () => 0.29);
  // 第一次 0.29 < 0.3 → 觸發；第二次 floor(0.29*3)+1 = 1
  assertEqual(bonus, 1);
});

test('rng 強制觸發 + 0.99 → bonus = 3', () => {
  const data = {};
  let callCount = 0;
  const bonus = decideBonusCarrots(data, () => {
    callCount++;
    if (callCount === 1) return 0.1;
    return 0.99; // floor(0.99*3)+1 = 3
  });
  assertEqual(bonus, 3);
});

test('rng 固定 0.3（剛好不觸發）→ bonus = 0', () => {
  const data = {};
  const bonus = decideBonusCarrots(data, () => 0.3);
  assertEqual(bonus, 0);
});

// ===== F5：totalCarrots 合計 =====

suite('完成摘要 — F5 totalCarrots 合計');

test('base 5 + bonus 3 = 8', () => {
  const base = calcRoutineCarrots(10, 10); // 100% → 5
  assertEqual(base + 3, 8);
});

test('base 0 + bonus 2 = 2（全跳過但有 bonus）', () => {
  const base = calcRoutineCarrots(0, 5); // 0% → 0
  assertEqual(base + 2, 2);
});

test('base 3 + bonus 0 = 3（無 bonus）', () => {
  const base = calcRoutineCarrots(3, 5); // 60% → 3
  assertEqual(base + 0, 3);
});

// ===== F4：自動完成守衛 =====

suite('完成摘要 — F4 自動完成守衛');

test('未打卡（_settled 不存在）→ 應執行自動打卡', () => {
  assertEqual(shouldAutoComplete({}), true);
});

test('未打卡（_settled=false）→ 應執行自動打卡', () => {
  assertEqual(shouldAutoComplete({ _settled: false }), true);
});

test('已打卡（_settled=true）→ 不應重複打卡', () => {
  assertEqual(shouldAutoComplete({ _settled: true }), false);
});

test('_settled=0（falsy）→ 應執行自動打卡', () => {
  assertEqual(shouldAutoComplete({ _settled: 0 }), true);
});

test('_settled=1（truthy）→ 不應重複打卡', () => {
  assertEqual(shouldAutoComplete({ _settled: 1 }), false);
});

// ===== cleanup 清除邏輯 =====

suite('完成摘要 — cleanup 清除邏輯');

test('無 redo_pending → 清除 routine_result 和 routine_redo', () => {
  const before = {
    'routine_result': '{"some":"data"}',
    'routine_redo': '{"step":"X"}',
  };
  const after = simulateCleanup(before);
  assertEqual(after['routine_result'], undefined);
  assertEqual(after['routine_redo'], undefined);
  assertEqual(after['routine_redo_pending'], undefined);
});

test('有 redo_pending → 保留 routine_result 和 routine_redo', () => {
  const before = {
    'routine_result': '{"some":"data"}',
    'routine_redo': '{"step":"X"}',
    'routine_redo_pending': '1',
  };
  const after = simulateCleanup(before);
  assertEqual(after['routine_result'], '{"some":"data"}');
  assertEqual(after['routine_redo'], '{"step":"X"}');
  assertEqual(after['routine_redo_pending'], undefined);
});

test('只有 redo_pending（無其他資料）→ 清除 redo_pending', () => {
  const before = { 'routine_redo_pending': '1' };
  const after = simulateCleanup(before);
  assertEqual(after['routine_redo_pending'], undefined);
});

test('空 storage → 不出錯', () => {
  const after = simulateCleanup({});
  assertEqual(Object.keys(after).length, 0);
});

test('redo_pending=""（空字串 = falsy）→ 清除 result 和 redo', () => {
  const before = {
    'routine_result': '{"data":1}',
    'routine_redo': '{"s":"Y"}',
    'routine_redo_pending': '',
  };
  const after = simulateCleanup(before);
  assertEqual(after['routine_result'], undefined);
  assertEqual(after['routine_redo'], undefined);
});

// ===== redo 按鈕寫入資料結構 =====

suite('完成摘要 — redo 按鈕資料結構');

test('redo 資料保留 _settled 和 _bonusCarrots', () => {
  const resultData = { _settled: true };
  const bonusCarrots = 2;
  const currentData = {
    blockIndex: 0,
    blockName: '晨間流程',
    results: ['completed', 'skipped', 'completed'],
    steps: [
      { s_name: 'A', s_time: 60 },
      { s_name: 'B', s_time: 120 },
      { s_name: 'C', s_time: 30 },
    ],
    elapsedSeconds: 180,
    _settled: resultData._settled || false,
    _bonusCarrots: bonusCarrots,
  };
  assertEqual(currentData._settled, true);
  assertEqual(currentData._bonusCarrots, 2);
  assertEqual(currentData.results.length, 3);
});

test('redo 資料未打卡時 _settled 為 false', () => {
  const resultData = {};
  const currentData = {
    blockIndex: 1,
    blockName: 'test',
    results: [],
    steps: [],
    elapsedSeconds: 0,
    _settled: resultData._settled || false,
    _bonusCarrots: 0,
  };
  assertEqual(currentData._settled, false);
});

// ===== blockRecord 結構驗證 =====

suite('完成摘要 — blockRecord 結構驗證');

test('blockRecord 包含所有必要欄位', () => {
  const blockRecord = {
    blockIndex: 0,
    blockName: '晨間流程',
    completionPct: 0.8,
    completedCount: 4,
    totalCount: 5,
    carrots: 4,
    bonusCarrots: 1,
    totalCarrots: 5,
    elapsedSeconds: 300,
    results: ['completed', 'completed', 'completed', 'completed', 'skipped'],
  };
  const requiredKeys = [
    'blockIndex', 'blockName', 'completionPct',
    'completedCount', 'totalCount',
    'carrots', 'bonusCarrots', 'totalCarrots',
    'elapsedSeconds', 'results',
  ];
  for (const key of requiredKeys) {
    assert(key in blockRecord, `缺少欄位：${key}`);
  }
  assertEqual(Object.keys(blockRecord).length, requiredKeys.length);
});

test('completionPct 是 0-1 之間的小數', () => {
  const pct = 5 > 0 ? 3 / 5 : 0;
  assert(pct >= 0 && pct <= 1, `pct 應在 0-1，得到 ${pct}`);
  assertEqual(pct, 0.6);
});

test('completionPct 全跳過 → 0', () => {
  const pct = 5 > 0 ? 0 / 5 : 0;
  assertEqual(pct, 0);
});

test('completionPct totalCount=0 → 0', () => {
  const totalCount = 0;
  const pct = totalCount > 0 ? 0 / totalCount : 0;
  assertEqual(pct, 0);
});
