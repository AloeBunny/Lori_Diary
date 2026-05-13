// 小蘿日誌 — 表單元素元件
// FormRow + TimePicker + NumberStepper
// 用於 131A Block 編輯、131B Step 編輯、141B Quest 編輯

import { iconChev } from './icons.js';

/**
 * 建立 FormRow（表單行：label + 輸入元素）
 * @param {object} opts
 * @param {string} opts.label - 欄位標籤
 * @param {string} opts.hint - 提示文字（可選）
 * @param {HTMLElement|HTMLElement[]} opts.children - 輸入元素
 * @returns {HTMLElement}
 */
export function createFormRow({
  label = '',
  hint = '',
  children = null,
} = {}) {
  const row = document.createElement('div');
  row.className = 'lori-form-row';

  // label
  const labelEl = document.createElement('div');
  labelEl.className = 'lori-form-row__label';
  labelEl.textContent = label;
  row.appendChild(labelEl);

  // children
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(c => row.appendChild(c));
    } else {
      row.appendChild(children);
    }
  }

  // hint
  if (hint) {
    const hintEl = document.createElement('div');
    hintEl.className = 'lori-form-row__hint';
    hintEl.textContent = hint;
    row.appendChild(hintEl);
  }

  return row;
}

/**
 * 建立 TimePicker（HH:MM 時間選擇器）
 * @param {object} opts
 * @param {string} opts.value - 目前時間值，格式 'HH:MM'
 * @param {function|null} opts.onChange - 值變更回調 (newValue: string) => void
 * @param {string} opts.placeholder - 佔位文字
 * @returns {HTMLElement}
 */
export function createTimePicker({
  value = '',
  onChange = null,
  placeholder = 'HH:MM',
} = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'lori-time-picker lori-input';

  // 使用原生 time input（隱藏在背後），點擊觸發
  const input = document.createElement('input');
  input.type = 'time';
  input.className = 'lori-time-picker__input';
  input.value = value;
  input.setAttribute('aria-label', placeholder);

  // 顯示文字
  const display = document.createElement('span');
  display.className = 'lori-time-picker__display tabnum';
  display.textContent = value || placeholder;
  if (!value) display.style.color = 'var(--gray)';

  // 右側箭頭
  const chevIcon = iconChev(16);
  chevIcon.setAttribute('stroke', 'var(--gray)');
  const chevWrap = document.createElement('span');
  chevWrap.className = 'lori-time-picker__chev';
  chevWrap.appendChild(chevIcon);

  wrapper.appendChild(display);
  wrapper.appendChild(input);
  wrapper.appendChild(chevWrap);

  // 點擊整個容器時觸發 input
  wrapper.addEventListener('click', () => {
    input.showPicker?.();
    input.focus();
  });

  // 值變更
  input.addEventListener('change', () => {
    const newVal = input.value; // HH:MM
    display.textContent = newVal || placeholder;
    display.style.color = newVal ? '' : 'var(--gray)';
    if (onChange) onChange(newVal);
  });

  // 提供取值/設值方法
  wrapper.getValue = () => input.value;
  wrapper.setValue = (v) => {
    input.value = v;
    display.textContent = v || placeholder;
    display.style.color = v ? '' : 'var(--gray)';
  };

  return wrapper;
}

/**
 * 建立 NumberStepper（數字步進器：- 按鈕 + 數字 + 按鈕）
 * @param {object} opts
 * @param {number} opts.value - 目前值
 * @param {number} opts.min - 最小值
 * @param {number} opts.max - 最大值
 * @param {number} opts.step - 每次增減量
 * @param {function|null} opts.onChange - 值變更回調 (newValue: number) => void
 * @param {string} opts.unit - 單位文字，如 '秒'
 * @returns {HTMLElement}
 */
export function createNumberStepper({
  value = 0,
  min = 0,
  max = 99999,
  step = 1,
  onChange = null,
  unit = '秒',
} = {}) {
  let currentValue = Math.max(min, Math.min(max, value));

  const wrapper = document.createElement('div');
  wrapper.className = 'lori-number-stepper lori-input';

  // 減少按鈕
  const minusBtn = document.createElement('button');
  minusBtn.className = 'lori-number-stepper__btn';
  minusBtn.textContent = '－';
  minusBtn.type = 'button';
  minusBtn.setAttribute('aria-label', '減少');

  // 數值顯示
  const display = document.createElement('div');
  display.className = 'lori-number-stepper__display tabnum';

  const numSpan = document.createElement('span');
  numSpan.className = 'lori-number-stepper__num';
  numSpan.textContent = String(currentValue);

  const unitSpan = document.createElement('span');
  unitSpan.className = 'lori-number-stepper__unit';
  unitSpan.textContent = ` ${unit}`;

  display.appendChild(numSpan);
  display.appendChild(unitSpan);

  // 增加按鈕
  const plusBtn = document.createElement('button');
  plusBtn.className = 'lori-number-stepper__btn';
  plusBtn.textContent = '＋';
  plusBtn.type = 'button';
  plusBtn.setAttribute('aria-label', '增加');

  wrapper.appendChild(minusBtn);
  wrapper.appendChild(display);
  wrapper.appendChild(plusBtn);

  function _update(newVal) {
    currentValue = Math.max(min, Math.min(max, newVal));
    numSpan.textContent = String(currentValue);
    minusBtn.disabled = currentValue <= min;
    plusBtn.disabled = currentValue >= max;
    if (onChange) onChange(currentValue);
  }

  minusBtn.addEventListener('click', () => _update(currentValue - step));
  plusBtn.addEventListener('click', () => _update(currentValue + step));

  // 初始停用狀態
  minusBtn.disabled = currentValue <= min;
  plusBtn.disabled = currentValue >= max;

  // 提供取值/設值方法
  wrapper.getValue = () => currentValue;
  wrapper.setValue = (v) => _update(v);

  return wrapper;
}
