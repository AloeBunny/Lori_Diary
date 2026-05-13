// 小蘿日誌 — 提示音系統測試
// 注意：Node.js 環境沒有 Web Audio API，這裡測試模組結構與常數正確性

import { suite, test, assert, assertEqual } from './test-runner.js';
import { VOL_DEFAULTS } from '../utils/audio.js';

suite('audio — VOL_DEFAULTS');

test('有四條音量設定', () => {
  const keys = Object.keys(VOL_DEFAULTS);
  assertEqual(keys.length, 4, '應有 4 條');
});

test('vol_master 預設 0.65', () => {
  assertEqual(VOL_DEFAULTS.vol_master, 0.65);
});

test('vol_routine 預設 0.45', () => {
  assertEqual(VOL_DEFAULTS.vol_routine, 0.45);
});

test('vol_complete 預設 0.30', () => {
  assertEqual(VOL_DEFAULTS.vol_complete, 0.30);
});

test('vol_encourage 預設 0.60', () => {
  assertEqual(VOL_DEFAULTS.vol_encourage, 0.60);
});

test('所有預設值在 0~1 之間', () => {
  for (const [key, val] of Object.entries(VOL_DEFAULTS)) {
    assert(val >= 0 && val <= 1, `${key} = ${val} 應在 [0,1]`);
  }
});

suite('audio — export 完整性');

test('playBeep 是函式', async () => {
  const mod = await import('../utils/audio.js');
  assertEqual(typeof mod.playBeep, 'function');
});

test('playComplete 是函式', async () => {
  const mod = await import('../utils/audio.js');
  assertEqual(typeof mod.playComplete, 'function');
});

test('playLevelUp 是函式', async () => {
  const mod = await import('../utils/audio.js');
  assertEqual(typeof mod.playLevelUp, 'function');
});

test('_resetAudioContext 是函式', async () => {
  const mod = await import('../utils/audio.js');
  assertEqual(typeof mod._resetAudioContext, 'function');
});
