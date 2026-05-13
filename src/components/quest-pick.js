// 小蘿日誌 — QuestPick 元件
// 認領列表的 checkbox 項目：方形 CheckBox + 技能標籤 + Quest 名稱 + 目標量
// 用於 1401 認領列表

/**
 * 建立 QuestPick
 * @param {object} opts
 * @param {object} opts.quest - Quest 資料 { q_name, q_unit, q_total }
 * @param {string} opts.skillName - 所屬技能名稱
 * @param {boolean} opts.checked - 是否已勾選
 * @param {string} opts.accent - 勾選時的強調色，預設 var(--violet)
 * @param {function|null} opts.onToggle - 勾選切換回呼 (checked: boolean) => void
 * @returns {HTMLElement}
 */
export function createQuestPick({
  quest = { q_name: '', q_unit: '', q_total: 0 },
  skillName = '',
  checked = false,
  accent = 'var(--violet)',
  onToggle = null,
} = {}) {
  const el = document.createElement('div');
  el.className = 'lori-quest-pick lori-card';
  el.setAttribute('role', 'checkbox');
  el.setAttribute('aria-checked', String(checked));
  el.tabIndex = 0;

  // 儲存狀態
  el._checked = checked;
  el._accent = accent;
  el._quest = quest;
  el._skillName = skillName;
  el._onToggle = onToggle;

  // 渲染
  _renderQuestPick(el);

  // 點擊切換
  el.addEventListener('click', () => {
    el._checked = !el._checked;
    el.setAttribute('aria-checked', String(el._checked));
    _renderQuestPick(el);
    if (el._onToggle) el._onToggle(el._checked);
  });

  return el;
}

/**
 * 內部渲染函式
 */
function _renderQuestPick(el) {
  // 清空
  while (el.firstChild) el.removeChild(el.firstChild);

  const checked = el._checked;
  const accent = el._accent;
  const quest = el._quest;
  const skillName = el._skillName;

  // 更新邊框樣式
  if (checked) {
    el.style.borderColor = accent;
    el.style.boxShadow = `0 0 0 1px ${accent}`;
  } else {
    el.style.borderColor = 'var(--hairline)';
    el.style.boxShadow = 'none';
  }

  // ── checkbox 方塊 ──
  const box = document.createElement('div');
  box.className = 'lori-quest-pick__box';
  if (checked) {
    box.style.background = accent;
    box.style.border = 'none';
    // 打勾 SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('stroke', '#fff');
    svg.setAttribute('stroke-width', '3');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M4 12l5 5L20 6');
    svg.appendChild(path);
    box.appendChild(svg);
  } else {
    box.style.background = 'transparent';
    box.style.border = '1.5px solid var(--gray)';
  }
  el.appendChild(box);

  // ── 中間：技能名 + Quest 名 ──
  const info = document.createElement('div');
  info.className = 'lori-quest-pick__info';

  const skillEl = document.createElement('div');
  skillEl.className = 'lori-quest-pick__skill';
  skillEl.textContent = skillName;
  info.appendChild(skillEl);

  const nameEl = document.createElement('div');
  nameEl.className = 'lori-quest-pick__name';
  nameEl.textContent = quest.q_name;
  info.appendChild(nameEl);

  el.appendChild(info);

  // ── 右側：目標量 + 單位 ──
  const targetWrap = document.createElement('div');
  targetWrap.className = 'lori-quest-pick__target tabnum';

  const numEl = document.createElement('div');
  numEl.className = 'lori-quest-pick__target-num';
  numEl.textContent = String(quest.q_total);
  targetWrap.appendChild(numEl);

  const unitEl = document.createElement('div');
  unitEl.className = 'lori-quest-pick__target-unit';
  unitEl.textContent = quest.q_unit;
  targetWrap.appendChild(unitEl);

  el.appendChild(targetWrap);

  return el;
}

/**
 * 外部設定 checked 狀態（不觸發 callback）
 * @param {HTMLElement} el - createQuestPick 回傳的元素
 * @param {boolean} checked
 */
export function setQuestPick(el, checked) {
  el._checked = checked;
  el.setAttribute('aria-checked', String(checked));
  _renderQuestPick(el);
}
