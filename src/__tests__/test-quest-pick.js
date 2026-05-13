// 小蘿日誌 — QuestPick 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('QuestPick — 模組匯出');

test('quest-pick.js 可被匯入', async () => {
  try {
    const mod = await import('../components/quest-pick.js');
    assert(typeof mod.createQuestPick === 'function', 'createQuestPick 應為函式');
    assert(typeof mod.setQuestPick === 'function', 'setQuestPick 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('QuestPick — 建構與結構');

test('預設參數不報錯', async () => {
  try {
    const { createQuestPick } = await import('../components/quest-pick.js');
    const el = createQuestPick();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-quest-pick'), '應有 lori-quest-pick class');
    assert(el.classList.contains('lori-card'), '應有 lori-card class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示技能名稱', async () => {
  try {
    const { createQuestPick } = await import('../components/quest-pick.js');
    const el = createQuestPick({ skillName: 'SAP · 模組' });
    const skillEl = el.querySelector('.lori-quest-pick__skill');
    assert(skillEl !== null, '應有技能名元素');
    assertEqual(skillEl.textContent, 'SAP · 模組');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示 Quest 名稱', async () => {
  try {
    const { createQuestPick } = await import('../components/quest-pick.js');
    const el = createQuestPick({
      quest: { q_name: '閱讀 FI 模組第 4 章', q_unit: '頁', q_total: 20 },
    });
    const nameEl = el.querySelector('.lori-quest-pick__name');
    assert(nameEl !== null, '應有 Quest 名稱元素');
    assertEqual(nameEl.textContent, '閱讀 FI 模組第 4 章');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示目標量和單位', async () => {
  try {
    const { createQuestPick } = await import('../components/quest-pick.js');
    const el = createQuestPick({
      quest: { q_name: '背單字', q_unit: '字', q_total: 50 },
    });
    const numEl = el.querySelector('.lori-quest-pick__target-num');
    const unitEl = el.querySelector('.lori-quest-pick__target-unit');
    assert(numEl !== null, '應有目標數量元素');
    assert(unitEl !== null, '應有單位元素');
    assertEqual(numEl.textContent, '50');
    assertEqual(unitEl.textContent, '字');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('未勾選時有空心 checkbox', async () => {
  try {
    const { createQuestPick } = await import('../components/quest-pick.js');
    const el = createQuestPick({ checked: false });
    const box = el.querySelector('.lori-quest-pick__box');
    assert(box !== null, '應有 checkbox 元素');
    assert(!box.querySelector('svg'), '未勾選不應有打勾 SVG');
    assertEqual(el.getAttribute('aria-checked'), 'false');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('已勾選時有打勾 SVG', async () => {
  try {
    const { createQuestPick } = await import('../components/quest-pick.js');
    const el = createQuestPick({ checked: true });
    const box = el.querySelector('.lori-quest-pick__box');
    assert(box !== null, '應有 checkbox 元素');
    assert(box.querySelector('svg') !== null, '已勾選應有打勾 SVG');
    assertEqual(el.getAttribute('aria-checked'), 'true');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('點擊切換勾選狀態', async () => {
  try {
    const { createQuestPick } = await import('../components/quest-pick.js');
    let toggled = null;
    const el = createQuestPick({
      checked: false,
      onToggle: (v) => { toggled = v; },
    });
    el.click();
    assert(el._checked === true, '點擊後應變為 checked');
    assertEqual(toggled, true, 'onToggle 應收到 true');
    assertEqual(el.getAttribute('aria-checked'), 'true');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('setQuestPick 外部設定不觸發 callback', async () => {
  try {
    const { createQuestPick, setQuestPick } = await import('../components/quest-pick.js');
    let called = false;
    const el = createQuestPick({
      checked: false,
      onToggle: () => { called = true; },
    });
    setQuestPick(el, true);
    assert(el._checked === true, '外部設定後應為 checked');
    assert(!called, 'setQuestPick 不應觸發 onToggle');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('role 和 tabIndex 正確', async () => {
  try {
    const { createQuestPick } = await import('../components/quest-pick.js');
    const el = createQuestPick();
    assertEqual(el.getAttribute('role'), 'checkbox');
    assertEqual(el.tabIndex, 0);
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
