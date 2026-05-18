// 小蘿日誌 — Step 列表頁（Screen 1311）
// HeaderBar（完成按鈕 → 回 Block 編輯）→ 欄位標頭 → StepRow 列表 → AddBar

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { createAddBar } from '../components/add-bar.js';
import { createStepRow } from '../components/step-row.js';
import { navigate } from '../router.js';
import { dbGetAll, dbAdd, dbGet, dbDelete } from '../db.js';
import { formatTime } from '../utils/helpers.js';

// ===== 渲染 =====

/**
 * 渲染 Step 列表頁到容器
 * @param {HTMLElement} root
 * @param {object} params - { blockId: string }
 * @returns {function} cleanup
 */
export function renderStepList(root, params = {}) {
  const blockId = parseInt(params.blockId);
  if (isNaN(blockId)) {
    navigate('#/routine/blocks');
    return;
  }

  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar（右側「完成」按鈕 → 回 Block 編輯）
  const header = createHeaderBar({
    title: 'Step 列表',
    showBack: true,
    rightLabel: '完成',
    onRight: () => navigate(`#/routine/blocks/${blockId}`),
    onBack: () => navigate(`#/routine/blocks/${blockId}`),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-step-list';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '160px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 欄位標頭
  const colHeaders = document.createElement('div');
  colHeaders.className = 'lori-step-list__col-headers';

  const colName = document.createElement('div');
  colName.className = 'lori-step-list__col-name';
  colName.textContent = '名稱';
  colHeaders.appendChild(colName);

  const colTime = document.createElement('div');
  colTime.className = 'lori-step-list__col-time';
  colTime.textContent = '時間';
  colHeaders.appendChild(colTime);

  const colPre = document.createElement('div');
  colPre.className = 'lori-step-list__col-pre';
  colPre.textContent = 'pre-buffer';
  colHeaders.appendChild(colPre);

  body.appendChild(colHeaders);

  // 列表容器
  const listContainer = document.createElement('div');
  listContainer.className = 'lori-step-list__rows';
  body.appendChild(listContainer);

  // AddBar
  const addBar = createAddBar({
    label: '新增 Step',
    onClick: () => _handleAddStep(blockId, listContainer),
  });
  root.appendChild(addBar);

  // 載入資料
  _loadStepData(blockId, listContainer, header);

  // cleanup
  return () => {
    const rows = root.querySelectorAll('.lori-step-row-wrap');
    rows.forEach(row => { if (row._swipeCtrl) row._swipeCtrl.destroy(); });
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 載入 Step 資料並渲染列表
 */
async function _loadStepData(blockId, listContainer, header) {
  try {
    // 取得 block 資訊以更新標題
    const block = await dbGet('blocks', blockId);
    if (block) {
      const titleEl = header.querySelector('.header-bar__title');
      if (titleEl) titleEl.textContent = `Step · ${block.b_name}`;
    }

    const steps = await dbGetAll('steps', 'b_index', blockId);

    // 清空列表
    while (listContainer.firstChild) listContainer.removeChild(listContainer.firstChild);

    if (steps.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'lori-step-list__empty';
      emptyMsg.textContent = '還沒有任何 Step';
      listContainer.appendChild(emptyMsg);
      return;
    }

    // 依 s_index 排序
    steps.sort((a, b) => a.s_index - b.s_index);

    steps.forEach(step => {
      const row = createStepRow({
        step,
        onClick: () => navigate(`#/routine/blocks/${blockId}/steps/${step.s_index}`),
        onDelete: async (sIndex) => {
          if (!confirm(`確定刪除「${step.s_name}」？`)) return;
          try {
            await dbDelete('steps', [blockId, sIndex]);
            _loadStepData(blockId, listContainer, header);
          } catch (err) {
            console.warn('Step 刪除失敗:', err);
          }
        },
      });
      listContainer.appendChild(row);
    });
  } catch (err) {
    console.warn('Step 列表載入失敗:', err);
    const errorMsg = document.createElement('div');
    errorMsg.className = 'lori-step-list__empty';
    errorMsg.textContent = '資料載入失敗';
    listContainer.appendChild(errorMsg);
  }
}

/**
 * 新增 Step：產生下一個 s_index，寫入 db，進入編輯頁
 */
async function _handleAddStep(blockId, listContainer) {
  try {
    const steps = await dbGetAll('steps', 'b_index', blockId);
    const maxIndex = steps.reduce((max, s) => Math.max(max, s.s_index || 0), 0);
    const newStep = {
      b_index: blockId,
      s_index: maxIndex + 1,
      s_name: '新 Step',
      s_time: 60,
      s_prebuffer: 10,
    };
    await dbAdd('steps', newStep);

    // 進入編輯頁
    navigate(`#/routine/blocks/${blockId}/steps/${newStep.s_index}`);
  } catch (err) {
    console.warn('新增 Step 失敗:', err);
  }
}

// 匯出供測試
export { _handleAddStep };
