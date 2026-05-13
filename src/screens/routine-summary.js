// 小蘿日誌 — 完成摘要頁（Screen 1302）
// 完成百分比 + step 統計 + 紅蘿蔔獎勵 + 跳過 step 列表 + 重做 + 鼓勵語

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { iconPlay } from '../components/icons.js';
import { navigate } from '../router.js';
import { addCarrots, dbPut, dbGet, dbGetAll } from '../db.js';
import { formatTime, todayStr, getEncouragement } from '../utils/helpers.js';
import { calcRoutineCarrots } from './routine-timer.js';

// ===== 渲染 =====

/**
 * 渲染完成摘要頁
 * @param {HTMLElement} root
 * @param {object} params - { blockIndex }
 * @returns {function} cleanup
 */
export function renderRoutineSummary(root, params = {}) {
  root.className = 'lori';

  const blockIndex = parseInt(params.blockIndex, 10);

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: '完成摘要',
    showBack: true,
    onBack: () => navigate('#/routine'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '120px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 底部確認按鈕
  const bottomArea = document.createElement('div');
  bottomArea.className = 'lori-routine-summary__bottom';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'lori-btn lori-btn-primary';
  confirmBtn.style.width = '100%';
  confirmBtn.style.height = '52px';
  confirmBtn.style.fontSize = '15px';
  confirmBtn.style.fontWeight = '700';
  confirmBtn.textContent = '確認 · 收下 \u{1F955}';
  bottomArea.appendChild(confirmBtn);

  root.appendChild(bottomArea);

  // 載入結果資料
  _loadSummary(blockIndex, body, confirmBtn, root, statusBar);

  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 載入摘要資料並渲染
 */
async function _loadSummary(blockIndex, body, confirmBtn, root, statusBar) {
  // 從 sessionStorage 讀取計時結果
  let resultData = null;
  try {
    const raw = sessionStorage.getItem('routine_result');
    if (raw) resultData = JSON.parse(raw);
  } catch { /* 解析失敗 */ }

  if (!resultData || resultData.blockIndex !== blockIndex) {
    // 無資料，顯示錯誤
    const errMsg = document.createElement('div');
    errMsg.style.padding = '40px 16px';
    errMsg.style.textAlign = 'center';
    errMsg.style.color = 'var(--gray)';
    errMsg.style.fontSize = '15px';
    errMsg.textContent = '查無計時紀錄';
    body.appendChild(errMsg);
    confirmBtn.addEventListener('click', () => navigate('#/routine'));
    return;
  }

  const { blockName, results, steps } = resultData;
  const totalCount = results.length;
  let completedCount = results.filter(r => r === 'completed').length;
  const skippedCount = results.filter(r => r === 'skipped').length;
  let completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  let carrots = calcRoutineCarrots(completedCount, totalCount);

  // 跳過的 step 列表
  let skippedSteps = [];
  results.forEach((r, i) => {
    if (r === 'skipped') {
      skippedSteps.push({ ...steps[i], idx: i });
    }
  });

  // ===== 渲染畫面 =====

  // Block 名稱
  const blockLabel = document.createElement('div');
  blockLabel.className = 'lori-routine-summary__block-label';
  blockLabel.textContent = `${blockName} · 完成`;
  body.appendChild(blockLabel);

  // 完成百分比大字
  const pctWrap = document.createElement('div');
  pctWrap.className = 'lori-routine-summary__pct-wrap';
  const pctNum = document.createElement('span');
  pctNum.className = 'tabnum lori-routine-summary__pct-num';
  pctNum.textContent = String(completionPct);
  pctWrap.appendChild(pctNum);
  const pctUnit = document.createElement('span');
  pctUnit.className = 'lori-routine-summary__pct-unit';
  pctUnit.textContent = '%';
  pctWrap.appendChild(pctUnit);
  body.appendChild(pctWrap);

  // step 統計
  const statLine = document.createElement('div');
  statLine.className = 'lori-routine-summary__stat-line';
  statLine.textContent = `${completedCount} / ${totalCount} step`;
  body.appendChild(statLine);

  // 紅蘿蔔獎勵膠囊
  const carrotPill = document.createElement('div');
  carrotPill.className = 'lori-routine-summary__carrot-pill';
  carrotPill.textContent = `\u{1F955} +${carrots}`;
  body.appendChild(carrotPill);

  // 跳過的 step 列表
  if (skippedSteps.length > 0) {
    const skipSection = document.createElement('div');
    skipSection.className = 'lori-routine-summary__skip-section';

    const skipTitle = document.createElement('div');
    skipTitle.className = 'lori-routine-summary__skip-title';
    skipTitle.textContent = `跳過的 step (${skippedSteps.length})`;
    skipSection.appendChild(skipTitle);

    const skipList = document.createElement('div');
    skipList.className = 'lori-routine-summary__skip-list';

    skippedSteps.forEach(step => {
      const card = document.createElement('div');
      card.className = 'lori-card lori-routine-summary__skip-card';

      const info = document.createElement('div');
      info.style.flex = '1';
      const nameEl = document.createElement('div');
      nameEl.style.fontSize = '14px';
      nameEl.style.fontWeight = '500';
      nameEl.textContent = step.s_name;
      info.appendChild(nameEl);
      const timeEl = document.createElement('div');
      timeEl.style.fontSize = '12px';
      timeEl.style.color = 'var(--gray)';
      timeEl.style.marginTop = '2px';
      timeEl.textContent = formatTime(step.s_time || 0);
      info.appendChild(timeEl);
      card.appendChild(info);

      // 重做按鈕
      const redoBtn = document.createElement('button');
      redoBtn.className = 'lori-routine-summary__redo-btn';
      redoBtn.appendChild(iconPlay(16));
      redoBtn.addEventListener('click', () => {
        // 進入重做模式：單跑該 step
        // 暫存目前結果到 sessionStorage
        const currentData = {
          blockIndex,
          blockName,
          results: [...results],
          steps,
        };
        sessionStorage.setItem('routine_result', JSON.stringify(currentData));

        // 用匿名函式處理重做結果
        // 因為重做完要回到摘要頁，用一個特殊 hash
        const redoData = {
          step: { s_name: step.s_name, s_time: step.s_time, s_prebuffer: step.s_prebuffer || 10, s_index: step.s_index },
          blockName,
          originalIdx: step.idx,
        };
        sessionStorage.setItem('routine_redo', JSON.stringify(redoData));
        navigate(`#/routine/redo/${blockIndex}`);
      });
      card.appendChild(redoBtn);

      skipList.appendChild(card);
    });

    skipSection.appendChild(skipList);
    body.appendChild(skipSection);
  }

  // 鼓勵語
  const encourageDiv = document.createElement('div');
  encourageDiv.className = 'lori-routine-summary__encourage';
  try {
    const msg = await getEncouragement('routine');
    encourageDiv.textContent = `「${msg}」`;
  } catch {
    encourageDiv.textContent = '「做到了。不是因為容易才做的。」';
  }
  body.appendChild(encourageDiv);

  // 確認按鈕事件
  confirmBtn.addEventListener('click', async () => {
    try {
      // 加積分
      await addCarrots(carrots);

      // 存紀錄到 records
      const today = todayStr();
      const pct = totalCount > 0 ? completedCount / totalCount : 0;

      // 讀取當日 record
      let dayRecord = null;
      try {
        const records = await dbGetAll('records');
        dayRecord = records.find(r => r.date === today);
      } catch { /* 無紀錄 */ }

      if (dayRecord) {
        dayRecord.routine_pct = pct;
        // 更新已完成 block 列表
        if (!dayRecord.completedBlocks) dayRecord.completedBlocks = [];
        dayRecord.completedBlocks.push({
          blockIndex,
          blockName,
          completionPct: pct,
          completedCount,
          totalCount,
          carrots,
          results: [...results],
        });
        await dbPut('records', dayRecord);
      } else {
        await dbPut('records', {
          date: today,
          type: 'routine',
          blockIndex,
          routine_pct: pct,
          completedBlocks: [{
            blockIndex,
            blockName,
            completionPct: pct,
            completedCount,
            totalCount,
            carrots,
            results: [...results],
          }],
        });
      }

      // 清除暫存
      sessionStorage.removeItem('routine_result');
      sessionStorage.removeItem('routine_redo');

      // 回到 Routine 主頁
      navigate('#/routine');
    } catch (err) {
      console.error('儲存 Routine 紀錄失敗:', err);
      navigate('#/routine');
    }
  });
}
