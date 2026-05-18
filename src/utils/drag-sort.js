// 小蘿日誌 — 通用觸控拖曳排序模組（Drag-to-reorder）
// touch 事件處理：touchstart / touchmove / touchend
// 長按 500ms 啟動拖曳模式，避免跟左滑刪除、點擊、捲動衝突
// 拖曳中元素半透明抬起，其他元素讓位動畫
// 放下後呼叫 onReorder callback

/**
 * 為容器內的列表項目綁定拖曳排序手勢
 * @param {object} opts
 * @param {HTMLElement} opts.container - 列表容器元素
 * @param {string} opts.itemSelector - 可拖曳項目的 CSS selector（例如 '.lori-todo-row'）
 * @param {function} opts.onReorder - 拖曳完成後呼叫 (fromIndex, toIndex) => void
 * @returns {{ destroy: function }}
 */
export function bindDragSort({
  container,
  itemSelector,
  onReorder = null,
} = {}) {
  const LONG_PRESS_MS = 500;
  const SCROLL_EDGE = 40;     // 距離容器上下邊界幾 px 開始自動捲動
  const SCROLL_SPEED = 6;     // 自動捲動每幀 px

  let longPressTimer = null;
  let isDragging = false;
  let dragEl = null;           // 正在拖曳的原始元素
  let placeholder = null;      // 占位元素
  let startY = 0;
  let startX = 0;
  let offsetY = 0;             // 手指觸碰點相對於元素頂部的偏移
  let scrollParent = null;     // 可捲動的父元素
  let scrollRAF = null;

  // ── 找到最近的可捲動祖先 ──
  function findScrollParent(el) {
    let node = el.parentElement;
    while (node) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY)) return node;
      node = node.parentElement;
    }
    return document.documentElement;
  }

  // ── 取得項目在容器內的索引 ──
  function getItemIndex(el) {
    const allItems = Array.from(container.querySelectorAll(itemSelector));
    return allItems.indexOf(el);
  }

  // ── 取得手指位置對應應該插入的索引 ──
  function getInsertIndex(touchY) {
    const allItems = Array.from(container.querySelectorAll(itemSelector))
      .filter(el => el !== dragEl);
    for (let i = 0; i < allItems.length; i++) {
      const rect = allItems[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (touchY < midY) return i;
    }
    return allItems.length;
  }

  // ── 自動捲動（手指靠近容器邊緣時） ──
  function autoScroll(touchY) {
    if (!scrollParent) return;
    cancelAnimationFrame(scrollRAF);

    const rect = scrollParent.getBoundingClientRect();
    let speed = 0;

    if (touchY - rect.top < SCROLL_EDGE) {
      // 靠近頂部，往上捲
      speed = -SCROLL_SPEED;
    } else if (rect.bottom - touchY < SCROLL_EDGE) {
      // 靠近底部，往下捲
      speed = SCROLL_SPEED;
    }

    if (speed === 0) return;

    function step() {
      if (!isDragging) return;
      scrollParent.scrollTop += speed;
      scrollRAF = requestAnimationFrame(step);
    }
    scrollRAF = requestAnimationFrame(step);
  }

  // ── 更新讓位動畫 ──
  function updateDisplacements(touchY) {
    const allItems = Array.from(container.querySelectorAll(itemSelector))
      .filter(el => el !== dragEl);
    const insertIdx = getInsertIndex(touchY);

    // 移動 placeholder 到正確位置
    if (insertIdx < allItems.length) {
      const refEl = allItems[insertIdx];
      if (refEl !== placeholder) {
        container.insertBefore(placeholder, refEl);
      }
    } else {
      // 插到最後
      const lastItem = allItems[allItems.length - 1];
      if (lastItem && lastItem !== placeholder) {
        container.insertBefore(placeholder, lastItem.nextSibling);
      }
    }
  }

  // ── touchstart ──
  function onTouchStart(e) {
    // 找到被觸碰的排序項目
    const target = e.target.closest(itemSelector);
    if (!target || !container.contains(target)) return;

    const touch = e.touches[0];
    startY = touch.clientY;
    startX = touch.clientX;

    // 啟動長按計時
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      startDrag(target, touch);
    }, LONG_PRESS_MS);
  }

  // ── touchmove ──
  function onTouchMove(e) {
    const touch = e.touches[0];

    if (!isDragging && longPressTimer) {
      // 還在等長按——如果手指移動太多就取消
      const diffX = Math.abs(touch.clientX - startX);
      const diffY = Math.abs(touch.clientY - startY);
      if (diffX > 10 || diffY > 10) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      return;
    }

    if (!isDragging) return;

    // 阻止捲動與其他手勢
    e.preventDefault();

    // 更新拖曳元素位置
    const touchY = touch.clientY;
    dragEl.style.top = `${touchY - offsetY}px`;

    // 更新讓位
    updateDisplacements(touchY);

    // 自動捲動
    autoScroll(touchY);
  }

  // ── touchend ──
  function onTouchEnd(e) {
    // 清除長按計時
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (!isDragging) return;

    endDrag();
  }

  // ── 開始拖曳 ──
  function startDrag(el, touch) {
    isDragging = true;
    dragEl = el;
    scrollParent = findScrollParent(container);

    const rect = el.getBoundingClientRect();
    offsetY = touch.clientY - rect.top;

    // 記錄原始索引
    dragEl._dragFromIndex = getItemIndex(el);

    // 建立占位元素（保持原來的空間）
    placeholder = document.createElement('div');
    placeholder.className = 'lori-drag-placeholder';
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.borderRadius = '12px';
    container.insertBefore(placeholder, el);

    // 將拖曳元素設為固定定位浮起
    el.classList.add('lori-drag-active');
    el.style.position = 'fixed';
    el.style.top = `${rect.top}px`;
    el.style.left = `${rect.left}px`;
    el.style.width = `${rect.width}px`;
    el.style.zIndex = '999';

    // 觸覺回饋（如果瀏覽器支援）
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }

  // ── 結束拖曳 ──
  function endDrag() {
    cancelAnimationFrame(scrollRAF);
    isDragging = false;

    if (!dragEl || !placeholder) return;

    const fromIndex = dragEl._dragFromIndex;

    // 把拖曳元素插回 placeholder 的位置
    container.insertBefore(dragEl, placeholder);

    // 移除占位
    placeholder.remove();
    placeholder = null;

    // 還原樣式
    dragEl.classList.remove('lori-drag-active');
    dragEl.style.position = '';
    dragEl.style.top = '';
    dragEl.style.left = '';
    dragEl.style.width = '';
    dragEl.style.zIndex = '';
    delete dragEl._dragFromIndex;

    // 算出新的索引
    const toIndex = getItemIndex(dragEl);
    dragEl = null;

    // 呼叫回調
    if (onReorder && fromIndex !== toIndex && fromIndex >= 0 && toIndex >= 0) {
      onReorder(fromIndex, toIndex);
    }
  }

  // ── 綁定事件 ──
  container.addEventListener('touchstart', onTouchStart, { passive: true });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd, { passive: true });
  container.addEventListener('touchcancel', onTouchEnd, { passive: true });

  return {
    /** 移除所有事件監聽、清理狀態 */
    destroy() {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (isDragging) {
        endDrag();
      }
      cancelAnimationFrame(scrollRAF);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    },
  };
}
