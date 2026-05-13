// 小蘿日誌 — 資料備份測試
// _formatTimestamp 是純函式可直接測，exportBackup 需要 IndexedDB（僅測 export 完整性）

import { suite, test, assert, assertEqual } from './test-runner.js';
import { _formatTimestamp } from '../utils/backup.js';

suite('backup — _formatTimestamp');

test('格式為 YYYYMMDD_HHMMSS', () => {
  const ts = _formatTimestamp(new Date('2026-05-12T14:30:05'));
  assertEqual(ts, '20260512_143005');
});

test('月日時分秒補零', () => {
  const ts = _formatTimestamp(new Date('2026-01-02T03:04:05'));
  assertEqual(ts, '20260102_030405');
});

test('午夜零時', () => {
  const ts = _formatTimestamp(new Date('2026-12-31T00:00:00'));
  assertEqual(ts, '20261231_000000');
});

test('自動帶入當前時間（不傳參數）', () => {
  const ts = _formatTimestamp();
  // 檢查格式：8 碼 + _ + 6 碼
  assert(/^\d{8}_\d{6}$/.test(ts), `格式應為 YYYYMMDD_HHMMSS，得到 ${ts}`);
});

suite('backup — export 完整性');

test('exportBackup 是函式', async () => {
  const mod = await import('../utils/backup.js');
  assertEqual(typeof mod.exportBackup, 'function');
});

test('檔名包含 lori_diary_backup_ 前綴', () => {
  const ts = _formatTimestamp(new Date('2026-05-12T10:00:00'));
  const filename = `lori_diary_backup_${ts}.json`;
  assert(filename.startsWith('lori_diary_backup_'), '應以 lori_diary_backup_ 開頭');
  assert(filename.endsWith('.json'), '應以 .json 結尾');
  assertEqual(filename, 'lori_diary_backup_20260512_100000.json');
});
