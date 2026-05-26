// 小蘿日誌 — 完成摘要頁（Screen 1302）
// 完成百分比 + step 統計 + 紅蘿蔔獎勵 + 跳過 step 列表 + 重做 + 鼓勵語

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { iconPlay } from '../components/icons.js';
import { navigate } from '../router.js';
import { addCarrots, dbPut, dbGet, saveDailyMood } from '../db.js';
import { formatTime, todayStr, getEncouragement, silentCatch } from '../utils/helpers.js';
import { calcRoutineCarrots } from './routine-timer.js';
import { scheduleNotification } from '../utils/notification.js';

// F4：防重複打卡（用 sessionStorage 標記，不用模組級 flag，避免 redo 回來重複觸發）

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
  confirmBtn.textContent = '好的 \u{1F955}';
  bottomArea.appendChild(confirmBtn);

  root.appendChild(bottomArea);

  // 載入結果資料
  _loadSummary(blockIndex, body, confirmBtn, root, statusBar);

  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
    // 離開 summary 頁時清除暫存（redo 時跳過，因為 redo 按鈕已寫入新資料）
    if (!sessionStorage.getItem('routine_redo_pending')) {
      sessionStorage.removeItem('routine_result');
      sessionStorage.removeItem('routine_redo');
    }
    sessionStorage.removeItem('routine_redo_pending');
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
  } catch(e) { silentCatch(e, 'routine result parse'); }

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

  const { blockName, results, steps, elapsedSeconds } = resultData;
  const totalCount = results.length;
  let completedCount = results.filter(r => r === 'completed').length;
  const skippedCount = results.filter(r => r === 'skipped').length;
  let completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  let carrots = calcRoutineCarrots(completedCount, totalCount);

  // F5：變動獎勵 — 30% 機率觸發 bonus 1-3 根
  // 如果已打卡（_settled），用存下來的 bonus，不重新擲骰
  let bonusCarrots = 0;
  if (resultData._settled && resultData._bonusCarrots !== undefined) {
    bonusCarrots = resultData._bonusCarrots;
  } else if (Math.random() < 0.3) {
    bonusCarrots = Math.floor(Math.random() * 3) + 1;
  }
  const totalCarrots = carrots + bonusCarrots;

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

  // 用時顯示
  if (elapsedSeconds && elapsedSeconds > 0) {
    const elapsed = Math.round(elapsedSeconds);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeLine = document.createElement('div');
    timeLine.className = 'lori-routine-summary__stat-line';
    timeLine.style.marginTop = '4px';
    timeLine.textContent = `用時 ${mins} 分 ${secs} 秒`;
    body.appendChild(timeLine);
  }

  // 紅蘿蔔獎勵膠囊
  const carrotPill = document.createElement('div');
  carrotPill.className = 'lori-routine-summary__carrot-pill';
  carrotPill.textContent = `\u{1F955} +${carrots}`;
  body.appendChild(carrotPill);

  // F5：bonus 額外顯示
  if (bonusCarrots > 0) {
    const bonusLine = document.createElement('div');
    bonusLine.className = 'lori-routine-summary__bonus-line';
    bonusLine.textContent = `BONUS +${bonusCarrots} \u{1F955}`;
    bonusLine.style.cssText = `
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      color: var(--carrot, #ff6b35);
      margin-top: 8px;
      animation: lori-bonus-pop 0.5s ease-out;
    `;
    // 注入 keyframes（只注入一次）
    if (!document.getElementById('lori-bonus-anim')) {
      const style = document.createElement('style');
      style.id = 'lori-bonus-anim';
      style.textContent = `
        @keyframes lori-bonus-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    body.appendChild(bonusLine);
  }

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
          elapsedSeconds: elapsedSeconds || 0,
          _settled: resultData._settled || false,
          _bonusCarrots: bonusCarrots,
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
        sessionStorage.setItem('routine_redo_pending', '1');
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
  } catch(e) {
    silentCatch(e, 'routine summary encouragement');
    encourageDiv.textContent = '「做到了。不是因為容易才做的。」';
  }
  body.appendChild(encourageDiv);

  // ===== F15：晚間預熱——「明天早上見」=====
  {
    const hour = new Date().getHours();
    const nameLower = (blockName || '').toLowerCase();
    const isEvening = hour >= 18
      || nameLower.includes('晚') || nameLower.includes('夜')
      || nameLower.includes('evening');

    if (isEvening) {
      const preheatDiv = document.createElement('div');
      preheatDiv.className = 'lori-routine-summary__encourage';
      preheatDiv.style.marginTop = '8px';
      preheatDiv.textContent = '明天早上見，我會叫你 🐰';
      body.appendChild(preheatDiv);

      // 排程隔天早上 6:00 推播
      const tomorrow6 = new Date();
      tomorrow6.setDate(tomorrow6.getDate() + 1);
      tomorrow6.setHours(6, 0, 0, 0);
      const delayMs = tomorrow6.getTime() - Date.now();
      if (delayMs > 0) {
        scheduleNotification(
          '早安 🐰',
          '早，起來了嗎？昨晚的 routine 做得好 🥕',
          delayMs,
          'routine-preheat'
        );
      }
    }
  }

  // ===== F9/F13/F14：心情記錄區 =====
  const moodSection = document.createElement('div');
  moodSection.className = 'lori-routine-summary__mood-section';

  // 標題
  const moodTitle = document.createElement('div');
  moodTitle.className = 'lori-routine-summary__mood-title';
  moodTitle.textContent = '今天感覺怎麼樣？';
  moodSection.appendChild(moodTitle);

  // F9：五個 emoji 按鈕
  const MOODS = ['😢', '😐', '😊', '😍', '🤩'];
  const moodRow = document.createElement('div');
  moodRow.className = 'lori-routine-summary__mood-row';
  let selectedMood = '';

  MOODS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'lori-routine-summary__mood-btn';
    btn.textContent = emoji;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      if (selectedMood === emoji) {
        selectedMood = '';
        btn.classList.remove('is-selected');
      } else {
        selectedMood = emoji;
        moodRow.querySelectorAll('.lori-routine-summary__mood-btn').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
      }
    });
    moodRow.appendChild(btn);
  });
  moodSection.appendChild(moodRow);

  // F14：快速標籤
  const TAGS = ['累了', '還行', '超棒', '趕時間', '放鬆'];
  const tagRow = document.createElement('div');
  tagRow.className = 'lori-routine-summary__tag-row';
  const selectedTags = new Set();

  TAGS.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'lori-routine-summary__tag-btn';
    btn.textContent = tag;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        btn.classList.remove('is-selected');
        // 如果 note 欄位內容等於該 tag，清空
        if (noteInput.value === tag) noteInput.value = '';
      } else {
        selectedTags.add(tag);
        btn.classList.add('is-selected');
        // 如果 note 還是空的，自動填入最後點的 tag
        if (!noteInput.value.trim()) noteInput.value = tag;
      }
    });
    tagRow.appendChild(btn);
  });
  moodSection.appendChild(tagRow);

  // F13：一句話文字輸入
  const noteInput = document.createElement('input');
  noteInput.type = 'text';
  noteInput.className = 'lori-routine-summary__mood-input';
  noteInput.placeholder = '一句話就好（或留空）';
  moodSection.appendChild(noteInput);

  body.appendChild(moodSection);

  // F4：「好的」按鈕——導航 + 儲存心情（打卡已自動完成）
  confirmBtn.addEventListener('click', async () => {
    // 有填任何心情資料就存
    const note = noteInput.value.trim();
    const tags = [...selectedTags];
    if (selectedMood || note || tags.length > 0) {
      try {
        await saveDailyMood(todayStr(), selectedMood, note, tags);
      } catch (e) { silentCatch(e, 'save daily mood'); }
    }
    navigate('#/routine');
  });

  // F4：自動打卡（頁面載入即執行，用 _settled 標記防重複）
  if (!resultData._settled) {
    _autoComplete(totalCarrots, carrots, bonusCarrots, blockIndex, blockName, completedCount, totalCount, results, elapsedSeconds, resultData.simplified || false).catch(err => {
      console.error('自動打卡失敗:', err);
    });
  }
}

/**
 * 自動打卡：加積分 + 寫紀錄 + 清 sessionStorage
 */
async function _autoComplete(totalCarrots, baseCarrots, bonusCarrots, blockIndex, blockName, completedCount, totalCount, results, elapsedSeconds, simplified) {
  try {
    // 加積分（含 bonus）
    await addCarrots(totalCarrots);

    // 存紀錄到 records
    const today = todayStr();
    const pct = totalCount > 0 ? completedCount / totalCount : 0;

    // C2 修正：用 dbGet 直接查，不全表掃描
    let dayRecord = null;
    try {
      dayRecord = await dbGet('records', today);
    } catch(e) { silentCatch(e, 'routine summary day record'); }

    const blockRecord = {
      blockIndex,
      blockName,
      completionPct: pct,
      completedCount,
      totalCount,
      carrots: baseCarrots,
      bonusCarrots,
      totalCarrots,
      elapsedSeconds: elapsedSeconds || 0,
      simplified: simplified || false,
      results: [...results],
    };

    if (dayRecord) {
      dayRecord.routine_pct = pct;
      if (!dayRecord.completedBlocks) dayRecord.completedBlocks = [];
      dayRecord.completedBlocks.push(blockRecord);
      await dbPut('records', dayRecord);
    } else {
      await dbPut('records', {
        date: today,
        type: 'routine',
        blockIndex,
        routine_pct: pct,
        completedBlocks: [blockRecord],
      });
    }

    // 標記已打卡（不清除 sessionStorage，讓 cleanup 負責）
    try {
      const raw = sessionStorage.getItem('routine_result');
      if (raw) {
        const data = JSON.parse(raw);
        data._settled = true;
        data._bonusCarrots = bonusCarrots;
        sessionStorage.setItem('routine_result', JSON.stringify(data));
      }
    } catch(e) { silentCatch(e, 'routine result settle'); }
  } catch (err) {
    console.error('儲存 Routine 紀錄失敗:', err);
  }
}
