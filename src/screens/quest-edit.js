// 小蘿日誌 — Quest 編輯頁（Screen 141B）
// HeaderBar（存檔）→ FormRow 表單
// （名稱、單位、總量 NumberStepper、排序方式 Toggle、頻率）
// 存檔 → db 更新 → 回 Skill 明細

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { createFormRow, createNumberStepper } from '../components/form-elements.js';
import { createToggle } from '../components/toggle.js';
import { navigate } from '../router.js';
import { dbGet, dbPut } from '../db.js';

// ===== 頻率選項 =====

const FREQ_OPTIONS = [
  '每日',
  '每週',
  '每月',
  '不限',
];

// ===== 渲染 =====

/**
 * 渲染 Quest 編輯頁到容器
 * @param {HTMLElement} root
 * @param {object} params - { skillId: string, questId: string }
 * @returns {function} cleanup
 */
export function renderQuestEdit(root, params = {}) {
  const skillId = parseInt(params.skillId);
  const questId = parseInt(params.questId);
  if (isNaN(skillId) || isNaN(questId)) {
    navigate('#/learning/skills');
    return;
  }

  root.className = 'lori';

  // 狀態
  let _questData = null;

  // 表單狀態
  const _form = {
    q_name: '',
    q_unit: '',
    q_total: 0,
    q_seq: 0,      // >0 有序, 0 無序
    q_freq: '每日',
  };

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar（右側存檔按鈕）
  const header = createHeaderBar({
    title: '編輯 Quest',
    showBack: true,
    rightLabel: '存檔',
    onRight: () => _handleSave(),
    onBack: () => navigate(`#/learning/skills/${skillId}`),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-quest-edit';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '36px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 表單容器
  const formContainer = document.createElement('div');
  formContainer.className = 'lori-quest-edit__form';
  body.appendChild(formContainer);

  // 載入資料
  _loadQuestData(skillId, questId, formContainer);

  // ── 存檔邏輯 ──
  async function _handleSave() {
    if (!_questData) return;

    const nameVal = _form.q_name.trim();
    if (!nameVal) {
      const nameInput = formContainer.querySelector('.lori-quest-edit__name-input');
      if (nameInput) {
        nameInput.style.borderColor = 'var(--wine)';
        nameInput.focus();
      }
      return;
    }

    const updated = {
      ..._questData,
      q_name: nameVal,
      q_unit: _form.q_unit,
      q_total: _form.q_total,
      q_seq: _form.q_seq,
      q_freq: _form.q_freq,
    };

    try {
      await dbPut('quests', updated);
      navigate(`#/learning/skills/${skillId}`);
    } catch (err) {
      console.warn('Quest 存檔失敗:', err);
    }
  }

  // ── 載入 Quest 資料 ──
  async function _loadQuestData(skIdx, qIdx, container) {
    try {
      const quest = await dbGet('quests', [skIdx, qIdx]);
      if (!quest) {
        navigate(`#/learning/skills/${skIdx}`);
        return;
      }
      _questData = quest;
      _form.q_name = quest.q_name || '';
      _form.q_unit = quest.q_unit || '';
      _form.q_total = quest.q_total || 0;
      _form.q_seq = quest.q_seq || 0;
      _form.q_freq = quest.q_freq || '每日';

      _renderForm(container);
    } catch (err) {
      console.warn('Quest 資料載入失敗:', err);
    }
  }

  // ── 渲染表單 ──
  function _renderForm(container) {
    while (container.firstChild) container.removeChild(container.firstChild);

    // Quest 名稱
    const nameInput = document.createElement('input');
    nameInput.className = 'lori-input lori-quest-edit__name-input';
    nameInput.type = 'text';
    nameInput.placeholder = '輸入 Quest 名稱';
    nameInput.value = _form.q_name;
    nameInput.addEventListener('input', () => {
      _form.q_name = nameInput.value;
      nameInput.style.borderColor = '';
    });
    container.appendChild(createFormRow({ label: 'Quest 名稱', children: nameInput }));

    // 單位 + 總量 水平排列
    const rowFlex = document.createElement('div');
    rowFlex.style.display = 'flex';
    rowFlex.style.gap = '10px';

    // 單位
    const unitInput = document.createElement('input');
    unitInput.className = 'lori-input';
    unitInput.type = 'text';
    unitInput.placeholder = '頁/題/章/篇';
    unitInput.value = _form.q_unit;
    unitInput.addEventListener('input', () => {
      _form.q_unit = unitInput.value;
    });
    const unitRow = createFormRow({ label: '單位', children: unitInput });
    unitRow.style.flex = '1';
    rowFlex.appendChild(unitRow);

    // 總量（NumberStepper）
    const totalStepper = createNumberStepper({
      value: _form.q_total,
      min: 0,
      max: 99999,
      step: 1,
      unit: '',
      onChange: (v) => { _form.q_total = v; },
    });
    const totalRow = createFormRow({ label: '總量', children: totalStepper });
    totalRow.style.flex = '1';
    rowFlex.appendChild(totalRow);

    container.appendChild(rowFlex);

    // 排序方式 Toggle
    // q_seq > 0 = 有序（checked=false，左邊選中）
    // q_seq = 0 = 無序（checked=true，右邊選中）
    const toggle = createToggle({
      checked: _form.q_seq === 0,
      labelOff: '有序',
      labelOn: '無序',
      onChange: (checked) => {
        // checked = true → 無序 → q_seq = 0
        // checked = false → 有序 → q_seq = 1
        _form.q_seq = checked ? 0 : 1;
      },
    });
    container.appendChild(createFormRow({
      label: '排序方式',
      children: toggle,
      hint: '有序 = 必須按順序完成；無序 = 可任意打勾',
    }));

    // 頻率（下拉選擇）
    const freqSelect = document.createElement('select');
    freqSelect.className = 'lori-input';

    FREQ_OPTIONS.forEach(freq => {
      const opt = document.createElement('option');
      opt.value = freq;
      opt.textContent = freq;
      if (_form.q_freq === freq) opt.selected = true;
      freqSelect.appendChild(opt);
    });

    freqSelect.addEventListener('change', () => {
      _form.q_freq = freqSelect.value;
    });

    container.appendChild(createFormRow({ label: '頻率', children: freqSelect }));
  }

  // cleanup
  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

// 匯出供測試
export { FREQ_OPTIONS };
