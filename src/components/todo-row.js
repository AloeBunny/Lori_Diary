// 小蘿日誌 — TodoRow 單筆 TODO 項目列元件
// 結構：CheckCircle + 名稱 + 急迫標記 + 紅蘿蔔數 + 左滑刪除 + 單點/長按編輯

import { createCheckCircle } from './check-circle.js';
import { iconTrash } from './icons.js';
import { bindSwipe } from '../utils/swipe.js';

/**
 * 建立單筆 TODO 項目列
 * @param {object} opts
 * @param {object} opts.todo - TODO 資料物件
 * @param {string|number} opts.todo.id - 項目 ID
 * @param {string} opts.todo.title - 名稱
 * @param {boolean} opts.todo.done - 是否已完成
 * @param {number} opts.todo.carrots - 紅蘿蔔數（積分）
 * @param {number} opts.todo.urgency - 急迫度（0=無, 1=!, 2=!!）
 * @param {function|null} opts.onToggle - 打勾/取消回呼 (id, done)
 * @param {function|null} opts.onDelete - 刪除回呼 (id)
 * @param {function|null} opts.onEdit - 長按編輯回呼 (id)
 * @returns {HTMLElement}
 */
export function createTodoRow({
  todo = { id: 0, title: '', done: false, carrots: 1, urgency: 0 },
  onToggle = null,
  onDelete = null,
  onEdit = null,
} = {}) {
  const { id, title, done, carrots, urgency } = todo;

  // ── 外層容器（含刪除區域） ──
  const wrapper = document.createElement('div');
  wrapper.className = 'lori-todo-row';
  wrapper.dataset.todoId = String(id);

  // ── 刪除按鈕（底層） ──
  const deleteZone = document.createElement('div');
  deleteZone.className = 'lori-todo-row__delete';
  const trashIcon = iconTrash(20);
  trashIcon.setAttribute('stroke', '#fff');
  deleteZone.appendChild(trashIcon);
  deleteZone.addEventListener('click', () => {
    if (onDelete) onDelete(id);
  });
  wrapper.appendChild(deleteZone);

  // ── 卡片本體（滑動層） ──
  const card = document.createElement('div');
  card.className = 'lori-todo-row__card lori-card row';
  if (done) card.classList.add('lori-todo-row__card--done');

  // CheckCircle
  const circle = createCheckCircle({
    checked: done,
    color: 'var(--mint)',
    onToggle: (newDone) => {
      if (newDone) {
        card.classList.add('lori-todo-row__card--done');
      } else {
        card.classList.remove('lori-todo-row__card--done');
      }
      _updateTextStyle(nameEl, newDone);
      if (onToggle) onToggle(id, newDone);
    },
  });
  card.appendChild(circle);

  // 名稱
  const nameEl = document.createElement('div');
  nameEl.className = 'lori-todo-row__name';
  nameEl.textContent = title;
  _updateTextStyle(nameEl, done);
  card.appendChild(nameEl);

  // 急迫標記
  if (urgency > 0) {
    const urgEl = document.createElement('div');
    urgEl.className = 'lori-todo-row__urgency';
    urgEl.textContent = '!'.repeat(urgency);
    card.appendChild(urgEl);
  }

  // 紅蘿蔔數
  const carrotEl = document.createElement('div');
  carrotEl.className = 'lori-todo-row__carrot';
  const carrotEmoji = document.createTextNode('\u{1F955} ');
  carrotEl.appendChild(carrotEmoji);
  const carrotNum = document.createElement('span');
  carrotNum.className = 'tabnum';
  carrotNum.textContent = String(carrots);
  carrotEl.appendChild(carrotNum);
  card.appendChild(carrotEl);

  wrapper.appendChild(card);

  // ── 左滑手勢 ──
  const swipeCtrl = bindSwipe({
    element: wrapper,
    slider: card,
    onSwipeLeft: () => {
      // 滑動打開，使用者點刪除按鈕才真正刪除
    },
    threshold: 80,
  });
  wrapper._swipeCtrl = swipeCtrl;

  // ── 長按觸發編輯 ──
  let longPressTimer = null;
  let longPressFired = false;
  card.addEventListener('pointerdown', (e) => {
    longPressFired = false;
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      longPressFired = true;
      if (onEdit) onEdit(id);
    }, 600);
  });
  card.addEventListener('pointerup', () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  });
  card.addEventListener('pointerleave', () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  });

  // ── 單點文字進入編輯 ──
  nameEl.addEventListener('click', (e) => {
    // 長按已觸發過就不再重複
    if (longPressFired) return;
    if (onEdit) onEdit(id);
  });

  return wrapper;
}

/**
 * 更新名稱的已完成樣式
 */
function _updateTextStyle(nameEl, done) {
  if (done) {
    nameEl.style.textDecoration = 'line-through';
    nameEl.style.color = 'var(--gray)';
  } else {
    nameEl.style.textDecoration = 'none';
    nameEl.style.color = 'var(--ink)';
  }
}

/**
 * 銷毀 TodoRow（清除 swipe 事件）
 * @param {HTMLElement} el - createTodoRow 回傳的元素
 */
export function destroyTodoRow(el) {
  if (el._swipeCtrl) {
    el._swipeCtrl.destroy();
  }
}
