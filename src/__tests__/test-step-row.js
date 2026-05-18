// 小蘿日誌 — StepRow 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('StepRow — 模組匯出');

test('step-row.js 可被匯入', async () => {
  try {
    const mod = await import('../components/step-row.js');
    assert(typeof mod.createStepRow === 'function', 'createStepRow 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('StepRow — 參數介面');

test('createStepRow 預設參數不報錯', async () => {
  try {
    const { createStepRow } = await import('../components/step-row.js');
    const el = createStepRow();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-step-row-wrap'), '應有 lori-step-row-wrap class');
    assert(el.querySelector('.lori-step-row') !== null, '應有 lori-step-row 子元素');
    assert(el.querySelector('.lori-card') !== null, '應有 lori-card 子元素');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createStepRow 顯示序號和名稱', async () => {
  try {
    const { createStepRow } = await import('../components/step-row.js');
    const el = createStepRow({
      step: { s_index: 3, s_name: '刷牙洗臉', s_time: 600, s_prebuffer: 10 },
    });
    const idxEl = el.querySelector('.lori-step-row__idx');
    assert(idxEl !== null, '應有序號元素');
    assertEqual(idxEl.textContent, '3');
    const nameEl = el.querySelector('.lori-step-row__name');
    assert(nameEl !== null, '應有名稱元素');
    assertEqual(nameEl.textContent, '刷牙洗臉');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createStepRow 時間格式化為 MM:SS', async () => {
  try {
    const { createStepRow } = await import('../components/step-row.js');
    const el = createStepRow({
      step: { s_index: 1, s_name: '運動', s_time: 1800, s_prebuffer: 10 },
    });
    const timeEl = el.querySelector('.lori-step-row__time');
    assert(timeEl !== null, '應有時間元素');
    assertEqual(timeEl.textContent, '30:00', '1800 秒應為 30:00');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createStepRow 顯示 pre-buffer', async () => {
  try {
    const { createStepRow } = await import('../components/step-row.js');
    const el = createStepRow({
      step: { s_index: 1, s_name: '伸展', s_time: 90, s_prebuffer: 15 },
    });
    const preEl = el.querySelector('.lori-step-row__pre');
    assert(preEl !== null, '應有 pre-buffer 元素');
    assertEqual(preEl.textContent, '+15s');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createStepRow active 狀態高亮', async () => {
  try {
    const { createStepRow } = await import('../components/step-row.js');
    const el = createStepRow({
      step: { s_index: 4, s_name: '貓牛式', s_time: 60, s_prebuffer: 10 },
      status: 'active',
    });
    assert(el.querySelector('.lori-step-row--active') !== null, '應有 --active class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createStepRow done 狀態有 done class 和打勾圖示', async () => {
  try {
    const { createStepRow } = await import('../components/step-row.js');
    const el = createStepRow({
      step: { s_index: 1, s_name: '已完成', s_time: 300, s_prebuffer: 10 },
      status: 'done',
    });
    assert(el.querySelector('.lori-step-row--done') !== null, '應有 --done class');
    const statusEl = el.querySelector('.lori-step-row__status');
    assert(statusEl !== null, '應有狀態圖示區');
    const svg = statusEl.querySelector('svg');
    assert(svg !== null, '應有 SVG 圖示');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createStepRow skipped 狀態有刪除線', async () => {
  try {
    const { createStepRow } = await import('../components/step-row.js');
    const el = createStepRow({
      step: { s_index: 2, s_name: '被跳過', s_time: 60, s_prebuffer: 5 },
      status: 'skipped',
    });
    assert(el.querySelector('.lori-step-row--skipped') !== null, '應有 --skipped class');
    const statusEl = el.querySelector('.lori-step-row__status');
    assert(statusEl !== null, '應有狀態圖示區');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createStepRow pending 狀態無額外 class', async () => {
  try {
    const { createStepRow } = await import('../components/step-row.js');
    const el = createStepRow({
      step: { s_index: 5, s_name: '待進行', s_time: 120, s_prebuffer: 10 },
      status: 'pending',
    });
    assert(el.querySelector('.lori-step-row--active') === null, '不應有 --active');
    assert(el.querySelector('.lori-step-row--done') === null, '不應有 --done');
    assert(el.querySelector('.lori-step-row--skipped') === null, '不應有 --skipped');
    const statusEl = el.querySelector('.lori-step-row__status');
    assertEqual(statusEl, null, 'pending 不應有狀態圖示');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createStepRow 有 data-step-index', async () => {
  try {
    const { createStepRow } = await import('../components/step-row.js');
    const el = createStepRow({
      step: { s_index: 7, s_name: '著裝', s_time: 600, s_prebuffer: 10 },
    });
    assertEqual(el.dataset.stepIndex, '7', 'data-step-index 應為 7');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createStepRow 有分隔線元素', async () => {
  try {
    const { createStepRow } = await import('../components/step-row.js');
    const el = createStepRow();
    const divider = el.querySelector('.lori-step-row__divider');
    assert(divider !== null, '應有分隔線元素');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
