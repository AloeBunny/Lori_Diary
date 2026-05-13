// 小蘿日誌 — 通用觸控滑動模組（Swipe-to-delete）
// touch 事件處理：touchstart / touchmove / touchend
// 滑動超過 threshold → 觸發 callback + 顯示刪除區域
// 回彈動畫

/**
 * 為元素綁定左滑手勢
 * @param {object} opts
 * @param {HTMLElement} opts.element - 要綁定的 DOM 元素（外層容器）
 * @param {HTMLElement} opts.slider - 實際會滑動的子元素（通常是卡片本體）
 * @param {function} opts.onSwipeLeft - 左滑觸發的回呼
 * @param {number} opts.threshold - 觸發閾值（px），預設 80
 * @returns {{ destroy: function, reset: function, isOpen: function }}
 */
export function bindSwipe({
  element,
  slider,
  onSwipeLeft = null,
  threshold = 80,
} = {}) {
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let isTracking = false;
  let isOpen = false;
  let isDragging = false;

  // 最大滑動距離
  const maxSlide = threshold + 4;

  function onTouchStart(e) {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    currentX = 0;
    isTracking = true;
    isDragging = false;
    slider.style.transition = 'none';
  }

  function onTouchMove(e) {
    if (!isTracking) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startX;
    const diffY = touch.clientY - startY;

    // 如果垂直滑動幅度大於水平，放棄追蹤（讓頁面捲動）
    if (!isDragging && Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 10) {
      isTracking = false;
      return;
    }

    // 開始水平拖動
    if (Math.abs(diffX) > 10) {
      isDragging = true;
    }

    if (!isDragging) return;

    // 阻止捲動
    e.preventDefault();

    // 計算位移量
    let translateX;
    if (isOpen) {
      // 已開啟狀態，從 -maxSlide 開始
      translateX = -maxSlide + diffX;
    } else {
      // 關閉狀態，只允許左滑（負值）
      translateX = Math.min(0, diffX);
    }

    // 限制範圍
    translateX = Math.max(-maxSlide, Math.min(0, translateX));
    currentX = translateX;

    slider.style.transform = `translateX(${translateX}px)`;
  }

  function onTouchEnd() {
    if (!isTracking) return;
    isTracking = false;

    slider.style.transition = 'transform 0.25s ease';

    if (isOpen) {
      // 已開啟 → 如果拖回超過一半則關閉
      if (currentX > -maxSlide / 2) {
        close();
      } else {
        open();
      }
    } else {
      // 關閉 → 如果拖出超過閾值一半則打開
      if (currentX < -(threshold / 2)) {
        open();
        if (onSwipeLeft) onSwipeLeft();
      } else {
        close();
      }
    }
  }

  function open() {
    isOpen = true;
    slider.style.transition = 'transform 0.25s ease';
    slider.style.transform = `translateX(-${maxSlide}px)`;
    element.classList.add('lori-swipe--open');
  }

  function close() {
    isOpen = false;
    slider.style.transition = 'transform 0.25s ease';
    slider.style.transform = 'translateX(0)';
    element.classList.remove('lori-swipe--open');
  }

  // 綁定事件
  element.addEventListener('touchstart', onTouchStart, { passive: true });
  element.addEventListener('touchmove', onTouchMove, { passive: false });
  element.addEventListener('touchend', onTouchEnd, { passive: true });

  return {
    /** 移除事件監聽 */
    destroy() {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    },
    /** 重置為關閉狀態 */
    reset() {
      close();
    },
    /** 回傳目前是否展開 */
    isOpen() {
      return isOpen;
    },
  };
}
