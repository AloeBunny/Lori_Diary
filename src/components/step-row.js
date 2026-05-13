// 小蘿日誌 — StepRow 元件
// Step 列表單行：序號 + 名稱 + 時間顯示 + 狀態圖示
// 用於 1311 Step 列表、1301 計時進行

import { formatTime } from '../utils/helpers.js';
import { iconCheck, iconSkip } from './icons.js';

/**
 * 建立 StepRow
 * @param {object} opts
 * @param {object} opts.step - Step 資料物件 { s_index, s_name, s_time, s_prebuffer }
 * @param {string} opts.status - 狀態：'pending' | 'active' | 'done' | 'skipped'
 * @param {function|null} opts.onClick - 點擊回調 (s_index) => void
 * @returns {HTMLElement}
 */
export function createStepRow({
  step = { s_index: 0, s_name: '', s_time: 0, s_prebuffer: 10 },
  status = 'pending',
  onClick = null,
} = {}) {
  const { s_index, s_name, s_time, s_prebuffer } = step;

  const row = document.createElement('div');
  row.className = 'lori-step-row lori-card';
  row.dataset.stepIndex = String(s_index);

  // 狀態 class
  if (status === 'active') row.classList.add('lori-step-row--active');
  if (status === 'done') row.classList.add('lori-step-row--done');
  if (status === 'skipped') row.classList.add('lori-step-row--skipped');

  // ── 序號 ──
  const idxEl = document.createElement('div');
  idxEl.className = 'lori-step-row__idx tabnum';
  idxEl.textContent = String(s_index);
  row.appendChild(idxEl);

  // ── 名稱 ──
  const nameEl = document.createElement('div');
  nameEl.className = 'lori-step-row__name';
  nameEl.textContent = s_name;
  row.appendChild(nameEl);

  // ── 時間顯示（格式化秒數為 MM:SS） ──
  const timeEl = document.createElement('div');
  timeEl.className = 'lori-step-row__time tabnum';
  timeEl.textContent = formatTime(s_time);
  row.appendChild(timeEl);

  // ── 分隔線 ──
  const divider = document.createElement('div');
  divider.className = 'lori-step-row__divider';
  row.appendChild(divider);

  // ── pre-buffer 顯示 ──
  const preEl = document.createElement('div');
  preEl.className = 'lori-step-row__pre tabnum';
  preEl.textContent = `+${s_prebuffer}s`;
  row.appendChild(preEl);

  // ── 狀態圖示（done / skipped 時顯示，取代 pre-buffer 位置右側） ──
  if (status === 'done' || status === 'skipped') {
    const statusEl = document.createElement('div');
    statusEl.className = 'lori-step-row__status';
    if (status === 'done') {
      const checkIcon = iconCheck(16);
      checkIcon.setAttribute('stroke', 'var(--green)');
      checkIcon.setAttribute('stroke-width', '2.4');
      statusEl.appendChild(checkIcon);
    } else {
      const skipIcon = iconSkip(16);
      skipIcon.setAttribute('stroke', 'var(--gray)');
      statusEl.appendChild(skipIcon);
    }
    row.appendChild(statusEl);
  }

  // ── 點擊事件 ──
  if (onClick) {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => onClick(s_index));
  }

  return row;
}
