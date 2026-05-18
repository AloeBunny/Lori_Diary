// 小蘿日誌 — TODO 當日頁（Screen 1200）
// StatusBar → 頁面標題 → DateBar → TodoRow 列表 → AddBar → TabBar
// 核心邏輯：前日拖欠複製、TODO_Temp、打勾灰調沉底、左滑刪除、長按編輯

import { createStatusBar } from '../components/status-bar.js';
import { createTabBar } from '../components/tab-bar.js';
import { createDateBar, updateDateBarProgress } from '../components/date-bar.js';
import { navigate } from '../router.js';
import { dbGetAll, dbPut, dbAdd, dbDelete, addCarrots, reorderTodos, getMaxSortOrder } from '../db.js';
import { bindDragSort } from '../utils/drag-sort.js';
import { todayStr, getEncouragement, showToast, silentCatch, toLocalDateStr, prevDateStr, nextDateStr, parseDate } from '../utils/helpers.js';
import { createTodoRow } from '../components/todo-row.js';
import { createAddBar } from '../components/add-bar.js';

// ===== 前日拖欠複製邏輯 =====

/**
 * 計算一個 todo 被拖欠幾天（從原始建立日到 targetDate）
 * @param {object} todo
 * @param {string} targetDate YYYY-MM-DD
 * @returns {number}
 */
function calcOverdueDays(todo, targetDate) {
  const origin = todo.originDate || todo.date;
  if (!origin || origin >= targetDate) return 0;
  const a = new Date(origin + 'T00:00:00');
  const b = new Date(targetDate + 'T00:00:00');
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/**
 * 進入當日畫面時的前日拖欠複製邏輯
 * @param {string} dateStr 今天的日期 YYYY-MM-DD
 * @returns {Promise<void>}
 */
async function carryOverFromYesterday(dateStr) {
  // 只對「今天」做拖欠複製
  const today = todayStr();
  if (dateStr !== today) return;

  // 取得今日已有的 todos
  const todayTodos = await dbGetAll('todos', 'date', dateStr);

  // 如果今日已有任何非 Temp 的 todo，代表已經做過拖欠處理了
  const hasRealTodos = todayTodos.some(t => !t.isTemp);
  if (hasRealTodos) return;

  // 取得前一天的 todos
  const yesterday = prevDateStr(dateStr);
  const prevTodos = await dbGetAll('todos', 'date', yesterday);

  // 篩出未完成且非 Temp 的項目
  const undone = prevTodos.filter(t => !t.done && !t.isTemp);

  if (undone.length > 0) {
    // 有未完事項 → 複製到今日，每拖欠一天加一個 !
    let orderIndex = 0;
    for (const todo of undone) {
      orderIndex++;
      const overdueDays = calcOverdueDays(todo, dateStr);
      const prefix = '!'.repeat(overdueDays);
      // 去掉原有的 ! 前綴，重新計算
      const baseName = (todo.name || '').replace(/^!+/, '');
      await dbAdd('todos', {
        name: prefix + baseName,
        done: false,
        carrots: todo.carrots || 1,
        date: dateStr,
        type: 'todo',
        urgent: overdueDays,
        isTemp: false,
        originDate: todo.originDate || todo.date,
        repeatCount: todo.repeatCount || 1,
        repeatCycle: todo.repeatCycle || '',
        sort_order: orderIndex,
      });
    }
  } else {
    // 完全無未完事項 → 建立一筆 TODO_Temp
    // 但先確認今日沒有 temp
    const hasTemp = todayTodos.some(t => t.isTemp);
    if (!hasTemp) {
      await dbAdd('todos', {
        name: 'TODO_Temp',
        done: false,
        carrots: 1,
        date: dateStr,
        type: 'todo',
        urgent: 0,
        isTemp: true,
        originDate: dateStr,
        repeatCount: 1,
        repeatCycle: '',
        sort_order: 1,
      });
    }
  }
}

// ===== 編輯彈窗 =====

/**
 * 建立 TODO 編輯/新增表單彈窗
 * @param {object} opts
 * @param {object|null} opts.todo - 現有 todo（null = 新增）
 * @param {function} opts.onSave - 儲存回調 (todo) => void
 * @param {function} opts.onCancel - 取消回調
 * @returns {HTMLElement}
 */
function createTodoForm({ todo = null, onSave, onCancel }) {
  const overlay = document.createElement('div');
  overlay.className = 'lori-todo-overlay';

  const sheet = document.createElement('div');
  sheet.className = 'lori-todo-sheet lori-card';

  // 標題
  const titleEl = document.createElement('div');
  titleEl.className = 'lori-todo-sheet__title';
  titleEl.textContent = todo ? '編輯待辦' : '新增待辦';
  sheet.appendChild(titleEl);

  // 名稱輸入
  const nameLabel = document.createElement('label');
  nameLabel.className = 'lori-todo-sheet__label';
  nameLabel.textContent = '名稱';
  sheet.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.className = 'lori-input';
  nameInput.type = 'text';
  nameInput.placeholder = '待辦事項名稱';
  nameInput.value = todo ? (todo.isTemp ? '' : todo.name) : '';
  sheet.appendChild(nameInput);

  // 積分
  const carrotLabel = document.createElement('label');
  carrotLabel.className = 'lori-todo-sheet__label';
  carrotLabel.textContent = '\u{1F955} 積分';
  sheet.appendChild(carrotLabel);

  const carrotInput = document.createElement('input');
  carrotInput.className = 'lori-input';
  carrotInput.type = 'number';
  carrotInput.min = '1';
  carrotInput.value = String(todo?.carrots || 1);
  sheet.appendChild(carrotInput);

  // 循環次數
  const repeatLabel = document.createElement('label');
  repeatLabel.className = 'lori-todo-sheet__label';
  repeatLabel.textContent = '循環次數';
  sheet.appendChild(repeatLabel);

  const repeatInput = document.createElement('input');
  repeatInput.className = 'lori-input';
  repeatInput.type = 'number';
  repeatInput.min = '1';
  repeatInput.value = String(todo?.repeatCount || 1);
  sheet.appendChild(repeatInput);

  // 循環週期（只在循環次數 > 1 時啟用）
  const cycleLabel = document.createElement('label');
  cycleLabel.className = 'lori-todo-sheet__label';
  cycleLabel.textContent = '循環週期';
  sheet.appendChild(cycleLabel);

  const cycleSelect = document.createElement('select');
  cycleSelect.className = 'lori-input lori-todo-sheet__select';
  const cycleOptions = [
    { value: '', label: '不開放' },
    { value: 'daily', label: '每天' },
    { value: 'weekly', label: '每週' },
    { value: 'monthly', label: '每月' },
  ];
  cycleOptions.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    if (todo?.repeatCycle === opt.value) o.selected = true;
    cycleSelect.appendChild(o);
  });
  // 單次時不開放
  cycleSelect.disabled = parseInt(repeatInput.value) <= 1;
  repeatInput.addEventListener('input', () => {
    cycleSelect.disabled = parseInt(repeatInput.value) <= 1;
    if (cycleSelect.disabled) cycleSelect.value = '';
  });
  sheet.appendChild(cycleSelect);

  // 按鈕列
  const btnRow = document.createElement('div');
  btnRow.className = 'lori-todo-sheet__btns';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'lori-btn lori-btn-ghost';
  cancelBtn.textContent = '取消';
  cancelBtn.addEventListener('click', () => onCancel && onCancel());
  btnRow.appendChild(cancelBtn);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'lori-btn lori-btn-primary';
  saveBtn.textContent = '儲存';
  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.style.borderColor = 'var(--wine)';
      nameInput.focus();
      return;
    }
    const result = {
      name,
      carrots: Math.max(1, parseInt(carrotInput.value) || 1),
      repeatCount: Math.max(1, parseInt(repeatInput.value) || 1),
      repeatCycle: cycleSelect.disabled ? '' : cycleSelect.value,
    };
    onSave && onSave(result);
  });
  btnRow.appendChild(saveBtn);

  sheet.appendChild(btnRow);
  overlay.appendChild(sheet);

  // 點遮罩關閉
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onCancel && onCancel();
  });

  // 自動 focus
  requestAnimationFrame(() => nameInput.focus());

  return overlay;
}

// ===== 渲染 =====

/**
 * 渲染 TODO 當日頁到容器
 * @param {HTMLElement} root
 * @param {object} params - 路由參數
 * @param {string} [params.date] - YYYY-MM-DD（未指定 = 今天）
 * @returns {function} cleanup
 */
export function renderTodoToday(root, params = {}) {
  const dateStr = params.date || todayStr();
  const today = todayStr();
  const isToday = dateStr === today;
  const currentDate = parseDate(dateStr);

  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-todo-today';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '54px';
  body.style.paddingBottom = '160px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 頁面標題
  const titleSection = document.createElement('div');
  titleSection.className = 'lori-todo-today__title-section';

  const pageTitle = document.createElement('div');
  pageTitle.className = 'lori-todo-today__page-title';
  pageTitle.textContent = '待辦';
  titleSection.appendChild(pageTitle);
  body.appendChild(titleSection);

  // DateBar
  const dateBar = createDateBar({
    date: currentDate,
    progress: 0,
    isToday,
    onPrev: () => navigate(`#/todo/${prevDateStr(dateStr)}`),
    onNext: () => navigate(`#/todo/${nextDateStr(dateStr)}`),
    onList: () => navigate('#/todo/history'),
  });
  body.appendChild(dateBar);

  // 列表容器
  const listContainer = document.createElement('div');
  listContainer.className = 'lori-todo-today__list';
  body.appendChild(listContainer);

  // AddBar 浮動按鈕
  const addBar = createAddBar({
    label: '新增待辦',
    onClick: () => _showAddForm(root, dateStr, () => _refreshList(dateStr, listContainer, dateBar)),
  });
  root.appendChild(addBar);

  // TabBar
  const tabBar = createTabBar('todo');
  root.appendChild(tabBar);

  // 載入資料
  _loadTodoData(dateStr, listContainer, dateBar, root);

  // cleanup
  return () => {
    if (listContainer._dragSortCtrl) {
      listContainer._dragSortCtrl.destroy();
      listContainer._dragSortCtrl = null;
    }
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 載入 TODO 資料並渲染列表
 */
async function _loadTodoData(dateStr, listContainer, dateBar, root) {
  try {
    // 執行前日拖欠邏輯
    await carryOverFromYesterday(dateStr);

    // 刷新列表
    await _refreshList(dateStr, listContainer, dateBar);
  } catch (err) {
    console.warn('TODO 資料載入失敗:', err);
  }
}

/**
 * 刷新 TODO 列表
 */
async function _refreshList(dateStr, listContainer, dateBar) {
  const todos = await dbGetAll('todos', 'date', dateStr);

  // 排序：未完成在前，已完成沉底；同群組內按 sort_order 排序
  const sorted = [...todos].sort((a, b) => {
    if (a.done && !b.done) return 1;
    if (!a.done && b.done) return -1;
    const oa = typeof a.sort_order === 'number' ? a.sort_order : Infinity;
    const ob = typeof b.sort_order === 'number' ? b.sort_order : Infinity;
    return oa - ob;
  });

  // 計算完成度
  const total = sorted.length;
  const done = sorted.filter(t => t.done).length;
  const progress = total > 0 ? done / total : 0;

  // 更新 DateBar 進度
  updateDateBarProgress(dateBar, progress);

  // 清空列表
  while (listContainer.firstChild) listContainer.removeChild(listContainer.firstChild);

  if (sorted.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'lori-todo-today__empty';
    emptyMsg.textContent = '今天還沒有待辦事項';
    listContainer.appendChild(emptyMsg);
    return;
  }

  // 渲染每個 TodoRow
  // DB 欄位 name/urgent → TodoRow 介面 title/urgency
  sorted.forEach(todo => {
    const rowEl = createTodoRow({
      todo: {
        id: todo.id,
        title: todo.name || '',
        done: todo.done,
        carrots: todo.carrots || 1,
        urgency: todo.urgent || 0,
      },
      onToggle: () => _handleToggle(todo, dateStr, listContainer, dateBar),
      onDelete: () => _handleDelete(todo, dateStr, listContainer, dateBar),
      onEdit: () => _handleEdit(todo, dateStr, listContainer, dateBar),
    });
    listContainer.appendChild(rowEl);
  });

  // 綁定拖曳排序（銷毀舊的再綁新的）
  if (listContainer._dragSortCtrl) {
    listContainer._dragSortCtrl.destroy();
    listContainer._dragSortCtrl = null;
  }
  listContainer._dragSortCtrl = bindDragSort({
    container: listContainer,
    itemSelector: '.lori-todo-row',
    onReorder: async (fromIndex, toIndex) => {
      const items = Array.from(listContainer.querySelectorAll('.lori-todo-row'));
      const orderedIds = items.map(el => Number(el.dataset.todoId));
      await reorderTodos(orderedIds);
    },
  });
}

/**
 * 打勾/取消打勾
 */
async function _handleToggle(todo, dateStr, listContainer, dateBar) {
  const newDone = !todo.done;
  await dbPut('todos', { ...todo, done: newDone });

  if (newDone) {
    // 加紅蘿蔔積分
    await addCarrots(todo.carrots || 1);

    // 鼓勵語 toast
    try {
      const msg = await getEncouragement('todo');
      showToast(msg);
    } catch(e) {
      silentCatch(e, 'todo toggle encouragement');
      showToast('做得好！');
    }
  } else {
    // 取消打勾 → 扣回紅蘿蔔積分
    await addCarrots(-(todo.carrots || 1));
  }

  // 刷新列表
  await _refreshList(dateStr, listContainer, dateBar);
}

/**
 * 刪除 TODO
 */
async function _handleDelete(todo, dateStr, listContainer, dateBar) {
  if (todo.id !== undefined) {
    await dbDelete('todos', todo.id);
  }
  await _refreshList(dateStr, listContainer, dateBar);
}

/**
 * 長按編輯 → 彈出編輯表單
 */
function _handleEdit(todo, dateStr, listContainer, dateBar) {
  const root = listContainer.closest('.lori');
  if (!root) return;

  const form = createTodoForm({
    todo,
    onSave: async (result) => {
      await dbPut('todos', {
        ...todo,
        name: result.name,
        carrots: result.carrots,
        repeatCount: result.repeatCount,
        repeatCycle: result.repeatCycle,
        isTemp: false, // 編輯過就不再是 Temp
      });
      form.remove();
      await _refreshList(dateStr, listContainer, dateBar);
    },
    onCancel: () => form.remove(),
  });
  root.appendChild(form);
}

/**
 * 新增 TODO → 彈出新增表單
 */
function _showAddForm(root, dateStr, refreshCallback) {
  const form = createTodoForm({
    todo: null,
    onSave: async (result) => {
      const maxOrder = await getMaxSortOrder(dateStr);
      await dbAdd('todos', {
        name: result.name,
        done: false,
        carrots: result.carrots,
        date: dateStr,
        type: 'todo',
        urgent: 0,
        isTemp: false,
        originDate: dateStr,
        repeatCount: result.repeatCount,
        repeatCycle: result.repeatCycle,
        sort_order: maxOrder + 1,
      });
      form.remove();
      refreshCallback();
    },
    onCancel: () => form.remove(),
  });
  root.appendChild(form);
}

// ===== 匯出工具函式供測試 =====
export {
  carryOverFromYesterday,
  calcOverdueDays,
  prevDateStr,
  nextDateStr,
  createTodoForm,
};
