// 小蘿日誌 — 提示音系統（Web Audio API）
// 三種內建音效：beep（倒數歸零）、complete（完成打勾）、levelUp（連續打卡）
// 音量受 settings store 的四條 slider 控制

import { getSetting } from '../db.js';

// ===== AudioContext 單例 =====

let _audioCtx = null;

/**
 * 取得或建立 AudioContext
 * @returns {AudioContext|null}
 */
function getAudioContext() {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      // 無 Web Audio 支援
    }
  }
  return _audioCtx;
}

// ===== 音量查詢 =====

/**
 * settings store 的四條音量 slider key：
 * - vol_master：總音量（預設 0.65）
 * - vol_routine：Routine 倒數（預設 0.45）
 * - vol_complete：完成打勾（預設 0.30）
 * - vol_encourage：鼓勵語 Toast（預設 0.60）
 *
 * 注意：settings.js 的 Slider 存入 IndexedDB 的是 0~100 整數，
 * _getVolume 內部會除以 100 轉為 0~1。
 * VOL_DEFAULTS 保留 0~1 供 getSetting fallback。
 */
const VOL_DEFAULTS = {
  vol_master: 0.65,
  vol_routine: 0.45,
  vol_complete: 0.30,
  vol_encourage: 0.60,
};

/**
 * 取得某場景的最終音量（場景音量 x 總音量）
 * @param {string} sceneKey - vol_routine / vol_complete / vol_toast
 * @returns {Promise<number>} 0~1
 */
async function _getVolume(sceneKey) {
  const rawMaster = await getSetting('vol_master', VOL_DEFAULTS.vol_master);
  const rawScene = await getSetting(sceneKey, VOL_DEFAULTS[sceneKey] ?? 0.5);
  // settings.js Slider 存 0~100 整數；VOL_DEFAULTS fallback 是 0~1
  // 統一轉為 0~1：大於 1 就除以 100
  const master = rawMaster > 1 ? rawMaster / 100 : rawMaster;
  const scene = rawScene > 1 ? rawScene / 100 : rawScene;
  return master * scene;
}

// ===== 音效合成 =====

/**
 * 播放 beep 音效 — Routine 倒數歸零
 * 溫和木魚風格：低頻 sine 440→220 + 短衰減
 */
export async function playBeep() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const volume = await _getVolume('vol_routine');
  if (volume <= 0) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(volume * 0.46, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // 靜默處理
  }
}

/**
 * 播放 complete 音效 — 完成打勾
 * 清脆雙音：C5 + E5，短促
 */
export async function playComplete() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const volume = await _getVolume('vol_complete');
  if (volume <= 0) return;

  try {
    // 第一音：C5 (523 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523, ctx.currentTime);
    gain1.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.25);

    // 第二音：E5 (659 Hz)，延遲 0.08s
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
    gain2.gain.setValueAtTime(0.001, ctx.currentTime);
    gain2.gain.setValueAtTime(volume * 0.35, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.35);
  } catch {
    // 靜默處理
  }
}

/**
 * 播放 levelUp 音效 — 連續打卡里程碑
 * 上行琶音：C5 → E5 → G5 → C6，歡快
 */
export async function playLevelUp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // levelUp 用 encourage 音量（因為是搭配鼓勵語出現的）
  const volume = await _getVolume('vol_encourage');
  if (volume <= 0) return;

  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  const noteGap = 0.1;
  const noteDuration = 0.3;

  try {
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      const startAt = ctx.currentTime + i * noteGap;
      osc.frequency.setValueAtTime(freq, startAt);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.setValueAtTime(volume * 0.3, startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + noteDuration);

      osc.start(startAt);
      osc.stop(startAt + noteDuration);
    });
  } catch {
    // 靜默處理
  }
}

/**
 * 供測試用：重設 AudioContext
 */
export function _resetAudioContext() {
  _audioCtx = null;
}

export { VOL_DEFAULTS };
