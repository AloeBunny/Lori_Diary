// 小蘿日誌 — Skill 明細頁（Screen 141A）
// HeaderBar（存檔）→ FormRow 表單（名稱、分類、目標值）
// → 整體進度卡片 → Quest 列表（checkbox = 認領）→ AddBar「新增 Quest」
// 存檔 → db 更新 → 回技能列表

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { createFormRow, createNumberStepper } from '../components/form-elements.js';
import { createAddBar } from '../components/add-bar.js';
import { navigate } from '../router.js';
import { dbGet, dbPut, dbGetAll, dbAdd } from '../db.js';

// ===== 分類選項 =====

const SKILL_CATEGORIES = [
  '工作',
  '語言',
  '閱讀',
  '其他',
];

// ===== 進度計算 =====

/**
 * 計算某個 skill 的整體進度百分比
 * @param {Array} quests
 * @returns {number} 0~100
 */
function calcProgressPercent(quests) {
  if (!quests || quests.length === 0) return 0;
  const completed = quests.filter(q => q.q_total > 0 && q.q_done >= q.q_total).length;
  return Math.round((completed / quests.length) * 100);
}

// ===== 工具 =====

/**
 * 建立 SVG check icon
 * @returns {SVGElement}
 */
function _createCheckSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.classList.add('icon');
  svg.setAttribute('stroke', '#fff');
  svg.setAttribute('stroke-width', '3');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M4 12l5 5L20 6');
  svg.appendChild(path);
  return svg;
}

/**
 * 清空元素所有子節點
 * @param {HTMLElement} el
 */
function _clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

// ===== 渲染 =====

/**
 * 渲染 Skill 明細頁到容器
 * @param {HTMLElement} root
 * @param {object} params - { skillId: string }
 * @returns {function} cleanup
 */
export function renderSkillDetail(root, params = {}) {
  const skillId = parseInt(params.skillId);
  if (isNaN(skillId)) {
    navigate('#/learning/skills');
    return;
  }

  root.className = 'lori';

  // 狀態
  let _skillData = null;
  let _quests = [];

  // 表單狀態
  const _form = {
    sk_name: '',
    sk_category: '',
    sk_target: 0,
  };

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar（右側存檔按鈕）
  const header = createHeaderBar({
    title: '技能明細',
    showBack: true,
    rightLabel: '存檔',
    onRight: () => _handleSave(),
    onBack: () => navigate('#/learning/skills'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-skill-detail';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '160px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 表單容器
  const formContainer = document.createElement('div');
  formContainer.className = 'lori-skill-detail__form';
  body.appendChild(formContainer);

  // AddBar 浮動按鈕
  const addBar = createAddBar({
    label: '新增 Quest',
    onClick: () => _handleAddQuest(),
  });
  root.appendChild(addBar);

  // 載入資料
  _loadSkillData(skillId, formContainer);

  // ── 存檔邏輯 ──
  async function _handleSave() {
    if (!_skillData) return;

    const nameVal = _form.sk_name.trim();
    if (!nameVal) {
      const nameInput = formContainer.querySelector('.lori-skill-detail__name-input');
      if (nameInput) {
        nameInput.style.borderColor = 'var(--wine)';
        nameInput.focus();
      }
      return;
    }

    const updated = {
      ..._skillData,
      sk_name: nameVal,
      sk_category: _form.sk_category,
    };

    try {
      await dbPut('skills', updated);
      navigate('#/learning/skills');
    } catch (err) {
      console.warn('Skill 存檔失敗:', err);
    }
  }

  // ── 新增 Quest ──
  async function _handleAddQuest() {
    try {
      // 找該 skill 最大 q_index + 1
      const maxIdx = _quests.reduce((max, q) => Math.max(max, q.q_index || 0), 0);
      const newQuest = {
        sk_index: skillId,
        q_index: maxIdx + 1,
        q_name: '新 Quest',
        q_unit: '',
        q_total: 0,
        q_done: 0,
        q_seq: 0,
        q_freq: '每日',
        q_carrot: 1,
      };
      await dbAdd('quests', newQuest);

      // 導航到 Quest 編輯頁
      navigate(`#/learning/skills/${skillId}/quests/${newQuest.q_index}`);
    } catch (err) {
      console.warn('新增 Quest 失敗:', err);
    }
  }

  // ── 載入 Skill 資料並渲染表單 ──
  async function _loadSkillData(skIndex, container) {
    try {
      const skill = await dbGet('skills', skIndex);
      if (!skill) {
        navigate('#/learning/skills');
        return;
      }
      _skillData = skill;
      _form.sk_name = skill.sk_name || '';
      _form.sk_category = skill.sk_category || '';

      // 取得 quests
      _quests = await dbGetAll('quests', 'sk_index', skIndex);
      _quests.sort((a, b) => (a.q_index || 0) - (b.q_index || 0));

      _renderForm(container);
    } catch (err) {
      console.warn('Skill 資料載入失敗:', err);
    }
  }

  // ── 渲染表單 ──
  function _renderForm(container) {
    _clearChildren(container);

    // 技能名稱
    const nameInput = document.createElement('input');
    nameInput.className = 'lori-input lori-skill-detail__name-input';
    nameInput.type = 'text';
    nameInput.placeholder = '輸入技能名稱';
    nameInput.value = _form.sk_name;
    nameInput.addEventListener('input', () => {
      _form.sk_name = nameInput.value;
      nameInput.style.borderColor = '';
    });
    container.appendChild(createFormRow({ label: '技能名稱', children: nameInput }));

    // 分類 + 目標值 水平排列
    const rowFlex = document.createElement('div');
    rowFlex.style.display = 'flex';
    rowFlex.style.gap = '10px';

    // 分類（下拉選擇）
    const catSelect = document.createElement('select');
    catSelect.className = 'lori-input lori-skill-detail__cat-select';
    catSelect.style.width = '168px';

    // 空選項
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '選擇分類';
    catSelect.appendChild(emptyOpt);

    SKILL_CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (_form.sk_category === cat) opt.selected = true;
      catSelect.appendChild(opt);
    });

    catSelect.addEventListener('change', () => {
      _form.sk_category = catSelect.value;
    });

    const catRow = createFormRow({ label: '分類', children: catSelect });
    catRow.style.flex = '1';
    rowFlex.appendChild(catRow);

    // 目標值（NumberStepper）
    const targetStepper = createNumberStepper({
      value: _skillData.sk_target || 0,
      min: 0,
      max: 9999,
      step: 1,
      unit: '',
      onChange: (v) => { _form.sk_target = v; },
    });
    const targetRow = createFormRow({ label: '目標值', children: targetStepper });
    targetRow.style.flex = '1';
    rowFlex.appendChild(targetRow);

    container.appendChild(rowFlex);

    // ── 整體進度卡片 ──
    const progressPct = calcProgressPercent(_quests);
    const progressCard = document.createElement('div');
    progressCard.className = 'lori-card lori-skill-detail__progress-card';

    const progressTop = document.createElement('div');
    progressTop.className = 'lori-skill-detail__progress-top';

    const progressLabel = document.createElement('div');
    progressLabel.className = 'lori-skill-detail__progress-label';
    progressLabel.textContent = '整體進度';
    progressTop.appendChild(progressLabel);

    const progressNum = document.createElement('div');
    progressNum.className = 'tabnum lori-skill-detail__progress-num';
    progressNum.textContent = `${progressPct}%`;
    progressTop.appendChild(progressNum);

    progressCard.appendChild(progressTop);

    // 進度條
    const progressTrack = document.createElement('div');
    progressTrack.className = 'lori-skill-detail__progress-track';

    const progressFill = document.createElement('div');
    progressFill.className = 'lori-skill-detail__progress-fill';
    progressFill.style.width = `${progressPct}%`;
    progressTrack.appendChild(progressFill);

    progressCard.appendChild(progressTrack);

    // 完成說明
    const progressInfo = document.createElement('div');
    progressInfo.className = 'lori-skill-detail__progress-info';
    const completedCount = _quests.filter(q => q.q_total > 0 && q.q_done >= q.q_total).length;
    progressInfo.textContent = `${completedCount} / ${_quests.length} quest 完成`;
    progressCard.appendChild(progressInfo);

    container.appendChild(progressCard);

    // ── Quest 列表 ──
    const questSection = document.createElement('div');
    questSection.className = 'lori-skill-detail__quest-section';

    // 標題行
    const questHeader = document.createElement('div');
    questHeader.className = 'lori-skill-detail__quest-header';

    const questTitle = document.createElement('div');
    questTitle.className = 'lori-skill-detail__quest-title';
    questTitle.textContent = `Quest（${_quests.length}）`;
    questHeader.appendChild(questTitle);

    const questHint = document.createElement('div');
    questHint.className = 'lori-skill-detail__quest-hint';
    questHint.textContent = '勾選 = 認領';
    questHeader.appendChild(questHint);

    questSection.appendChild(questHeader);

    // Quest 條目
    const questList = document.createElement('div');
    questList.className = 'lori-skill-detail__quest-list';

    if (_quests.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'lori-skill-detail__quest-empty';
      emptyMsg.textContent = '還沒有任何 Quest';
      questList.appendChild(emptyMsg);
    } else {
      _quests.forEach(quest => {
        const questRow = _createQuestRow(quest);
        questList.appendChild(questRow);
      });
    }

    questSection.appendChild(questList);
    container.appendChild(questSection);
  }

  // ── 建立 Quest 列表行 ──
  function _createQuestRow(quest) {
    const row = document.createElement('div');
    row.className = 'lori-card lori-skill-detail__quest-row';

    // checkbox
    let isClaimed = false;
    const checkbox = document.createElement('div');
    checkbox.className = 'lori-skill-detail__quest-checkbox';

    function _renderCheckboxState() {
      _clearChildren(checkbox);
      if (isClaimed) {
        checkbox.style.background = 'var(--violet)';
        checkbox.style.border = 'none';
        checkbox.appendChild(_createCheckSvg());
      } else {
        checkbox.style.background = 'transparent';
        checkbox.style.border = '1.5px solid var(--gray)';
      }
    }

    _renderCheckboxState();

    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      isClaimed = !isClaimed;
      _renderCheckboxState();
    });

    row.appendChild(checkbox);

    // Quest 名稱
    const nameEl = document.createElement('div');
    nameEl.className = 'lori-skill-detail__quest-name';
    nameEl.textContent = quest.q_name || '';
    row.appendChild(nameEl);

    // 目標資訊
    const targetEl = document.createElement('div');
    targetEl.className = 'lori-skill-detail__quest-target';
    if (quest.q_total > 0) {
      targetEl.textContent = `${quest.q_done || 0}/${quest.q_total} ${quest.q_unit || ''}`;
    } else {
      targetEl.textContent = quest.q_freq || '';
    }
    row.appendChild(targetEl);

    // 點擊行→進入 Quest 編輯
    row.addEventListener('click', () => {
      navigate(`#/learning/skills/${skillId}/quests/${quest.q_index}`);
    });
    row.style.cursor = 'pointer';

    return row;
  }

  // cleanup
  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

// 匯出供測試
export { SKILL_CATEGORIES, calcProgressPercent };
