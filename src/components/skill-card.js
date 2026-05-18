// 小蘿日誌 — SkillCard 元件
// 技能卡片：名稱 + 分類標籤 + 進度% + PillBar + quest 數 + 左滑刪除
// 用於 1410 技能列表

import { createPillBar, updatePillBar } from './pill-bar.js';
import { iconTrash } from './icons.js';
import { bindSwipe } from '../utils/swipe.js';

/**
 * 建立 SkillCard
 * @param {object} opts
 * @param {object} opts.skill - Skill 資料 { sk_index, sk_name, sk_category, progress }
 *   progress 為 0~100 百分比
 * @param {number} opts.questCount - 該 Skill 下的 Quest 數量
 * @param {string} opts.color - 進度條顏色，預設 var(--hm-mint)
 * @param {function|null} opts.onClick - 點擊回呼 (sk_index) => void
 * @param {function|null} opts.onDelete - 刪除回呼 (sk_index) => void
 * @returns {HTMLElement}
 */
export function createSkillCard({
  skill = { sk_index: 0, sk_name: '', sk_category: '', progress: 0 },
  questCount = 0,
  color = 'var(--hm-mint)',
  onClick = null,
  onDelete = null,
} = {}) {
  const { sk_index, sk_name, sk_category, progress } = skill;
  const clamped = Math.max(0, Math.min(100, progress));

  // ── 外層容器（含刪除區域） ──
  const wrapper = document.createElement('div');
  wrapper.className = 'lori-skill-card-wrap';
  wrapper.dataset.skillIndex = String(sk_index);

  // ── 刪除按鈕（底層） ──
  const deleteZone = document.createElement('div');
  deleteZone.className = 'lori-skill-card-wrap__delete';
  const trashIcon = iconTrash(20);
  trashIcon.setAttribute('stroke', '#fff');
  deleteZone.appendChild(trashIcon);
  deleteZone.addEventListener('click', () => {
    if (onDelete) onDelete(sk_index);
  });
  wrapper.appendChild(deleteZone);

  // ── 卡片本體（滑動層） ──
  const card = document.createElement('div');
  card.className = 'lori-skill-card lori-card';
  card.dataset.skillIndex = String(sk_index);

  // ── 主要內容列 ──
  const mainRow = document.createElement('div');
  mainRow.className = 'lori-skill-card__main';

  // 左側：名稱 + 分類
  const leftCol = document.createElement('div');
  leftCol.className = 'lori-skill-card__left';

  const nameEl = document.createElement('div');
  nameEl.className = 'lori-skill-card__name';
  nameEl.textContent = sk_name;
  leftCol.appendChild(nameEl);

  const catEl = document.createElement('div');
  catEl.className = 'lori-skill-card__cat';
  catEl.textContent = sk_category;
  leftCol.appendChild(catEl);

  mainRow.appendChild(leftCol);

  // 右側：百分比 + quest 數
  const rightCol = document.createElement('div');
  rightCol.className = 'lori-skill-card__right';

  const pctWrap = document.createElement('div');
  pctWrap.className = 'lori-skill-card__pct tabnum';

  const pctNum = document.createElement('span');
  pctNum.className = 'lori-skill-card__pct-num';
  pctNum.style.color = color;
  pctNum.textContent = String(Math.round(clamped));
  pctWrap.appendChild(pctNum);

  const pctUnit = document.createElement('span');
  pctUnit.className = 'lori-skill-card__pct-unit';
  pctUnit.textContent = '%';
  pctWrap.appendChild(pctUnit);

  rightCol.appendChild(pctWrap);

  const questEl = document.createElement('div');
  questEl.className = 'lori-skill-card__quest-count';
  questEl.textContent = `${questCount} quest`;
  rightCol.appendChild(questEl);

  mainRow.appendChild(rightCol);
  card.appendChild(mainRow);

  // ── PillBar 進度條 ──
  const pillWrap = document.createElement('div');
  pillWrap.className = 'lori-skill-card__pill';
  const pillBar = createPillBar({
    percent: clamped,
    color: color,
    height: 6,
    bg: '#EFEBE1',
  });
  pillWrap.appendChild(pillBar);
  card.appendChild(pillWrap);

  // 暴露 PillBar 供更新用（放在 wrapper 上，因為 wrapper 是回傳元素）
  card._pillBar = pillBar;

  // ── 點擊事件 ──
  if (onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => onClick(sk_index));
  }

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
  wrapper._pillBar = pillBar;

  return wrapper;
}

/**
 * 銷毀 SkillCard（清除 swipe 事件）
 * @param {HTMLElement} el - createSkillCard 回傳的元素
 */
export function destroySkillCard(el) {
  if (el._swipeCtrl) {
    el._swipeCtrl.destroy();
  }
}

/**
 * 更新 SkillCard 進度
 * @param {HTMLElement} cardEl - createSkillCard 回傳的元素
 * @param {number} percent - 新百分比 0~100
 */
export function updateSkillCard(cardEl, percent) {
  const clamped = Math.max(0, Math.min(100, percent));

  const pctNum = cardEl.querySelector('.lori-skill-card__pct-num');
  if (pctNum) pctNum.textContent = String(Math.round(clamped));

  const pill = cardEl._pillBar;
  if (pill) {
    updatePillBar(pill, clamped);
  }
}
