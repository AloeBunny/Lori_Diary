// 小蘿日誌 — Heatmap 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('Heatmap — 模組匯出');

test('heatmap.js 可被匯入', async () => {
  try {
    const mod = await import('../components/heatmap.js');
    assert(typeof mod.createHeatmap === 'function', 'createHeatmap 應為函式');
    assert(typeof mod.heatCellColor === 'function', 'heatCellColor 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('Heatmap — heatCellColor 邏輯');

test('heatCellColor 完成度 0% 回傳空白色', async () => {
  const { heatCellColor } = await import('../components/heatmap.js');
  assertEqual(heatCellColor(0, 0), '#F2F0ED', '0% 應為空白色');
  assertEqual(heatCellColor(5, -10), '#F2F0ED', '負值應為空白色');
});

test('heatCellColor 完成度 100% 回傳飽和色（level 4）', async () => {
  const { heatCellColor } = await import('../components/heatmap.js');
  const color = heatCellColor(0, 100);
  assert(color.startsWith('#'), '應回傳色碼');
  assert(color !== '#F2F0ED', '100% 不應為空白色');
});

test('heatCellColor 5 階分布正確', async () => {
  const { heatCellColor } = await import('../components/heatmap.js');
  // 使用同一個 seed 測試不同完成度
  const c0 = heatCellColor(42, 0);
  const c25 = heatCellColor(42, 25);
  const c50 = heatCellColor(42, 50);
  const c75 = heatCellColor(42, 75);
  const c100 = heatCellColor(42, 100);

  assertEqual(c0, '#F2F0ED', '0% = 空白');
  assert(c25 !== '#F2F0ED', '25% 不為空白');
  assert(c50 !== c25, '50% 與 25% 不同階');
  assert(c75 !== c50, '75% 與 50% 不同階');
  assert(c100 !== c75, '100% 與 75% 不同階');
});

test('heatCellColor 同 seed 同結果', async () => {
  const { heatCellColor } = await import('../components/heatmap.js');
  assertEqual(heatCellColor(7, 60), heatCellColor(7, 60), '同參數應回傳相同結果');
});

suite('Heatmap — DOM 結構');

test('createHeatmap 預設建立 112 格', async () => {
  try {
    const { createHeatmap } = await import('../components/heatmap.js');
    const el = createHeatmap();
    const cells = el.querySelectorAll('.lori-heatmap__cell');
    assertEqual(cells.length, 112, '16x7 = 112 格');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createHeatmap 自訂 cols/rows', async () => {
  try {
    const { createHeatmap } = await import('../components/heatmap.js');
    const el = createHeatmap({ cols: 4, rows: 3 });
    const cells = el.querySelectorAll('.lori-heatmap__cell');
    assertEqual(cells.length, 12, '4x3 = 12 格');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createHeatmap 每個 cell 有 data-date 屬性', async () => {
  try {
    const { createHeatmap } = await import('../components/heatmap.js');
    const el = createHeatmap({ cols: 2, rows: 2 });
    const cells = el.querySelectorAll('.lori-heatmap__cell');
    cells.forEach(cell => {
      const date = cell.dataset.date;
      assert(date, '每格應有 data-date');
      assert(/^\d{4}-\d{2}-\d{2}$/.test(date), `日期格式應為 YYYY-MM-DD，得到 ${date}`);
    });
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createHeatmap onSelect 回呼有效', async () => {
  try {
    const { createHeatmap } = await import('../components/heatmap.js');
    let clicked = null;
    const el = createHeatmap({
      cols: 2,
      rows: 1,
      onSelect: (date) => { clicked = date; },
    });
    const cells = el.querySelectorAll('.lori-heatmap__cell');
    // 點第一格（應為過去的日期）
    const firstCell = cells[0];
    if (firstCell.style.cursor !== 'default') {
      firstCell.click();
      assert(clicked !== null, 'onSelect 應被觸發');
      assert(/^\d{4}-\d{2}-\d{2}$/.test(clicked), '回呼參數應為日期字串');
    }
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createHeatmap 有紀錄的日期顯示對應顏色', async () => {
  try {
    const { createHeatmap } = await import('../components/heatmap.js');
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const el = createHeatmap({
      records: [{ date: dateStr, percent: 100 }],
      cols: 1,
      rows: 1,
    });
    const cell = el.querySelector('.lori-heatmap__cell');
    assert(cell.style.background !== '#F2F0ED', '有紀錄且 100% 的日期不應為空白色');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
