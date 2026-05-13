// 小蘿日誌 — 認領列表（Screen 1401）
// HeaderBar「認領 Quest」→ 小蘿推薦區 → 全部 Quest 區 → 確認認領

import { createHeaderBar } from '../components/header-bar.js';
import { createStatusBar } from '../components/status-bar.js';
import { createQuestPick } from '../components/quest-pick.js';
import { navigate } from '../router.js';
import { dbGetAll, dbAdd } from '../db.js';
import { todayStr } from '../utils/helpers.js';

// ===== 推薦邏輯 =====

/**
 * 自動推薦 Quest
 * - 有序 Quest（q_seq > 0）：找該 Skill 進度最低的未完成 Quest
 * - 無序 Quest（q_seq = 0）：直接再推薦同一筆
 * @param {Array} skills
 * @param {Array} quests
 * @param {Array} claims - 全部 claim 紀錄
 * @returns {Array<{sk_index, q_index, skill, quest}>} 推薦列表
 */
function getRecommendations(skills, quests, claims) {
  const recs = [];

  for (const sk of skills) {
    const skQuests = quests
      .filter(q => q.sk_index === sk.sk_index)
      .sort((a, b) => a.q_index - b.q_index);
    if (skQuests.length === 0) continue;

    const seqQuests = skQuests.filter(q => q.q_seq > 0).sort((a, b) => a.q_seq - b.q_seq);
    const unseqQuests = skQuests.filter(q => q.q_seq === 0);

    let picked = null;

    if (seqQuests.length > 0) {
      picked = seqQuests.find(q => q.q_total === 0 || q.q_done < q.q_total);
      if (!picked) {
        picked = seqQuests[seqQuests.length - 1];
      }
    }

    if (!picked && unseqQuests.length > 0) {
      picked = unseqQuests[0];
    }

    if (!picked && skQuests.length > 0) {
      picked = skQuests[0];
    }

    if (picked) {
      recs.push({
        sk_index: sk.sk_index,
        q_index: picked.q_index,
        skill: sk,
        quest: picked,
      });
    }
  }

  return recs;
}

// ===== 渲染 =====

/**
 * 渲染認領列表畫面
 * @param {HTMLElement} root
 * @returns {function} cleanup
 */
export function renderQuestClaim(root) {
  root.className = 'lori';

  // 選取狀態
  const selected = new Set(); // 格式：`${sk_index}-${q_index}`
  let _todayClaims = [];

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar（右上確認帶數量）
  const headerBar = createHeaderBar({
    title: '認領 Quest',
    showBack: true,
    rightLabel: '確認 (0)',
    onBack: () => navigate('#/learning'),
    onRight: () => _confirmClaim(),
  });
  root.appendChild(headerBar);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll';
  body.style.position = 'absolute';
  body.style.top = '106px';
  body.style.left = '0';
  body.style.right = '0';
  body.style.bottom = '0';
  body.style.paddingBottom = '120px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 推薦區
  const recSection = document.createElement('div');
  recSection.style.padding = '0 16px';

  const recLabel = document.createElement('div');
  recLabel.className = 'lori-quest-claim__rec-label';
  recLabel.textContent = '✦ 小蘿推薦';
  recSection.appendChild(recLabel);

  const recList = document.createElement('div');
  recList.className = 'lori-quest-claim__list';
  recSection.appendChild(recList);

  body.appendChild(recSection);

  // 分隔線
  const divider = document.createElement('div');
  divider.className = 'lori-quest-claim__divider';
  const divLine1 = document.createElement('div');
  divLine1.className = 'lori-quest-claim__divider-line';
  divider.appendChild(divLine1);
  const divText = document.createTextNode('全部 Quest');
  divider.appendChild(divText);
  const divLine2 = document.createElement('div');
  divLine2.className = 'lori-quest-claim__divider-line';
  divider.appendChild(divLine2);
  body.appendChild(divider);

  // 全部 Quest 區
  const allSection = document.createElement('div');
  allSection.style.padding = '0 16px';
  const allList = document.createElement('div');
  allList.className = 'lori-quest-claim__list';
  allSection.appendChild(allList);
  body.appendChild(allSection);

  // 底部確認按鈕
  const bottomBar = document.createElement('div');
  bottomBar.className = 'lori-quest-claim__bottom';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'lori-btn lori-btn-violet lori-quest-claim__confirm-btn';
  confirmBtn.textContent = '確認認領 · 0 個 Quest';
  confirmBtn.addEventListener('click', () => _confirmClaim());
  bottomBar.appendChild(confirmBtn);
  root.appendChild(bottomBar);

  // 更新選取數量
  function updateCount() {
    const n = selected.size;
    const rightAction = headerBar.querySelector('.header-bar__action');
    if (rightAction) rightAction.textContent = `確認 (${n})`;
    confirmBtn.textContent = `確認認領 · ${n} 個 Quest`;
  }

  // 建立 QuestPick 行（使用 Worker A 的元件）
  function makePickRow(skill, quest, isRec) {
    const key = `${quest.sk_index}-${quest.q_index}`;
    const alreadyClaimed = _todayClaims.some(
      c => c.sk_index === quest.sk_index && c.q_index === quest.q_index
    );

    // 推薦項預設勾選
    const initialChecked = (isRec && !alreadyClaimed) || alreadyClaimed;
    if (isRec && !alreadyClaimed) selected.add(key);

    const row = createQuestPick({
      quest: {
        q_name: quest.q_name,
        q_unit: quest.q_unit || '',
        q_total: quest.q_total || 0,
      },
      skillName: skill.sk_name,
      checked: initialChecked,
      accent: 'var(--violet)',
      onToggle: alreadyClaimed ? null : (checked) => {
        if (checked) {
          selected.add(key);
        } else {
          selected.delete(key);
        }
        updateCount();
      },
    });

    // 已認領的不可再次操作
    if (alreadyClaimed) {
      row.style.opacity = '0.5';
      row.style.pointerEvents = 'none';
    }

    return row;
  }

  // 確認認領
  async function _confirmClaim() {
    if (selected.size === 0) {
      navigate('#/learning');
      return;
    }

    try {
      const today = todayStr();
      const allQuests = await dbGetAll('quests');

      for (const key of selected) {
        const [skStr, qStr] = key.split('-');
        const sk_index = parseInt(skStr, 10);
        const q_index = parseInt(qStr, 10);

        const quest = allQuests.find(
          q => q.sk_index === sk_index && q.q_index === q_index
        );
        const target = quest ? (quest.q_total || 1) : 1;

        await dbAdd('claims', {
          c_date: today,
          sk_index,
          q_index,
          c_target: target,
          c_actual: 0,
        });
      }
      navigate('#/learning');
    } catch (err) {
      console.warn('認領失敗:', err);
    }
  }

  // 先載入已認領紀錄，再渲染列表
  async function _init() {
    try {
      const allClaims = await dbGetAll('claims');
      const today = todayStr();
      _todayClaims = allClaims.filter(c => c.c_date === today);
    } catch { /* ignore */ }

    await _loadClaimData(recList, allList, makePickRow, updateCount);
  }

  _init();

  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 非同步載入認領資料
 */
async function _loadClaimData(recListEl, allListEl, createRow, updateCount) {
  try {
    const skills = await dbGetAll('skills');
    const quests = await dbGetAll('quests');
    const claims = await dbGetAll('claims');

    // 推薦
    const recs = getRecommendations(skills, quests, claims);

    if (recs.length === 0) {
      const emptyRec = document.createElement('div');
      emptyRec.style.color = 'var(--gray)';
      emptyRec.style.fontSize = '13px';
      emptyRec.style.padding = '12px 0';
      emptyRec.textContent = '尚無技能或 Quest，先去新增吧';
      recListEl.appendChild(emptyRec);
    } else {
      for (const rec of recs) {
        recListEl.appendChild(createRow(rec.skill, rec.quest, true));
      }
    }

    // 全部 Quest（按技能分組）
    if (quests.length === 0) {
      const emptyAll = document.createElement('div');
      emptyAll.style.color = 'var(--gray)';
      emptyAll.style.fontSize = '13px';
      emptyAll.style.padding = '12px 0';
      emptyAll.textContent = '尚無 Quest';
      allListEl.appendChild(emptyAll);
    } else {
      const grouped = {};
      for (const q of quests) {
        if (!grouped[q.sk_index]) grouped[q.sk_index] = [];
        grouped[q.sk_index].push(q);
      }

      for (const skIdx of Object.keys(grouped)) {
        const skill = skills.find(s => s.sk_index === parseInt(skIdx, 10));
        if (!skill) continue;

        for (const quest of grouped[skIdx]) {
          allListEl.appendChild(createRow(skill, quest, false));
        }
      }
    }

    updateCount();

  } catch (err) {
    console.warn('認領列表載入失敗:', err);
  }
}

// 匯出純函式供測試使用
export { getRecommendations };
