// 小蘿日誌 — Block 列表頁（Screen 1310）
// StatusBar → HeaderBar「Routine 選擇」→ BlockCard 列表 → AddBar → TabBar
// 從 db 讀所有 blocks + 計算每個的 step 數

import { createStatusBar } from '../components/status-bar.js';
import { createTabBar } from '../components/tab-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { createBlockCard } from '../components/block-card.js';
import { createAddBar } from '../components/add-bar.js';
import { navigate } from '../router.js';
import { dbGetAll, dbAdd, dbCount, dbDelete } from '../db.js';

// ===== 色票輪轉 =====

const BLOCK_COLORS = [
  'var(--hm-mint)',
  'var(--violet)',
  'var(--hm-lavender)',
  'var(--hm-sage)',
  'var(--hm-sky)',
  'var(--hm-coral)',
  'var(--hm-peach)',
  'var(--hm-rose)',
  'var(--hm-sun)',
];

/**
 * 根據 block index 取得色條顏色
 * @param {number} idx
 * @returns {string}
 */
function getBlockColor(idx) {
  return BLOCK_COLORS[idx % BLOCK_COLORS.length];
}

// ===== 渲染 =====

/**
 * 渲染 Block 列表頁到容器
 * @param {HTMLElement} root
 * @returns {function} cleanup
 */
export function renderBlockList(root) {
  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: 'Routine 選擇',
    showBack: true,
    onBack: () => navigate('#/routine'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-block-list';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '160px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 列表容器
  const listContainer = document.createElement('div');
  listContainer.className = 'lori-block-list__cards';
  body.appendChild(listContainer);

  // AddBar 浮動按鈕
  const addBar = createAddBar({
    label: '新增 Block',
    onClick: () => _handleAddBlock(listContainer),
  });
  root.appendChild(addBar);

  // TabBar
  const tabBar = createTabBar('rt');
  root.appendChild(tabBar);

  // 載入資料
  _loadBlockData(listContainer);

  // cleanup
  return () => {
    const cards = root.querySelectorAll('.lori-block-card-wrap');
    cards.forEach(card => { if (card._swipeCtrl) card._swipeCtrl.destroy(); });
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 載入所有 Block 資料並渲染列表
 */
async function _loadBlockData(listContainer) {
  try {
    const blocks = await dbGetAll('blocks');
    const allSteps = await dbGetAll('steps');

    // 清空列表
    while (listContainer.firstChild) listContainer.removeChild(listContainer.firstChild);

    if (blocks.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'lori-block-list__empty';
      emptyMsg.textContent = '還沒有任何 Routine Block';
      listContainer.appendChild(emptyMsg);
      return;
    }

    // 依 b_index 排序
    blocks.sort((a, b) => a.b_index - b.b_index);

    blocks.forEach((block, i) => {
      // 計算該 block 的 step 數
      const stepCount = allSteps.filter(s => s.b_index === block.b_index).length;

      const card = createBlockCard({
        block,
        stepCount,
        completionPercent: 0, // 從 records 算，暫時 0
        color: getBlockColor(i),
        active: false,
        onClick: (bIndex) => navigate(`#/routine/blocks/${bIndex}`),
        onDelete: async (bIndex) => {
          if (!confirm(`確定刪除「${block.b_name}」？`)) return;
          try {
            await dbDelete('blocks', bIndex);
            _loadBlockData(listContainer);
          } catch (err) {
            console.warn('Block 刪除失敗:', err);
          }
        },
      });
      listContainer.appendChild(card);
    });
  } catch (err) {
    console.warn('Block 列表載入失敗:', err);
    const errorMsg = document.createElement('div');
    errorMsg.className = 'lori-block-list__empty';
    errorMsg.textContent = '資料載入失敗';
    listContainer.appendChild(errorMsg);
  }
}

/**
 * 新增 Block：產生下一個 b_index，寫入 db，重新載入列表
 */
async function _handleAddBlock(listContainer) {
  try {
    const blocks = await dbGetAll('blocks');
    // 找最大 b_index + 1
    const maxIndex = blocks.reduce((max, b) => Math.max(max, b.b_index || 0), 0);
    const newBlock = {
      b_index: maxIndex + 1,
      b_name: '新 Block',
      b_rise: '',
      b_set: '',
    };
    await dbAdd('blocks', newBlock);

    // 直接進入編輯頁
    navigate(`#/routine/blocks/${newBlock.b_index}`);
  } catch (err) {
    console.warn('新增 Block 失敗:', err);
  }
}

// 匯出供測試
export { getBlockColor, BLOCK_COLORS };
