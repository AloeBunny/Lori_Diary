// 小蘿日誌 — Routine 主頁（Screen 1300）
// StatusBar → DateBar → AM/PM 提示 → 中央大圓 → 回顧/選擇按鈕 → 今日已完成卡片

import { createStatusBar } from '../components/status-bar.js';
import { createTabBar } from '../components/tab-bar.js';
import { createDateBar } from '../components/date-bar.js';
import { createBlockCard } from '../components/block-card.js';
import { iconPlay } from '../components/icons.js';
import { navigate } from '../router.js';
import { dbGetAll } from '../db.js';
import { formatTime, todayStr, silentCatch, toLocalDateStr, prevDateStr, nextDateStr, parseDate } from '../utils/helpers.js';

// ===== 輔助函式 =====

/**
 * 取得當前時段（HHMM 格式）
 * @returns {string} 如 '0830'
 */
function currentTimeHHMM() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return h + m;
}

/**
 * 取得 AM/PM 提示文字
 * @returns {string}
 */
function getTimePeriodHint() {
  const h = new Date().getHours();
  if (h < 6) return '凌晨時段';
  if (h < 12) return '上午時段';
  if (h < 14) return '中午時段';
  if (h < 18) return '下午時段';
  if (h < 22) return '晚間時段';
  return '深夜時段';
}

/**
 * 根據 block-rise 匹配當前時段的 Block
 * @param {Array} blocks
 * @returns {object|null} 匹配的 block，或 null
 */
function matchBlockByRise(blocks, nowHHMM) {
  // 找 rise <= 當前時間 且 set >= 當前時間 的 block
  // 如果有多個匹配，取 rise 最接近的
  let best = null;
  let bestRise = '';
  for (const b of blocks) {
    if (!b.b_rise || !b.b_set) continue; // 一次性 block 不自動匹配
    if (b.b_rise <= nowHHMM && b.b_set >= nowHHMM) {
      if (!best || b.b_rise > bestRise) {
        best = b;
        bestRise = b.b_rise;
      }
    }
  }
  return best;
}

/**
 * 計算 Block 總秒數
 */
function calcBlockTotalSeconds(steps) {
  return steps.reduce((sum, s) => sum + (s.s_time || 0), 0);
}

// ===== 渲染 =====

/**
 * 渲染 Routine 主頁
 * @param {HTMLElement} root
 * @param {object} params - 路由參數
 * @param {string} [params.date] - YYYY-MM-DD（未指定 = 今天）
 * @returns {function} cleanup
 */
export function renderRoutineHome(root, params = {}) {
  const dateStr = params.date || todayStr();
  const today = todayStr();
  const isToday = dateStr === today;
  const currentDate = parseDate(dateStr);

  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '54px';
  body.style.paddingBottom = '100px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 頁面標題
  const titleSection = document.createElement('div');
  titleSection.style.padding = '10px 16px 14px';
  const pageTitle = document.createElement('div');
  pageTitle.style.fontSize = '26px';
  pageTitle.style.fontWeight = '700';
  pageTitle.style.letterSpacing = '-0.4px';
  pageTitle.textContent = 'Routine';
  titleSection.appendChild(pageTitle);
  body.appendChild(titleSection);

  // DateBar
  const dateBar = createDateBar({
    date: currentDate,
    progress: 0,
    isToday,
    onPrev: () => navigate(`#/routine/day/${prevDateStr(dateStr)}`),
    onNext: () => navigate(`#/routine/day/${nextDateStr(dateStr)}`),
    onList: () => navigate('#/routine/history'),
  });
  body.appendChild(dateBar);

  // AM/PM 提示
  const hintDiv = document.createElement('div');
  hintDiv.className = 'lori-routine-home__hint';
  hintDiv.textContent = getTimePeriodHint();
  body.appendChild(hintDiv);

  // 中央大圓
  const circleWrap = document.createElement('div');
  circleWrap.className = 'lori-routine-home__circle-wrap';

  const circle = document.createElement('div');
  circle.className = 'lori-routine-home__circle';

  const blockLabel = document.createElement('div');
  blockLabel.className = 'lori-routine-home__block-label';
  blockLabel.textContent = '當前 Block';
  circle.appendChild(blockLabel);

  const blockName = document.createElement('div');
  blockName.className = 'lori-routine-home__block-name';
  blockName.textContent = '載入中...';
  circle.appendChild(blockName);

  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'tabnum lori-routine-home__time';
  timeDisplay.textContent = '--:--';
  circle.appendChild(timeDisplay);

  const stepCountLabel = document.createElement('div');
  stepCountLabel.className = 'lori-routine-home__step-count';
  stepCountLabel.textContent = '';
  circle.appendChild(stepCountLabel);

  const playBtn = document.createElement('button');
  playBtn.className = 'lori-routine-home__play-btn';
  playBtn.disabled = true;
  playBtn.appendChild(iconPlay(28));
  circle.appendChild(playBtn);

  circleWrap.appendChild(circle);
  body.appendChild(circleWrap);

  // 回顧 + Routine 選擇按鈕
  const btnRow = document.createElement('div');
  btnRow.className = 'lori-routine-home__btn-row';

  const historyBtn = document.createElement('button');
  historyBtn.className = 'lori-btn lori-btn-ghost';
  historyBtn.style.flex = '1';
  historyBtn.style.height = '52px';
  historyBtn.textContent = '回顧';
  historyBtn.addEventListener('click', () => navigate('#/routine/history'));
  btnRow.appendChild(historyBtn);

  const blocksBtn = document.createElement('button');
  blocksBtn.className = 'lori-btn';
  blocksBtn.style.flex = '1';
  blocksBtn.style.height = '52px';
  blocksBtn.style.background = 'var(--mint)';
  blocksBtn.style.borderColor = 'transparent';
  blocksBtn.style.color = '#2a4a3a';
  blocksBtn.style.fontWeight = '600';
  blocksBtn.textContent = 'Routine 選擇';
  blocksBtn.addEventListener('click', () => navigate('#/routine/blocks'));
  btnRow.appendChild(blocksBtn);

  body.appendChild(btnRow);

  // 今日已完成區域
  const completedSection = document.createElement('div');
  completedSection.className = 'lori-routine-home__completed';

  const completedTitle = document.createElement('div');
  completedTitle.className = 'lori-routine-home__completed-title';
  completedTitle.textContent = isToday ? '今日已完成' : '當日已完成';
  completedSection.appendChild(completedTitle);

  const completedList = document.createElement('div');
  completedList.className = 'lori-routine-home__completed-list';
  completedSection.appendChild(completedList);

  body.appendChild(completedSection);

  // TabBar
  const tabBar = createTabBar('rt');
  root.appendChild(tabBar);

  // 載入資料
  _loadRoutineData(blockName, timeDisplay, stepCountLabel, playBtn, hintDiv, completedList, dateBar, dateStr, isToday);

  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 非同步載入 Routine 資料
 */
async function _loadRoutineData(blockNameEl, timeDisplayEl, stepCountEl, playBtnEl, hintEl, completedListEl, dateBarEl, dateStr, isToday) {
  try {
    const blocks = await dbGetAll('blocks');
    const allSteps = await dbGetAll('steps');
    const nowHHMM = currentTimeHHMM();

    if (blocks.length === 0) {
      blockNameEl.textContent = '尚無 Block';
      timeDisplayEl.textContent = '--:--';
      stepCountEl.textContent = '';
      playBtnEl.disabled = true;
      playBtnEl.style.opacity = '0.4';
      return;
    }

    // 找匹配的 block
    const matched = matchBlockByRise(blocks, nowHHMM);
    const selectedBlock = matched || blocks[0];
    const blockSteps = allSteps
      .filter(s => s.b_index === selectedBlock.b_index)
      .sort((a, b) => a.s_index - b.s_index);

    // 更新畫面
    blockNameEl.textContent = selectedBlock.b_name;
    if (blockSteps.length > 0) {
      const firstStepTime = blockSteps[0].s_time || 0;
      timeDisplayEl.textContent = formatTime(firstStepTime);
      stepCountEl.textContent = `共 ${blockSteps.length} 個 step`;
      playBtnEl.disabled = false;
      playBtnEl.style.opacity = '1';
      playBtnEl.addEventListener('click', () => {
        navigate(`#/routine/timer/${selectedBlock.b_index}`);
      });
    } else {
      timeDisplayEl.textContent = '--:--';
      stepCountEl.textContent = '無 step';
      playBtnEl.disabled = true;
      playBtnEl.style.opacity = '0.4';
    }

    // 更新 AM/PM 提示
    if (!isToday) {
      hintEl.textContent = `${dateStr} 回顧`;
    } else if (matched) {
      hintEl.textContent = `${getTimePeriodHint()} · 自動載入「${matched.b_name}」`;
    } else {
      hintEl.textContent = `${getTimePeriodHint()} · 無匹配 Block`;
    }

    // 載入當日已完成的 Block 紀錄
    // 從 records store 查詢該日 routine 完成紀錄
    try {
      const records = await dbGetAll('records');
      const todayRecords = records.filter(r =>
        r.date === dateStr && r.type === 'routine' && r.blockIndex !== undefined
      );

      if (todayRecords.length > 0) {
        for (const rec of todayRecords) {
          const block = blocks.find(b => b.b_index === rec.blockIndex);
          if (!block) continue;
          const bSteps = allSteps.filter(s => s.b_index === rec.blockIndex);
          const card = createBlockCard({
            block,
            stepCount: bSteps.length,
            completionPercent: Math.round((rec.completionPct || 0) * 100),
            onClick: (bIndex) => navigate(`#/routine/blocks/${bIndex}`),
          });
          completedListEl.appendChild(card);
        }
      } else {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.color = 'var(--gray)';
        emptyMsg.style.fontSize = '13px';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '16px 0';
        emptyMsg.textContent = '今日尚未完成任何 Block';
        completedListEl.appendChild(emptyMsg);
      }
    } catch(e) {
      silentCatch(e, 'routine home completed blocks');
    }

    // 更新 DateBar 進度（當日 routine 完成度）
    try {
      const records2 = await dbGetAll('records');
      const todayRec = records2.find(r => r.date === dateStr);
      if (todayRec && todayRec.routine_pct !== undefined) {
        const fill = dateBarEl.querySelector('.date-bar__fill');
        if (fill) fill.style.width = `${Math.round(todayRec.routine_pct * 100)}%`;
        const pct = dateBarEl.querySelector('.date-bar__pct');
        if (pct) pct.textContent = `完成度 ${Math.round(todayRec.routine_pct * 100)}%`;
      }
    } catch(e) { silentCatch(e, 'routine home datebar progress'); }

  } catch (err) {
    console.warn('Routine 主頁資料載入失敗:', err);
    blockNameEl.textContent = '載入失敗';
    timeDisplayEl.textContent = '--:--';
  }
}

// 匯出純函式供測試使用
export { matchBlockByRise, calcBlockTotalSeconds, getTimePeriodHint, currentTimeHHMM };
