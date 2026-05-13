// 小蘿日誌 — QuestPreviewCard 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('QuestPreviewCard — 模組匯出');

test('quest-preview-card.js 可被匯入', async () => {
  try {
    const mod = await import('../components/quest-preview-card.js');
    assert(typeof mod.createQuestPreviewCard === 'function', 'createQuestPreviewCard 應為函式');
    assert(typeof mod.updateQuestPreviewCard === 'function', 'updateQuestPreviewCard 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('QuestPreviewCard — 建構與結構');

test('預設參數不報錯', async () => {
  try {
    const { createQuestPreviewCard } = await import('../components/quest-preview-card.js');
    const el = createQuestPreviewCard();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-quest-preview'), '應有 lori-quest-preview class');
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
    const { createQuestPreviewCard } = await import('../components/quest-preview-card.js');
    const el = createQuestPreviewCard({ skillName: 'IELTS · 字彙' });
    const skillEl = el.querySelector('.lori-quest-preview__skill');
    assert(skillEl !== null, '應有技能名元素');
    assertEqual(skillEl.textContent, 'IELTS · 字彙');
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
    const { createQuestPreviewCard } = await import('../components/quest-preview-card.js');
    const el = createQuestPreviewCard({
      quest: { q_name: '背 50 個單字', q_unit: '字', c_target: 50, c_actual: 31 },
    });
    const nameEl = el.querySelector('.lori-quest-preview__name');
    assert(nameEl !== null, '應有 Quest 名稱元素');
    assertEqual(nameEl.textContent, '背 50 個單字');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示數量 actual / target', async () => {
  try {
    const { createQuestPreviewCard } = await import('../components/quest-preview-card.js');
    const el = createQuestPreviewCard({
      quest: { q_name: '背單字', q_unit: '字', c_target: 50, c_actual: 31 },
    });
    const countEl = el.querySelector('.lori-quest-preview__count');
    assert(countEl !== null, '應有數量元素');
    assertEqual(countEl.textContent, '31 / 50');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('百分比顯示正確', async () => {
  try {
    const { createQuestPreviewCard } = await import('../components/quest-preview-card.js');
    const el = createQuestPreviewCard({ progressPercent: 62 });
    const pctEl = el.querySelector('.lori-quest-preview__pct');
    assert(pctEl !== null, '應有百分比元素');
    assertEqual(pctEl.textContent, '62%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('百分比 clamp 在 0~100', async () => {
  try {
    const { createQuestPreviewCard } = await import('../components/quest-preview-card.js');
    const el1 = createQuestPreviewCard({ progressPercent: -10 });
    assertEqual(el1.querySelector('.lori-quest-preview__pct').textContent, '0%');

    const el2 = createQuestPreviewCard({ progressPercent: 150 });
    assertEqual(el2.querySelector('.lori-quest-preview__pct').textContent, '100%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('有 PillBar', async () => {
  try {
    const { createQuestPreviewCard } = await import('../components/quest-preview-card.js');
    const el = createQuestPreviewCard({ progressPercent: 40 });
    const pill = el.querySelector('.lori-pill-bar');
    assert(pill !== null, '應有 PillBar 元素');
    const fill = pill.querySelector('.lori-pill-bar__fill');
    assertEqual(fill.style.width, '40%', 'PillBar fill 應為 40%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('有 onComplete 時顯示完成按鈕', async () => {
  try {
    const { createQuestPreviewCard } = await import('../components/quest-preview-card.js');
    const el = createQuestPreviewCard({ onComplete: () => {} });
    const btn = el.querySelector('.lori-quest-preview__complete-btn');
    assert(btn !== null, '應有完成按鈕');
    assertEqual(btn.textContent, '完成');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('無 onComplete 時不顯示完成按鈕', async () => {
  try {
    const { createQuestPreviewCard } = await import('../components/quest-preview-card.js');
    const el = createQuestPreviewCard();
    const btn = el.querySelector('.lori-quest-preview__complete-btn');
    assert(btn === null, '不應有完成按鈕');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('updateQuestPreviewCard 更新百分比和數量', async () => {
  try {
    const { createQuestPreviewCard, updateQuestPreviewCard } = await import('../components/quest-preview-card.js');
    const el = createQuestPreviewCard({
      quest: { q_name: '背單字', q_unit: '字', c_target: 50, c_actual: 31 },
      progressPercent: 62,
    });
    updateQuestPreviewCard(el, 80, 40, 50);
    assertEqual(el.querySelector('.lori-quest-preview__pct').textContent, '80%');
    assertEqual(el.querySelector('.lori-quest-preview__count').textContent, '40 / 50');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
