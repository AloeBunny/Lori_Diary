// 小蘿日誌 — Step 編輯頁（Screen 131B）
// HeaderBar（存檔）→ FormRow：名稱、花費秒數、pre-buffer、備註 → 預覽區塊
// 存檔 → 寫入 db → 回 Step 列表

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { createFormRow, createNumberStepper } from '../components/form-elements.js';
import { navigate } from '../router.js';
import { dbGet, dbPut } from '../db.js';
import { formatTime } from '../utils/helpers.js';

// ===== 渲染 =====

/**
 * 渲染 Step 編輯頁到容器
 * @param {HTMLElement} root
 * @param {object} params - { blockId: string, stepId: string }
 * @returns {function} cleanup
 */
export function renderStepEdit(root, params = {}) {
  const blockId = parseInt(params.blockId);
  const stepId = parseInt(params.stepId);
  if (isNaN(blockId) || isNaN(stepId)) {
    navigate('#/routine/blocks');
    return;
  }

  root.className = 'lori';

  // 表單狀態
  const _form = {
    s_name: '',
    s_time: 60,
    s_prebuffer: 10,
    s_note: '',
  };
  let _stepData = null;

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: '編輯 Step',
    showBack: true,
    rightLabel: '存檔',
    onRight: () => _handleSave(),
    onBack: () => navigate(`#/routine/blocks/${blockId}/steps`),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-step-edit';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '36px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 表單容器
  const formContainer = document.createElement('div');
  formContainer.className = 'lori-step-edit__form';
  body.appendChild(formContainer);

  // 預覽容器
  const previewContainer = document.createElement('div');
  previewContainer.className = 'lori-step-edit__preview';
  body.appendChild(previewContainer);

  // 載入資料
  _loadStepEdit(blockId, stepId, formContainer, previewContainer);

  // ── 存檔邏輯 ──
  async function _handleSave() {
    if (!_stepData) return;

    const nameVal = _form.s_name.trim();
    if (!nameVal) {
      const nameInput = formContainer.querySelector('.lori-step-edit__name-input');
      if (nameInput) {
        nameInput.style.borderColor = 'var(--wine)';
        nameInput.focus();
      }
      return;
    }

    const updated = {
      ..._stepData,
      s_name: nameVal,
      s_time: _form.s_time,
      s_prebuffer: _form.s_prebuffer,
      s_note: _form.s_note,
    };

    try {
      await dbPut('steps', updated);
      navigate(`#/routine/blocks/${blockId}/steps`);
    } catch (err) {
      console.warn('Step 存檔失敗:', err);
    }
  }

  // ── 載入 Step 資料並渲染表單 ──
  async function _loadStepEdit(bIndex, sIndex, formEl, previewEl) {
    try {
      const step = await dbGet('steps', [bIndex, sIndex]);
      if (!step) {
        navigate(`#/routine/blocks/${bIndex}/steps`);
        return;
      }
      _stepData = step;
      _form.s_name = step.s_name || '';
      _form.s_time = step.s_time || 60;
      _form.s_prebuffer = step.s_prebuffer ?? 10;
      _form.s_note = step.s_note || '';

      _renderForm(formEl, previewEl);
    } catch (err) {
      console.warn('Step 資料載入失敗:', err);
    }
  }

  // ── 更新預覽 ──
  function _updatePreview(previewEl) {
    while (previewEl.firstChild) previewEl.removeChild(previewEl.firstChild);

    const total = _form.s_time + _form.s_prebuffer;

    const box = document.createElement('div');
    box.className = 'lori-step-edit__preview-box';

    const text = document.createTextNode('預覽：');
    box.appendChild(text);

    const preSpan = document.createElement('span');
    preSpan.className = 'lori-step-edit__preview-pre';
    preSpan.textContent = `+${_form.s_prebuffer}s`;
    box.appendChild(preSpan);

    const arrow = document.createTextNode(' 緩衝 → ');
    box.appendChild(arrow);

    const timeSpan = document.createElement('span');
    timeSpan.className = 'lori-step-edit__preview-time tabnum';
    timeSpan.textContent = formatTime(_form.s_time);
    box.appendChild(timeSpan);

    const mid = document.createTextNode(' 倒數。總計 ');
    box.appendChild(mid);

    const totalSpan = document.createElement('span');
    totalSpan.className = 'lori-step-edit__preview-total tabnum';
    totalSpan.textContent = formatTime(total);
    box.appendChild(totalSpan);

    const end = document.createTextNode('。');
    box.appendChild(end);

    previewEl.appendChild(box);
  }

  // ── 渲染表單 ──
  function _renderForm(formEl, previewEl) {
    while (formEl.firstChild) formEl.removeChild(formEl.firstChild);

    // Step 名稱
    const nameInput = document.createElement('input');
    nameInput.className = 'lori-input lori-step-edit__name-input';
    nameInput.type = 'text';
    nameInput.placeholder = '輸入 Step 名稱';
    nameInput.value = _form.s_name;
    nameInput.addEventListener('input', () => {
      _form.s_name = nameInput.value;
      nameInput.style.borderColor = '';
    });
    formEl.appendChild(createFormRow({ label: 'Step 名稱', children: nameInput }));

    // 花費秒數（NumberStepper，min=10）
    const timeStepper = createNumberStepper({
      value: _form.s_time,
      min: 10,
      step: 10,
      unit: '秒',
      onChange: (v) => {
        _form.s_time = v;
        _updatePreview(previewEl);
      },
    });
    formEl.appendChild(createFormRow({ label: '花費秒數', children: timeStepper, hint: '主要動作的執行時間' }));

    // pre-buffer 秒數（NumberStepper，min=10，預設10）
    const preStepper = createNumberStepper({
      value: _form.s_prebuffer,
      min: 10,
      step: 5,
      unit: '秒',
      onChange: (v) => {
        _form.s_prebuffer = v;
        _updatePreview(previewEl);
      },
    });
    formEl.appendChild(createFormRow({ label: 'pre-buffer 秒數', children: preStepper, hint: '動作開始前的緩衝（預設 10）' }));

    // 備註（textarea）
    const noteInput = document.createElement('textarea');
    noteInput.className = 'lori-input lori-step-edit__note-input';
    noteInput.placeholder = '（選填）對自己說的話';
    noteInput.value = _form.s_note;
    noteInput.addEventListener('input', () => {
      _form.s_note = noteInput.value;
    });
    formEl.appendChild(createFormRow({ label: '備註', children: noteInput }));

    // 預覽
    _updatePreview(previewEl);
  }

  // cleanup
  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

// renderStepEdit 已透過上方 export 匯出
