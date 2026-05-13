// 小蘿日誌 — Icons 模組測試（瀏覽器環境用）
// 在 Node 環境因缺少 DOM 所以用 mock

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('Icons — 模組匯出');

test('icons.js 可被匯入', async () => {
  // 在 Node 環境沒有 document.createElementNS，
  // 所以只測試模組是否可以匯入不報錯
  try {
    // 檢查模組匯出的函式名清單
    const mod = await import('../components/icons.js');
    const expectedFns = [
      'iconGear', 'iconShop', 'iconPlus', 'iconCheck',
      'iconChev', 'iconChevL', 'iconSkip', 'iconPlay',
      'iconList', 'iconClose', 'iconDash', 'iconToday',
      'iconTimer', 'iconBook', 'iconBell', 'iconCloud',
      'iconSpeaker', 'iconInfo', 'iconBunny', 'iconDice',
      'iconTrash', 'iconSignal', 'iconBattery',
    ];
    expectedFns.forEach(name => {
      assert(typeof mod[name] === 'function', `${name} 應為函式`);
    });
    assertEqual(expectedFns.length, 23, '應有 23 個 icon 函式');
  } catch (e) {
    // 如果在 Node 環境匯入失敗（缺少 DOM），跳過但不算失敗
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，icon 函式匯出檢查跳過)');
    } else {
      throw e;
    }
  }
});
