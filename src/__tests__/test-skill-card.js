// 小蘿日誌 — SkillCard 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('SkillCard — 模組匯出');

test('skill-card.js 可被匯入', async () => {
  try {
    const mod = await import('../components/skill-card.js');
    assert(typeof mod.createSkillCard === 'function', 'createSkillCard 應為函式');
    assert(typeof mod.updateSkillCard === 'function', 'updateSkillCard 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('SkillCard — 建構與結構');

test('預設參數不報錯', async () => {
  try {
    const { createSkillCard } = await import('../components/skill-card.js');
    const el = createSkillCard();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-skill-card'), '應有 lori-skill-card class');
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
    const { createSkillCard } = await import('../components/skill-card.js');
    const el = createSkillCard({
      skill: { sk_index: 1, sk_name: 'IELTS · 字彙', sk_category: '語言 · 出國', progress: 62 },
    });
    const nameEl = el.querySelector('.lori-skill-card__name');
    assert(nameEl !== null, '應有名稱元素');
    assertEqual(nameEl.textContent, 'IELTS · 字彙');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示分類標籤', async () => {
  try {
    const { createSkillCard } = await import('../components/skill-card.js');
    const el = createSkillCard({
      skill: { sk_index: 1, sk_name: 'IELTS', sk_category: '語言 · 出國', progress: 50 },
    });
    const catEl = el.querySelector('.lori-skill-card__cat');
    assert(catEl !== null, '應有分類標籤');
    assertEqual(catEl.textContent, '語言 · 出國');
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
    const { createSkillCard } = await import('../components/skill-card.js');
    const el = createSkillCard({
      skill: { sk_index: 1, sk_name: 'IELTS', sk_category: '', progress: 62 },
    });
    const pctNum = el.querySelector('.lori-skill-card__pct-num');
    assert(pctNum !== null, '應有百分比數字');
    assertEqual(pctNum.textContent, '62');
    const pctUnit = el.querySelector('.lori-skill-card__pct-unit');
    assertEqual(pctUnit.textContent, '%');
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
    const { createSkillCard } = await import('../components/skill-card.js');
    const el1 = createSkillCard({ skill: { sk_index: 0, sk_name: '', sk_category: '', progress: -20 } });
    assertEqual(el1.querySelector('.lori-skill-card__pct-num').textContent, '0');

    const el2 = createSkillCard({ skill: { sk_index: 0, sk_name: '', sk_category: '', progress: 130 } });
    assertEqual(el2.querySelector('.lori-skill-card__pct-num').textContent, '100');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('顯示 Quest 數量', async () => {
  try {
    const { createSkillCard } = await import('../components/skill-card.js');
    const el = createSkillCard({ questCount: 12 });
    const qEl = el.querySelector('.lori-skill-card__quest-count');
    assert(qEl !== null, '應有 quest 數量元素');
    assertEqual(qEl.textContent, '12 quest');
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
    const { createSkillCard } = await import('../components/skill-card.js');
    const el = createSkillCard({
      skill: { sk_index: 0, sk_name: '', sk_category: '', progress: 41 },
    });
    const pill = el.querySelector('.lori-pill-bar');
    assert(pill !== null, '應有 PillBar 元素');
    const fill = pill.querySelector('.lori-pill-bar__fill');
    assertEqual(fill.style.width, '41%', 'PillBar fill 應為 41%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('有 data-skill-index', async () => {
  try {
    const { createSkillCard } = await import('../components/skill-card.js');
    const el = createSkillCard({
      skill: { sk_index: 5, sk_name: '運動', sk_category: '身體', progress: 71 },
    });
    assertEqual(el.dataset.skillIndex, '5', 'data-skill-index 應為 5');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('有 onClick 時設定 cursor', async () => {
  try {
    const { createSkillCard } = await import('../components/skill-card.js');
    let clicked = null;
    const el = createSkillCard({
      skill: { sk_index: 3, sk_name: 'X', sk_category: 'Y', progress: 0 },
      onClick: (idx) => { clicked = idx; },
    });
    assertEqual(el.style.cursor, 'pointer', '有 onClick 時應有 pointer cursor');
    el.click();
    assertEqual(clicked, 3, 'onClick 應收到 sk_index');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('updateSkillCard 更新百分比', async () => {
  try {
    const { createSkillCard, updateSkillCard } = await import('../components/skill-card.js');
    const el = createSkillCard({
      skill: { sk_index: 0, sk_name: '', sk_category: '', progress: 30 },
    });
    updateSkillCard(el, 85);
    assertEqual(el.querySelector('.lori-skill-card__pct-num').textContent, '85');
    const fill = el.querySelector('.lori-pill-bar__fill');
    assertEqual(fill.style.width, '85%', '更新後 PillBar 寬度應為 85%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
