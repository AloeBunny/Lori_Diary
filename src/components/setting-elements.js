// 小蘿日誌 — 設定頁元件
// SettingRow + ToggleSwitch + Slider
// 用於 Screen 1500 設定頁

import { iconChev } from './icons.js';

/**
 * 建立 SettingRow（設定項目行：icon + label + 右側控制項）
 * @param {object} opts
 * @param {string} opts.label - 主標籤
 * @param {string} opts.sub - 副標籤（可選）
 * @param {function} opts.icon - icon 工廠函式，如 iconBell，呼叫後回傳 SVG
 * @param {string} opts.accent - icon 背景強調色（預設 mint 淡底）
 * @param {boolean} opts.last - 是否為群組最後一列（不顯示底線）
 * @param {HTMLElement|null} opts.children - 右側控制項（null = 顯示 chevron 箭頭）
 * @param {function|null} opts.onClick - 點擊整行時的回呼
 * @returns {HTMLElement}
 */
export function createSettingRow({
  label = '',
  sub = '',
  icon = null,
  accent = 'var(--ink)',
  last = false,
  children = null,
  onClick = null,
} = {}) {
  const row = document.createElement('div');
  row.className = 'row lori-setting-row';
  if (last) row.classList.add('lori-setting-row--last');
  if (onClick) {
    row.style.cursor = 'pointer';
    row.addEventListener('click', (e) => {
      // 避免點到 children 內部的互動元件時也觸發
      if (e.target.closest('.lori-toggle-switch') || e.target.closest('.lori-slider')) return;
      onClick();
    });
  }

  // 左側 icon 圓底
  const iconWrap = document.createElement('div');
  iconWrap.className = 'lori-setting-row__icon';
  iconWrap.style.color = accent;
  if (icon) {
    iconWrap.appendChild(icon(20));
  }
  row.appendChild(iconWrap);

  // 中間文字
  const textWrap = document.createElement('div');
  textWrap.className = 'lori-setting-row__text';

  const nameEl = document.createElement('div');
  nameEl.className = 'lori-setting-row__name';
  nameEl.textContent = label;
  textWrap.appendChild(nameEl);

  if (sub) {
    const subEl = document.createElement('div');
    subEl.className = 'lori-setting-row__sub';
    subEl.textContent = sub;
    textWrap.appendChild(subEl);
  }
  row.appendChild(textWrap);

  // 右側控制項
  if (children) {
    row.appendChild(children);
  } else {
    // 預設顯示 chevron 箭頭
    const chevWrap = document.createElement('div');
    chevWrap.className = 'lori-setting-row__chev';
    const chevSvg = iconChev(16);
    chevSvg.setAttribute('stroke', 'var(--gray)');
    chevWrap.appendChild(chevSvg);
    row.appendChild(chevWrap);
  }

  return row;
}

/**
 * 建立 ToggleSwitch（純開/關開關）
 * @param {object} opts
 * @param {boolean} opts.checked - 是否開啟
 * @param {function|null} opts.onChange - 切換回呼 (checked: boolean) => void
 * @returns {HTMLElement}
 */
export function createToggleSwitch({
  checked = false,
  onChange = null,
} = {}) {
  const el = document.createElement('div');
  el.className = 'lori-toggle-switch';
  el.setAttribute('role', 'switch');
  el.setAttribute('aria-checked', String(checked));
  el.tabIndex = 0;

  el._checked = checked;
  el._onChange = onChange;

  // 圓形滑塊
  const thumb = document.createElement('div');
  thumb.className = 'lori-toggle-switch__thumb';
  el.appendChild(thumb);

  // 渲染狀態
  _renderSwitch(el);

  // 點擊切換
  el.addEventListener('click', () => {
    el._checked = !el._checked;
    el.setAttribute('aria-checked', String(el._checked));
    _renderSwitch(el);
    if (el._onChange) el._onChange(el._checked);
  });

  return el;
}

/**
 * 內部渲染 ToggleSwitch 狀態
 */
function _renderSwitch(el) {
  if (el._checked) {
    el.classList.add('lori-toggle-switch--on');
    el.classList.remove('lori-toggle-switch--off');
  } else {
    el.classList.add('lori-toggle-switch--off');
    el.classList.remove('lori-toggle-switch--on');
  }
}

/**
 * 外部設定 ToggleSwitch 狀態（不觸發 callback）
 * @param {HTMLElement} el
 * @param {boolean} checked
 */
export function setToggleSwitch(el, checked) {
  el._checked = checked;
  el.setAttribute('aria-checked', String(checked));
  _renderSwitch(el);
}

/**
 * 建立 Slider（滑桿，0~100）
 * @param {object} opts
 * @param {number} opts.value - 目前值（0~100）
 * @param {string} opts.label - 滑桿標籤
 * @param {function|null} opts.onChange - 拖動回呼 (value: number) => void
 * @returns {HTMLElement}
 */
export function createSlider({
  value = 50,
  label = '',
  onChange = null,
} = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'lori-slider';

  // 標籤列
  const labelRow = document.createElement('div');
  labelRow.className = 'lori-slider__label-row';

  const nameEl = document.createElement('span');
  nameEl.className = 'lori-slider__name';
  nameEl.textContent = label;
  labelRow.appendChild(nameEl);

  const valEl = document.createElement('span');
  valEl.className = 'lori-slider__value tabnum';
  valEl.textContent = String(Math.round(value));
  labelRow.appendChild(valEl);

  wrap.appendChild(labelRow);

  // 滑桿軌道
  const track = document.createElement('div');
  track.className = 'lori-slider__track';

  const fill = document.createElement('div');
  fill.className = 'lori-slider__fill';
  fill.style.width = `${value}%`;
  track.appendChild(fill);

  const thumb = document.createElement('div');
  thumb.className = 'lori-slider__thumb';
  thumb.style.left = `${value}%`;
  track.appendChild(thumb);

  wrap.appendChild(track);

  // 儲存狀態
  wrap._value = value;
  wrap._onChange = onChange;

  // 拖曳邏輯
  let dragging = false;

  function updateValue(clientX) {
    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);
    wrap._value = pct;
    fill.style.width = `${pct}%`;
    thumb.style.left = `${pct}%`;
    valEl.textContent = String(pct);
    if (wrap._onChange) wrap._onChange(pct);
  }

  // 滑鼠事件
  track.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
    updateValue(e.clientX);
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    e.preventDefault();
    updateValue(e.clientX);
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
  });

  // 觸控事件
  track.addEventListener('touchstart', (e) => {
    dragging = true;
    updateValue(e.touches[0].clientX);
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    updateValue(e.touches[0].clientX);
  }, { passive: true });
  document.addEventListener('touchend', () => {
    dragging = false;
  });

  // 提供取值 / 設值方法
  wrap.getValue = () => wrap._value;
  wrap.setValue = (v) => {
    const clamped = Math.max(0, Math.min(100, Math.round(v)));
    wrap._value = clamped;
    fill.style.width = `${clamped}%`;
    thumb.style.left = `${clamped}%`;
    valEl.textContent = String(clamped);
  };

  return wrap;
}
