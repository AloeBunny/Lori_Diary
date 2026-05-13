// 小蘿日誌 — QuestPreviewCard 元件
// 今日認領的 Quest 預覽卡片：技能名標籤 + Quest 名稱 + PillBar 進度 + 完成按鈕
// 用於 1400 學習主頁

import { createPillBar, updatePillBar } from './pill-bar.js';

/**
 * 建立 QuestPreviewCard
 * @param {object} opts
 * @param {object} opts.quest - Quest 資料 { q_name, q_unit, c_target, c_actual }
 * @param {string} opts.skillName - 所屬技能名稱
 * @param {number} opts.progressPercent - 完成百分比 0~100
 * @param {string} opts.color - 進度條顏色，預設 var(--hm-sun)
 * @param {function|null} opts.onComplete - 點完成按鈕回呼 () => void
 * @returns {HTMLElement}
 */
export function createQuestPreviewCard({
  quest = { q_name: '', q_unit: '', c_target: 0, c_actual: 0 },
  skillName = '',
  progressPercent = 0,
  color = 'var(--hm-sun)',
  onComplete = null,
} = {}) {
  const clamped = Math.max(0, Math.min(100, progressPercent));

  // ── 外層卡片 ──
  const card = document.createElement('div');
  card.className = 'lori-quest-preview lori-card';

  // ── 頂列：技能名 + 數量 ──
  const topRow = document.createElement('div');
  topRow.className = 'lori-quest-preview__top';

  const skillLabel = document.createElement('div');
  skillLabel.className = 'lori-quest-preview__skill';
  skillLabel.textContent = skillName;
  topRow.appendChild(skillLabel);

  const countLabel = document.createElement('div');
  countLabel.className = 'lori-quest-preview__count tabnum';
  countLabel.textContent = `${quest.c_actual} / ${quest.c_target}`;
  topRow.appendChild(countLabel);

  card.appendChild(topRow);

  // ── Quest 名稱 ──
  const nameEl = document.createElement('div');
  nameEl.className = 'lori-quest-preview__name';
  nameEl.textContent = quest.q_name;
  card.appendChild(nameEl);

  // ── PillBar 進度條 ──
  const pillWrap = document.createElement('div');
  pillWrap.className = 'lori-quest-preview__pill';
  const pillBar = createPillBar({
    percent: clamped,
    color: color,
    height: 10,
    bg: '#EFEBE1',
  });
  pillWrap.appendChild(pillBar);
  card.appendChild(pillWrap);

  // ── 底列：百分比 + 完成按鈕 ──
  const bottomRow = document.createElement('div');
  bottomRow.className = 'lori-quest-preview__bottom';

  const pctEl = document.createElement('div');
  pctEl.className = 'lori-quest-preview__pct tabnum';
  pctEl.style.color = color;
  pctEl.textContent = `${Math.round(clamped)}%`;
  bottomRow.appendChild(pctEl);

  if (onComplete) {
    const btn = document.createElement('button');
    btn.className = 'lori-btn lori-quest-preview__complete-btn';
    btn.textContent = '完成';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onComplete();
    });
    bottomRow.appendChild(btn);
  }

  card.appendChild(bottomRow);

  // 暴露 PillBar 供更新用
  card._pillBar = pillBar;

  return card;
}

/**
 * 更新 QuestPreviewCard 進度
 * @param {HTMLElement} cardEl - createQuestPreviewCard 回傳的元素
 * @param {number} percent - 新百分比 0~100
 * @param {number} actual - 新的實際完成量
 * @param {number} target - 目標量
 */
export function updateQuestPreviewCard(cardEl, percent, actual, target) {
  const clamped = Math.max(0, Math.min(100, percent));

  // 更新百分比文字
  const pctEl = cardEl.querySelector('.lori-quest-preview__pct');
  if (pctEl) pctEl.textContent = `${Math.round(clamped)}%`;

  // 更新數量文字
  const countEl = cardEl.querySelector('.lori-quest-preview__count');
  if (countEl && actual !== undefined && target !== undefined) {
    countEl.textContent = `${actual} / ${target}`;
  }

  // 更新 PillBar
  if (cardEl._pillBar) {
    updatePillBar(cardEl._pillBar, clamped);
  }
}
