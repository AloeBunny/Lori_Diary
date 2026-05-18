// 小蘿日誌 — 計時進行頁（Screen 1301）
// 全螢幕倒數 + step 進度條 + pre-buffer + 最後 5 秒視覺提示 + 提示音 + 完成/跳過

import { createStatusBar } from '../components/status-bar.js';
import { iconCheck, iconSkip } from '../components/icons.js';
import { navigate } from '../router.js';
import { dbGetAll, dbGet } from '../db.js';
import { formatTime } from '../utils/helpers.js';
import { playBeep } from '../utils/audio.js';

// ===== 計時核心狀態 =====

/**
 * 建立計時器狀態物件
 * @param {Array} steps - step 陣列
 * @returns {object} state
 */
function createTimerState(steps) {
  return {
    steps: steps,
    currentStepIdx: 0,
    // 每個 step 的結果：'pending' | 'completed' | 'skipped'
    results: steps.map(() => 'pending'),
    // 計時狀態
    phase: 'prebuffer', // 'prebuffer' | 'countdown' | 'waiting' | 'done'
    remainingSeconds: 0,
    intervalId: null,
    autoCompleteTimeoutId: null,
    // 是否為重做模式（單一 step）
    redoMode: false,
    redoStepIdx: -1,
    // 計時追蹤：記錄實際開始時間，完成後算出總耗時
    startedAt: null,
    elapsedSeconds: 0,
  };
}

// ===== 積分計算 =====

/**
 * 計算 Routine 積分
 * @param {number} completedCount
 * @param {number} totalCount
 * @returns {number} 紅蘿蔔數
 */
export function calcRoutineCarrots(completedCount, totalCount) {
  if (totalCount === 0) return 0;
  const pct = (completedCount / totalCount) * 100;
  if (pct <= 0) return 0;
  if (pct <= 20) return 1;
  if (pct <= 40) return 2;
  if (pct <= 60) return 3;
  if (pct <= 80) return 4;
  return 5; // 81-100%
}

// ===== 渲染 =====

/**
 * 渲染計時進行頁
 * @param {HTMLElement} root
 * @param {object} params - { blockIndex }
 * @param {object} opts - { redoStep, redoResults, onRedoComplete }
 * @returns {function} cleanup
 */
export function renderRoutineTimer(root, params = {}, opts = {}) {
  root.className = 'lori';

  const blockIndex = parseInt(params.blockIndex, 10);
  const isRedo = opts.redoStep !== undefined;

  // 最外層容器
  const container = document.createElement('div');
  container.className = 'lori-routine-timer';
  container.style.position = 'absolute';
  container.style.inset = '0';

  // 背景漸層（最後 5 秒用）
  const bgOverlay = document.createElement('div');
  bgOverlay.className = 'lori-routine-timer__bg';
  container.appendChild(bgOverlay);

  // 狀態列
  const statusBar = createStatusBar();
  container.appendChild(statusBar);

  // 頂部 Step 進度
  const topBar = document.createElement('div');
  topBar.className = 'lori-routine-timer__top';

  const topInfo = document.createElement('div');
  topInfo.className = 'lori-routine-timer__top-info';
  const stepCounter = document.createElement('span');
  stepCounter.textContent = '載入中...';
  topInfo.appendChild(stepCounter);
  const blockNameTop = document.createElement('span');
  blockNameTop.textContent = '';
  topInfo.appendChild(blockNameTop);
  topBar.appendChild(topInfo);

  const progressBar = document.createElement('div');
  progressBar.className = 'lori-routine-timer__progress';
  topBar.appendChild(progressBar);

  container.appendChild(topBar);

  // 主內容區
  const main = document.createElement('div');
  main.className = 'lori-routine-timer__main';

  const phaseLabel = document.createElement('div');
  phaseLabel.className = 'lori-routine-timer__phase-label';
  phaseLabel.textContent = '';
  main.appendChild(phaseLabel);

  const stepName = document.createElement('div');
  stepName.className = 'lori-routine-timer__step-name';
  stepName.textContent = '載入中...';
  main.appendChild(stepName);

  const countdown = document.createElement('div');
  countdown.className = 'tabnum lori-routine-timer__countdown';
  countdown.textContent = '--:--';
  main.appendChild(countdown);

  const lastFiveHint = document.createElement('div');
  lastFiveHint.className = 'lori-routine-timer__last-five';
  lastFiveHint.textContent = '';
  lastFiveHint.style.visibility = 'hidden';
  main.appendChild(lastFiveHint);

  const nextHint = document.createElement('div');
  nextHint.className = 'lori-routine-timer__next-hint';
  nextHint.textContent = '';
  main.appendChild(nextHint);

  container.appendChild(main);

  // 底部按鈕
  const controls = document.createElement('div');
  controls.className = 'lori-routine-timer__controls';

  const skipBtn = document.createElement('button');
  skipBtn.className = 'lori-btn lori-routine-timer__skip-btn';
  const skipIcon = iconSkip(20);
  skipBtn.appendChild(skipIcon);
  skipBtn.appendChild(document.createTextNode(' 跳過'));
  controls.appendChild(skipBtn);

  const completeBtn = document.createElement('button');
  completeBtn.className = 'lori-btn lori-btn-primary lori-routine-timer__complete-btn';
  const checkIcon = iconCheck(22);
  checkIcon.style.stroke = '#2a4a3a';
  checkIcon.style.strokeWidth = '2.4';
  completeBtn.appendChild(checkIcon);
  completeBtn.appendChild(document.createTextNode(' 完成'));
  controls.appendChild(completeBtn);

  container.appendChild(controls);

  root.appendChild(container);

  // ===== 計時器邏輯 =====
  let state = null;

  // 載入資料並啟動計時
  _loadAndStart(blockIndex, isRedo, opts).then(s => {
    if (!s) return;
    state = s;

    // 繪製初始進度條
    _renderProgressSegments(progressBar, state);

    // 更新 block 名稱
    blockNameTop.textContent = state.blockName || '';

    // 綁定按鈕事件
    skipBtn.addEventListener('click', () => _onSkip(state, updateUI));
    completeBtn.addEventListener('click', () => _onComplete(state, updateUI));

    // 啟動第一個 step
    _startStep(state, updateUI);
  });

  // UI 更新函式
  function updateUI() {
    if (!state) return;
    const idx = state.currentStepIdx;
    const steps = state.steps;
    const totalSteps = steps.length;

    // 更新 step counter
    stepCounter.textContent = `Step ${idx + 1} / ${totalSteps}`;

    // 更新進度條
    _updateProgressSegments(progressBar, state);

    // 當前 step 名稱
    if (idx < totalSteps) {
      stepName.textContent = steps[idx].s_name;
    }

    // phase + 倒數
    if (state.phase === 'prebuffer') {
      phaseLabel.textContent = '準備中...';
      phaseLabel.style.color = 'var(--violet)';
      countdown.textContent = formatTime(state.remainingSeconds);
      countdown.style.color = 'var(--violet)';
      bgOverlay.style.background = '';
      lastFiveHint.style.visibility = 'hidden';
      // 清除前一 step 可能殘留的閃爍
      countdown.classList.remove('lori-routine-timer__countdown--blink-slow', 'lori-routine-timer__countdown--blink-fast');
      bgOverlay.classList.remove('lori-routine-timer__bg--pulse-slow', 'lori-routine-timer__bg--pulse-fast');
    } else if (state.phase === 'countdown') {
      phaseLabel.textContent = '當前 step';
      phaseLabel.style.color = 'var(--gray)';
      countdown.textContent = formatTime(state.remainingSeconds);
      countdown.style.color = 'var(--navy)';

      // 最後 5 秒視覺提示 + 閃爍動畫
      if (state.remainingSeconds <= 5 && state.remainingSeconds > 0) {
        lastFiveHint.textContent = `● 最後 ${state.remainingSeconds} 秒`;
        lastFiveHint.style.visibility = 'visible';
        bgOverlay.style.background = `radial-gradient(circle at 50% 38%, rgba(244,132,95,${0.05 + (5 - state.remainingSeconds) * 0.03}), rgba(250,248,243,0) 70%)`;
        countdown.style.color = 'var(--carrot)';

        // 閃爍頻率：5→3 秒慢閃，2→1 秒快閃
        countdown.classList.remove('lori-routine-timer__countdown--blink-slow', 'lori-routine-timer__countdown--blink-fast');
        bgOverlay.classList.remove('lori-routine-timer__bg--pulse-slow', 'lori-routine-timer__bg--pulse-fast');
        if (state.remainingSeconds <= 2) {
          countdown.classList.add('lori-routine-timer__countdown--blink-fast');
          bgOverlay.classList.add('lori-routine-timer__bg--pulse-fast');
        } else {
          countdown.classList.add('lori-routine-timer__countdown--blink-slow');
          bgOverlay.classList.add('lori-routine-timer__bg--pulse-slow');
        }
      } else {
        lastFiveHint.style.visibility = 'hidden';
        bgOverlay.style.background = '';
        countdown.classList.remove('lori-routine-timer__countdown--blink-slow', 'lori-routine-timer__countdown--blink-fast');
        bgOverlay.classList.remove('lori-routine-timer__bg--pulse-slow', 'lori-routine-timer__bg--pulse-fast');
      }
    } else if (state.phase === 'waiting') {
      phaseLabel.textContent = '時間到！';
      phaseLabel.style.color = 'var(--carrot)';
      countdown.textContent = '00:00';
      countdown.style.color = 'var(--carrot)';
      bgOverlay.style.background = 'radial-gradient(circle at 50% 38%, rgba(244,132,95,0.12), rgba(250,248,243,0) 70%)';
      lastFiveHint.style.visibility = 'hidden';
      // 清除閃爍
      countdown.classList.remove('lori-routine-timer__countdown--blink-slow', 'lori-routine-timer__countdown--blink-fast');
      bgOverlay.classList.remove('lori-routine-timer__bg--pulse-slow', 'lori-routine-timer__bg--pulse-fast');
    } else if (state.phase === 'done') {
      // 導航到摘要頁
      _cleanup();
      if (state.redoMode && opts.onRedoComplete) {
        opts.onRedoComplete(state.results[0]);
      } else {
        // 將結果暫存到 sessionStorage 供摘要頁讀取
        const resultData = {
          blockIndex: blockIndex,
          blockName: state.blockName,
          results: state.results,
          steps: state.steps.map(s => ({ s_name: s.s_name, s_time: s.s_time, s_index: s.s_index })),
          elapsedSeconds: state.elapsedSeconds || 0,
        };
        sessionStorage.setItem('routine_result', JSON.stringify(resultData));
        navigate(`#/routine/summary/${blockIndex}`);
      }
      return;
    }

    // 下一 step 預告
    if (state.phase !== 'done' && idx + 1 < totalSteps) {
      const nextStep = steps[idx + 1];
      nextHint.textContent = `下一 step：${nextStep.s_name}（${formatTime(nextStep.s_time)}）`;
    } else {
      nextHint.textContent = '';
    }
  }

  // cleanup 函式
  function _cleanup() {
    if (state && state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
    if (state && state.autoCompleteTimeoutId) {
      clearTimeout(state.autoCompleteTimeoutId);
      state.autoCompleteTimeoutId = null;
    }
    if (statusBar._cleanup) statusBar._cleanup();
  }

  return () => {
    _cleanup();
    root.className = '';
  };
}

// ===== 資料載入 =====

async function _loadAndStart(blockIndex, isRedo, opts) {
  try {
    if (isRedo) {
      // 重做模式：只跑一個 step
      const step = opts.redoStep;
      const state = createTimerState([step]);
      state.redoMode = true;
      state.redoStepIdx = 0;
      state.blockName = opts.blockName || '';
      return state;
    }

    const block = await dbGet('blocks', blockIndex);
    if (!block) {
      console.error('Block 不存在:', blockIndex);
      return null;
    }

    const allSteps = await dbGetAll('steps', 'b_index', blockIndex);
    const steps = allSteps.sort((a, b) => a.s_index - b.s_index);

    if (steps.length === 0) {
      console.error('Block 無 step:', blockIndex);
      return null;
    }

    const state = createTimerState(steps);
    state.blockName = block.b_name;
    return state;
  } catch (err) {
    console.error('計時器資料載入失敗:', err);
    return null;
  }
}

// ===== 進度條 =====

function _renderProgressSegments(container, state) {
  while (container.firstChild) container.removeChild(container.firstChild);
  const totalSteps = state.steps.length;
  for (let i = 0; i < totalSteps; i++) {
    const seg = document.createElement('div');
    seg.className = 'lori-routine-timer__progress-seg';
    seg.dataset.idx = String(i);
    container.appendChild(seg);
  }
}

function _updateProgressSegments(container, state) {
  const segs = container.querySelectorAll('.lori-routine-timer__progress-seg');
  segs.forEach((seg, i) => {
    const result = state.results[i];
    if (result === 'completed') {
      seg.style.background = 'var(--mint)';
    } else if (result === 'skipped') {
      seg.style.background = 'var(--gray)';
    } else if (i === state.currentStepIdx) {
      seg.style.background = 'var(--violet)';
    } else {
      seg.style.background = 'var(--hairline)';
    }
  });
}

// ===== 計時邏輯 =====

function _startStep(state, updateUI) {
  const idx = state.currentStepIdx;
  if (idx >= state.steps.length) {
    // 計算總耗時
    if (state.startedAt) {
      state.elapsedSeconds = Math.round((Date.now() - state.startedAt) / 1000);
    }
    state.phase = 'done';
    updateUI();
    return;
  }

  // 第一個 step 開始時記錄起始時間
  if (idx === 0 && !state.startedAt) {
    state.startedAt = Date.now();
  }

  const step = state.steps[idx];
  const prebuffer = Math.max(step.s_prebuffer || 10, 10);

  // 進入 prebuffer 階段
  state.phase = 'prebuffer';
  state.remainingSeconds = prebuffer;
  updateUI();

  // 清除之前的 interval
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }

  state.intervalId = setInterval(() => {
    if (state.phase === 'prebuffer') {
      state.remainingSeconds--;
      if (state.remainingSeconds <= 0) {
        // 進入正式倒數
        state.phase = 'countdown';
        state.remainingSeconds = step.s_time || 0;
        if (state.remainingSeconds <= 0) {
          // step 時間為 0，直接等待
          state.phase = 'waiting';
          playBeep();
          _startAutoComplete(state, updateUI);
        }
      }
      updateUI();
    } else if (state.phase === 'countdown') {
      state.remainingSeconds--;
      if (state.remainingSeconds <= 0) {
        state.remainingSeconds = 0;
        state.phase = 'waiting';
        playBeep();
        _startAutoComplete(state, updateUI);
      }
      updateUI();
    }
    // 'waiting' 和 'done' 不需要 interval 更新
  }, 1000);
}

/**
 * 倒數歸零後 5 秒自動完成
 */
function _startAutoComplete(state, updateUI) {
  if (state.autoCompleteTimeoutId) {
    clearTimeout(state.autoCompleteTimeoutId);
  }
  state.autoCompleteTimeoutId = setTimeout(() => {
    if (state.phase === 'waiting') {
      // 自動算完成
      _doComplete(state, updateUI);
    }
  }, 5000);
}

/**
 * 使用者點完成
 */
function _onComplete(state, updateUI) {
  if (!state) return;
  if (state.phase === 'done') return;
  // 不論什麼階段都可以按完成
  _doComplete(state, updateUI);
}

function _doComplete(state, updateUI) {
  const idx = state.currentStepIdx;
  state.results[idx] = 'completed';

  // 清除自動完成
  if (state.autoCompleteTimeoutId) {
    clearTimeout(state.autoCompleteTimeoutId);
    state.autoCompleteTimeoutId = null;
  }

  // 停止當前 interval
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }

  // 進入下一步
  state.currentStepIdx++;
  _startStep(state, updateUI);
}

/**
 * 使用者點跳過
 */
function _onSkip(state, updateUI) {
  if (!state) return;
  if (state.phase === 'done') return;

  const idx = state.currentStepIdx;
  state.results[idx] = 'skipped';

  // 清除自動完成
  if (state.autoCompleteTimeoutId) {
    clearTimeout(state.autoCompleteTimeoutId);
    state.autoCompleteTimeoutId = null;
  }

  // 停止當前 interval
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }

  // 進入下一步
  state.currentStepIdx++;
  _startStep(state, updateUI);
}

// 匯出純函式供測試使用
export { createTimerState, playBeep };
