// 小蘿日誌 — TodoRow 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('TodoRow — 模組匯出');

test('todo-row.js 可被匯入', async () => {
  try {
    const mod = await import('../components/todo-row.js');
    assert(typeof mod.createTodoRow === 'function', 'createTodoRow 應為函式');
    assert(typeof mod.destroyTodoRow === 'function', 'destroyTodoRow 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('TodoRow — 參數介面');

test('createTodoRow 預設參數不報錯', async () => {
  try {
    const { createTodoRow } = await import('../components/todo-row.js');
    const el = createTodoRow();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-todo-row'), '應有 lori-todo-row class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTodoRow 顯示名稱', async () => {
  try {
    const { createTodoRow } = await import('../components/todo-row.js');
    const el = createTodoRow({
      todo: { id: 1, title: '測試待辦', done: false, carrots: 3, urgency: 0 },
    });
    const nameEl = el.querySelector('.lori-todo-row__name');
    assert(nameEl !== null, '應有名稱元素');
    assertEqual(nameEl.textContent, '測試待辦');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTodoRow done=true 時有已完成樣式', async () => {
  try {
    const { createTodoRow } = await import('../components/todo-row.js');
    const el = createTodoRow({
      todo: { id: 2, title: '已完成', done: true, carrots: 1, urgency: 0 },
    });
    const card = el.querySelector('.lori-todo-row__card');
    assert(card.classList.contains('lori-todo-row__card--done'), '應有 --done class');
    const nameEl = el.querySelector('.lori-todo-row__name');
    assertEqual(nameEl.style.textDecoration, 'line-through', '名稱應有刪除線');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTodoRow 急迫標記顯示', async () => {
  try {
    const { createTodoRow } = await import('../components/todo-row.js');
    const el1 = createTodoRow({
      todo: { id: 3, title: '急', done: false, carrots: 1, urgency: 1 },
    });
    const urg1 = el1.querySelector('.lori-todo-row__urgency');
    assert(urg1 !== null, 'urgency=1 應有急迫標記');
    assertEqual(urg1.textContent, '!', 'urgency=1 應顯示 !');

    const el2 = createTodoRow({
      todo: { id: 4, title: '很急', done: false, carrots: 1, urgency: 2 },
    });
    const urg2 = el2.querySelector('.lori-todo-row__urgency');
    assertEqual(urg2.textContent, '!!', 'urgency=2 應顯示 !!');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTodoRow urgency=0 不顯示急迫標記', async () => {
  try {
    const { createTodoRow } = await import('../components/todo-row.js');
    const el = createTodoRow({
      todo: { id: 5, title: '不急', done: false, carrots: 1, urgency: 0 },
    });
    const urg = el.querySelector('.lori-todo-row__urgency');
    assertEqual(urg, null, 'urgency=0 不應有急迫標記');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTodoRow 紅蘿蔔數顯示正確', async () => {
  try {
    const { createTodoRow } = await import('../components/todo-row.js');
    const el = createTodoRow({
      todo: { id: 6, title: '紅蘿蔔', done: false, carrots: 7, urgency: 0 },
    });
    const carrot = el.querySelector('.lori-todo-row__carrot .tabnum');
    assert(carrot !== null, '應有紅蘿蔔數值');
    assertEqual(carrot.textContent, '7', '紅蘿蔔數應為 7');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTodoRow 有 data-todo-id', async () => {
  try {
    const { createTodoRow } = await import('../components/todo-row.js');
    const el = createTodoRow({
      todo: { id: 42, title: '有 ID', done: false, carrots: 1, urgency: 0 },
    });
    assertEqual(el.dataset.todoId, '42', 'data-todo-id 應為 42');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTodoRow 有刪除區域', async () => {
  try {
    const { createTodoRow } = await import('../components/todo-row.js');
    const el = createTodoRow({
      todo: { id: 7, title: '可刪', done: false, carrots: 1, urgency: 0 },
    });
    const del = el.querySelector('.lori-todo-row__delete');
    assert(del !== null, '應有刪除區域');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('destroyTodoRow 不報錯', async () => {
  try {
    const { createTodoRow, destroyTodoRow } = await import('../components/todo-row.js');
    const el = createTodoRow({
      todo: { id: 8, title: '銷毀', done: false, carrots: 1, urgency: 0 },
    });
    destroyTodoRow(el);
    assert(true, 'destroyTodoRow 不報錯');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
