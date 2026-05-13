// 小蘿日誌 — Block 編輯頁（Screen 131A）
// HeaderBar（存檔）→ FormRow 表單（名稱、block-rise、block-set）
// → 立即開始卡片（Play）→ 編輯 Step 列表入口 → 存檔寫入 db

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { createFormRow, createTimePicker } from '../components/form-elements.js';
import { navigate } from '../router.js';
import { dbGet, dbPut, dbGetAll } from '../db.js';
import { iconPlay, iconList, iconChev } from '../components/icons.js';
import { formatTime } from '../utils/helpers.js';

/**
 * 包裝 TimePicker：DB 用 HHMM 格式，元件用 HH:MM
 * @param {string} hhmmValue - HHMM 格式值
 * @param {function} onChange - 回傳 HHMM 格式
 * @returns {HTMLElement}
 */
function _createHHMMTimePicker(hhmmValue, onChange) {
  const formatted = hhmmValue && hhmmValue.length >= 4
    ? `${hhmmValue.slice(0, 2)}:${hhmmValue.slice(2)}`
    : '';
  return createTimePicker({
    value: formatted,
    onChange: (newHHMM) => {
      // createTimePicker 的 onChange 回傳 HH:MM，轉回 HHMM
      const val = newHHMM.replace(':', '');
      if (onChange) onChange(val);
    },
  });
}

// ===== 渲染 =====

/**
 * 渲染 Block 編輯頁到容器
 * @param {HTMLElement} root
 * @param {object} params - { blockId: string }
 * @returns {function} cleanup
 */
export function renderBlockEdit(root, params = {}) {
  const blockId = parseInt(params.blockId);
  if (isNaN(blockId)) {
    navigate('#/routine/blocks');
    return;
  }

  root.className = 'lori';

  // 狀態
  let _blockData = null;
  let _stepCount = 0;
  let _totalSeconds = 0;

  // 表單狀態
  const _form = {
    b_name: '',
    b_rise: '',
    b_set: '',
  };

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar（右側存檔按鈕）
  const header = createHeaderBar({
    title: '編輯 Block',
    showBack: true,
    rightLabel: '存檔',
    onRight: () => _handleSave(),
    onBack: () => navigate('#/routine/blocks'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-block-edit';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '36px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 表單容器
  const formContainer = document.createElement('div');
  formContainer.className = 'lori-block-edit__form';
  body.appendChild(formContainer);

  // 載入資料
  _loadBlockEdit(blockId, formContainer);

  // ── 存檔邏輯 ──
  async function _handleSave() {
    if (!_blockData) return;

    const nameVal = _form.b_name.trim();
    if (!nameVal) {
      // 提示名稱必填
      const nameInput = formContainer.querySelector('.lori-block-edit__name-input');
      if (nameInput) {
        nameInput.style.borderColor = 'var(--wine)';
        nameInput.focus();
      }
      return;
    }

    const updated = {
      ..._blockData,
      b_name: nameVal,
      b_rise: _form.b_rise,
      b_set: _form.b_set,
    };

    try {
      await dbPut('blocks', updated);
      navigate('#/routine/blocks');
    } catch (err) {
      console.warn('Block 存檔失敗:', err);
    }
  }

  // ── 載入 Block 資料並渲染表單 ──
  async function _loadBlockEdit(bIndex, container) {
    try {
      const block = await dbGet('blocks', bIndex);
      if (!block) {
        navigate('#/routine/blocks');
        return;
      }
      _blockData = block;
      _form.b_name = block.b_name || '';
      _form.b_rise = block.b_rise || '';
      _form.b_set = block.b_set || '';

      // 取得 steps 資訊
      const steps = await dbGetAll('steps', 'b_index', bIndex);
      _stepCount = steps.length;
      _totalSeconds = steps.reduce((sum, s) => sum + (s.s_time || 0) + (s.s_prebuffer || 0), 0);

      _renderForm(container);
    } catch (err) {
      console.warn('Block 資料載入失敗:', err);
    }
  }

  // ── 渲染表單 ──
  function _renderForm(container) {
    while (container.firstChild) container.removeChild(container.firstChild);

    // Block 名稱
    const nameInput = document.createElement('input');
    nameInput.className = 'lori-input lori-block-edit__name-input';
    nameInput.type = 'text';
    nameInput.placeholder = '輸入名稱';
    nameInput.value = _form.b_name;
    nameInput.addEventListener('input', () => {
      _form.b_name = nameInput.value;
      nameInput.style.borderColor = '';
    });
    container.appendChild(createFormRow({ label: 'Block 名稱', children: nameInput }));

    // block-rise
    const risePicker = _createHHMMTimePicker(_form.b_rise, (val) => {
      _form.b_rise = val;
    });
    container.appendChild(
      createFormRow({ label: 'block-rise（最早啟動）', children: risePicker, hint: '到時間自動開機提示' })
    );

    // block-set
    const setPicker = _createHHMMTimePicker(_form.b_set, (val) => {
      _form.b_set = val;
    });
    container.appendChild(
      createFormRow({ label: 'block-set（最晚啟動）', children: setPicker, hint: '超過此時間不再提醒' })
    );

    // ── 立即開始卡片 ──
    const playCard = document.createElement('div');
    playCard.className = 'lori-card lori-block-edit__play-card';

    const playInfo = document.createElement('div');
    playInfo.className = 'lori-block-edit__play-info';

    const playTitle = document.createElement('div');
    playTitle.className = 'lori-block-edit__play-title';
    playTitle.textContent = '立即開始';
    playInfo.appendChild(playTitle);

    const playSub = document.createElement('div');
    playSub.className = 'lori-block-edit__play-sub';
    playSub.textContent = '跳到計時進行';
    playInfo.appendChild(playSub);

    playCard.appendChild(playInfo);

    const playBtn = document.createElement('button');
    playBtn.className = 'lori-block-edit__play-btn';
    playBtn.setAttribute('aria-label', '開始計時');
    playBtn.appendChild(iconPlay(22));
    playBtn.addEventListener('click', () => {
      navigate(`#/routine/timer/${blockId}`);
    });
    playCard.appendChild(playBtn);

    container.appendChild(playCard);

    // ── 編輯 Step 列表入口 ──
    const stepBar = document.createElement('button');
    stepBar.className = 'lori-card lori-block-edit__step-bar';

    const stepBarLeft = document.createElement('div');
    stepBarLeft.className = 'lori-block-edit__step-bar-left';

    const listIcon = iconList(22);
    stepBarLeft.appendChild(listIcon);

    const stepBarText = document.createElement('div');
    stepBarText.className = 'lori-block-edit__step-bar-text';

    const stepBarTitle = document.createElement('div');
    stepBarTitle.className = 'lori-block-edit__step-bar-title';
    stepBarTitle.textContent = '編輯 Step 列表';
    stepBarText.appendChild(stepBarTitle);

    const stepBarSub = document.createElement('div');
    stepBarSub.className = 'lori-block-edit__step-bar-sub';
    stepBarSub.textContent = `${_stepCount} step · ${formatTime(_totalSeconds)}`;
    stepBarText.appendChild(stepBarSub);

    stepBarLeft.appendChild(stepBarText);
    stepBar.appendChild(stepBarLeft);

    const chevIcon = iconChev(18);
    chevIcon.style.color = 'var(--gray)';
    stepBar.appendChild(chevIcon);

    stepBar.addEventListener('click', () => {
      navigate(`#/routine/blocks/${blockId}/steps`);
    });
    container.appendChild(stepBar);
  }

  // cleanup
  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}
