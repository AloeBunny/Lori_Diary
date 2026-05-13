// 小蘿日誌 — 小蘿自訂頁面 (Task 7-5)
// ASCII 表情池預覽、暱稱設定、鼓勵語頻率
// 路由：#/settings/lori

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { getSetting, setSetting } from '../db.js';
import { LORI_FACES } from '../utils/helpers.js';

// ===== 設定 key =====
const KEY_NICKNAME = 'lori_nickname';
const KEY_ENCOURAGE_FREQ = 'lori_encourage_freq';
const KEY_SELECTED_FACE = 'lori_selected_face';

// ===== 鼓勵語頻率選項 =====
const FREQ_OPTIONS = [
  { value: 'always', label: '每次' },
  { value: 'sometimes', label: '偶爾' },
  { value: 'off', label: '關閉' },
];

/**
 * 渲染小蘿自訂頁面
 * @param {HTMLElement} root
 * @returns {function} cleanup
 */
export function renderLoriCustomize(root) {
  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: '小蘿自訂',
    showBack: true,
    rightLabel: '儲存',
    onRight: handleSave,
  });
  root.appendChild(header);

  // 滾動區域
  const body = document.createElement('div');
  body.className = 'lori-scroll';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '40px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 狀態追蹤（待 loadSettings 載入後覆寫）
  let currentNickname = '小蘿';
  let currentFreq = 'always';
  let currentFaceIdx = -1; // -1 = 隨機

  // ===== 區塊 1：ASCII 表情池 =====
  const faceSection = document.createElement('div');
  faceSection.className = 'lori-customize__section';

  const faceLabel = document.createElement('div');
  faceLabel.className = 'lori-customize__label';
  faceLabel.textContent = '封面表情';
  faceSection.appendChild(faceLabel);

  const faceHint = document.createElement('div');
  faceHint.className = 'lori-customize__hint';
  faceHint.textContent = '選擇封面顯示的小蘿表情，「隨機」每次不同';
  faceSection.appendChild(faceHint);

  const faceGrid = document.createElement('div');
  faceGrid.className = 'lori-customize__face-grid';

  // 隨機選項
  const randomCard = createFaceCard('隨機', -1);
  faceGrid.appendChild(randomCard);

  // 逐一顯示所有表情
  LORI_FACES.forEach((face, idx) => {
    const card = createFaceCard(face, idx);
    faceGrid.appendChild(card);
  });

  faceSection.appendChild(faceGrid);
  body.appendChild(faceSection);

  // ===== 區塊 2：暱稱設定 =====
  const nickSection = document.createElement('div');
  nickSection.className = 'lori-customize__section';

  const nickLabel = document.createElement('div');
  nickLabel.className = 'lori-customize__label';
  nickLabel.textContent = '暱稱';
  nickSection.appendChild(nickLabel);

  const nickHint = document.createElement('div');
  nickHint.className = 'lori-customize__hint';
  nickHint.textContent = '自訂小蘿叫什麼名字';
  nickSection.appendChild(nickHint);

  const nickInput = document.createElement('input');
  nickInput.className = 'lori-input lori-customize__nick-input';
  nickInput.type = 'text';
  nickInput.placeholder = '小蘿';
  nickInput.maxLength = 20;
  nickInput.addEventListener('input', () => {
    currentNickname = nickInput.value.trim() || '小蘿';
  });
  nickSection.appendChild(nickInput);

  body.appendChild(nickSection);

  // ===== 區塊 3：鼓勵語頻率 =====
  const freqSection = document.createElement('div');
  freqSection.className = 'lori-customize__section';

  const freqLabel = document.createElement('div');
  freqLabel.className = 'lori-customize__label';
  freqLabel.textContent = '鼓勵語頻率';
  freqSection.appendChild(freqLabel);

  const freqHint = document.createElement('div');
  freqHint.className = 'lori-customize__hint';
  freqHint.textContent = '完成任務時小蘿說鼓勵語的頻率';
  freqSection.appendChild(freqHint);

  const freqGroup = document.createElement('div');
  freqGroup.className = 'lori-customize__freq-group';

  FREQ_OPTIONS.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'lori-btn lori-customize__freq-btn';
    btn.textContent = opt.label;
    btn.dataset.value = opt.value;
    btn.addEventListener('click', () => {
      currentFreq = opt.value;
      updateFreqUI();
    });
    freqGroup.appendChild(btn);
  });

  freqSection.appendChild(freqGroup);
  body.appendChild(freqSection);

  // ===== UI 更新函式 =====
  function updateFaceUI() {
    const cards = faceGrid.querySelectorAll('.lori-customize__face-card');
    cards.forEach(card => {
      const idx = parseInt(card.dataset.faceIdx, 10);
      if (idx === currentFaceIdx) {
        card.classList.add('lori-customize__face-card--selected');
      } else {
        card.classList.remove('lori-customize__face-card--selected');
      }
    });
  }

  function updateFreqUI() {
    const btns = freqGroup.querySelectorAll('.lori-customize__freq-btn');
    btns.forEach(btn => {
      if (btn.dataset.value === currentFreq) {
        btn.classList.add('lori-btn-violet');
        btn.classList.remove('lori-btn-ghost');
      } else {
        btn.classList.remove('lori-btn-violet');
        btn.classList.add('lori-btn-ghost');
      }
    });
  }

  function createFaceCard(face, idx) {
    const card = document.createElement('div');
    card.className = 'lori-customize__face-card lori-card';
    card.dataset.faceIdx = String(idx);

    if (idx === -1) {
      // 隨機
      const label = document.createElement('div');
      label.className = 'lori-customize__face-random';
      label.textContent = '🎲 隨機';
      card.appendChild(label);
    } else {
      const pre = document.createElement('pre');
      pre.className = 'ascii lori-customize__face-ascii';
      pre.textContent = face;
      card.appendChild(pre);
    }

    card.addEventListener('click', () => {
      currentFaceIdx = idx;
      updateFaceUI();
    });

    return card;
  }

  // ===== 儲存 =====
  async function handleSave() {
    await setSetting(KEY_NICKNAME, currentNickname);
    await setSetting(KEY_ENCOURAGE_FREQ, currentFreq);
    await setSetting(KEY_SELECTED_FACE, currentFaceIdx);

    // 顯示儲存成功 toast
    const { showToast } = await import('../utils/helpers.js');
    showToast('已儲存 ✓');
  }

  // ===== 載入現有設定 =====
  async function loadSettings() {
    currentNickname = await getSetting(KEY_NICKNAME, '小蘿');
    currentFreq = await getSetting(KEY_ENCOURAGE_FREQ, 'always');
    currentFaceIdx = await getSetting(KEY_SELECTED_FACE, -1);

    nickInput.value = currentNickname === '小蘿' ? '' : currentNickname;
    nickInput.placeholder = '小蘿';
    updateFaceUI();
    updateFreqUI();
  }

  loadSettings();

  // cleanup
  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

// ===== 匯出 setting key 常數供其他模組使用 =====
export { KEY_NICKNAME, KEY_ENCOURAGE_FREQ, KEY_SELECTED_FACE };
