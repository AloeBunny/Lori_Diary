// 小蘿日誌 — S1a/S1b 細節頁面存在性與 export 驗證
// 確認 routine-detail.js 和 learning-detail.js 語法正確且 export 正確函式

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('S1a — routine-detail.js');

test('檔案可被 import（語法正確）', async () => {
  let imported = false;
  let err = null;
  try {
    await import('../screens/routine-detail.js');
    imported = true;
  } catch (e) {
    err = e;
  }
  assert(imported, `import 失敗：${err?.message || err}`);
});

test('export renderRoutineDetail 函式', async () => {
  const mod = await import('../screens/routine-detail.js');
  assert(typeof mod.renderRoutineDetail === 'function',
    'renderRoutineDetail 應被 export 為函式');
});

suite('S1b — learning-detail.js');

test('檔案可被 import（語法正確）', async () => {
  let imported = false;
  let err = null;
  try {
    await import('../screens/learning-detail.js');
    imported = true;
  } catch (e) {
    err = e;
  }
  assert(imported, `import 失敗：${err?.message || err}`);
});

test('export renderLearningDetail 函式', async () => {
  const mod = await import('../screens/learning-detail.js');
  assert(typeof mod.renderLearningDetail === 'function',
    'renderLearningDetail 應被 export 為函式');
});
