// 小蘿日誌 — Toggle 開關切換元件
// 用於 Quest 編輯中的排序方式選擇（有序/無序）
// 雙選項滑塊式切換

/**
 * 建立 Toggle 元件
 * @param {object} opts
 * @param {boolean} opts.checked - 是否選中右側（true = 右/labelOn，false = 左/labelOff）
 * @param {string} opts.labelOn - 右側（checked=true）標籤，預設「無序」
 * @param {string} opts.labelOff - 左側（checked=false）標籤，預設「有序」
 * @param {function|null} opts.onChange - 切換回呼 (checked: boolean) => void
 * @returns {HTMLElement}
 */
export function createToggle({
  checked = false,
  labelOn = '無序',
  labelOff = '有序',
  onChange = null,
} = {}) {
  const el = document.createElement('div');
  el.className = 'lori-toggle';
  el.setAttribute('role', 'switch');
  el.setAttribute('aria-checked', String(checked));
  el.tabIndex = 0;

  // 儲存狀態
  el._checked = checked;
  el._labelOn = labelOn;
  el._labelOff = labelOff;
  el._onChange = onChange;

  // 建立左右選項
  const optLeft = document.createElement('div');
  optLeft.className = 'lori-toggle__option';
  optLeft.dataset.side = 'left';
  optLeft.textContent = labelOff;
  el.appendChild(optLeft);

  const optRight = document.createElement('div');
  optRight.className = 'lori-toggle__option';
  optRight.dataset.side = 'right';
  optRight.textContent = labelOn;
  el.appendChild(optRight);

  // 渲染初始狀態
  _renderToggle(el);

  // 點擊左側 → checked=false，點擊右側 → checked=true
  el.addEventListener('click', (e) => {
    const target = e.target.closest('.lori-toggle__option');
    if (!target) return;
    const side = target.dataset.side;
    const newChecked = side === 'right';
    if (newChecked === el._checked) return; // 同一邊，不觸發
    el._checked = newChecked;
    el.setAttribute('aria-checked', String(el._checked));
    _renderToggle(el);
    if (el._onChange) el._onChange(el._checked);
  });

  return el;
}

/**
 * 內部渲染函式 — 更新選中狀態的視覺
 */
function _renderToggle(el) {
  const options = el.querySelectorAll('.lori-toggle__option');
  options.forEach((opt) => {
    const isRight = opt.dataset.side === 'right';
    const isActive = isRight === el._checked;
    if (isActive) {
      opt.classList.add('lori-toggle__option--active');
    } else {
      opt.classList.remove('lori-toggle__option--active');
    }
  });
}

/**
 * 外部設定 checked 狀態（不觸發 callback）
 * @param {HTMLElement} el - createToggle 回傳的元素
 * @param {boolean} checked
 */
export function setToggle(el, checked) {
  el._checked = checked;
  el.setAttribute('aria-checked', String(checked));
  _renderToggle(el);
}
