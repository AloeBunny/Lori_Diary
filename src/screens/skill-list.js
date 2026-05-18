// 小蘿日誌 — 技能列表頁（Screen 1410）
// StatusBar → HeaderBar「技能列表」→ SkillCard 列表 → AddBar → TabBar
// 從 db 讀 skills + 計算每個的 quest 數和進度

import { createStatusBar } from '../components/status-bar.js';
import { createTabBar } from '../components/tab-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { createSkillCard } from '../components/skill-card.js';
import { createAddBar } from '../components/add-bar.js';
import { navigate } from '../router.js';
import { dbGetAll, dbAdd, dbDelete } from '../db.js';

// ===== 色票輪轉 =====

const SKILL_COLORS = [
  'var(--hm-sun)',
  'var(--hm-mint)',
  'var(--hm-lavender)',
  'var(--carrot)',
  'var(--hm-sky)',
  'var(--hm-coral)',
  'var(--hm-sage)',
  'var(--hm-peach)',
  'var(--hm-rose)',
];

/**
 * 根據 skill index 取得色條顏色
 * @param {number} idx
 * @returns {string}
 */
function getSkillColor(idx) {
  return SKILL_COLORS[idx % SKILL_COLORS.length];
}

// ===== 進度計算 =====

/**
 * 計算某個 skill 的整體進度
 * 公式：已完成 quest 數 / 全部 quest 數
 * quest 完成判定：q_done >= q_total（且 q_total > 0）
 * @param {Array} quests - 該 skill 的所有 quest
 * @returns {number} 0~1
 */
function calcSkillProgress(quests) {
  if (!quests || quests.length === 0) return 0;
  const completed = quests.filter(q => q.q_total > 0 && q.q_done >= q.q_total).length;
  return completed / quests.length;
}

// ===== 渲染 =====

/**
 * 渲染技能列表頁到容器
 * @param {HTMLElement} root
 * @returns {function} cleanup
 */
export function renderSkillList(root) {
  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: '技能列表',
    showBack: true,
    onBack: () => navigate('#/learning'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll lori-skill-list';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '160px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 列表容器
  const listContainer = document.createElement('div');
  listContainer.className = 'lori-skill-list__cards';
  body.appendChild(listContainer);

  // AddBar 浮動按鈕
  const addBar = createAddBar({
    label: '新增技能',
    onClick: () => _handleAddSkill(),
  });
  root.appendChild(addBar);

  // TabBar
  const tabBar = createTabBar('lrn');
  root.appendChild(tabBar);

  // 載入資料
  _loadSkillData(listContainer);

  // cleanup
  return () => {
    const cards = root.querySelectorAll('.lori-skill-card-wrap');
    cards.forEach(card => { if (card._swipeCtrl) card._swipeCtrl.destroy(); });
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 載入所有 Skill 資料並渲染列表
 */
async function _loadSkillData(listContainer) {
  try {
    const skills = await dbGetAll('skills');
    const allQuests = await dbGetAll('quests');

    // 清空列表
    while (listContainer.firstChild) listContainer.removeChild(listContainer.firstChild);

    if (skills.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'lori-skill-list__empty';
      emptyMsg.textContent = '還沒有任何技能';
      listContainer.appendChild(emptyMsg);
      return;
    }

    // 依 sk_index 排序
    skills.sort((a, b) => a.sk_index - b.sk_index);

    skills.forEach((skill, i) => {
      // 計算該 skill 的 quest 資訊
      const skillQuests = allQuests.filter(q => q.sk_index === skill.sk_index);
      const questCount = skillQuests.length;
      const progress = calcSkillProgress(skillQuests);
      const color = getSkillColor(i);

      const card = createSkillCard({
        skill: {
          sk_index: skill.sk_index,
          sk_name: skill.sk_name,
          sk_category: skill.sk_category || '',
          progress: Math.round(progress * 100),
        },
        questCount,
        color,
        onClick: (skIdx) => navigate(`#/learning/skills/${skIdx}`),
        onDelete: async (skIdx) => {
          if (!confirm(`確定刪除「${skill.sk_name}」？`)) return;
          try {
            await dbDelete('skills', skIdx);
            _loadSkillData(listContainer);
          } catch (err) {
            console.warn('技能刪除失敗:', err);
          }
        },
      });
      listContainer.appendChild(card);
    });
  } catch (err) {
    console.warn('技能列表載入失敗:', err);
    const errorMsg = document.createElement('div');
    errorMsg.className = 'lori-skill-list__empty';
    errorMsg.textContent = '資料載入失敗';
    listContainer.appendChild(errorMsg);
  }
}

/**
 * 新增技能：自動建新 skill 並導航到明細頁
 */
async function _handleAddSkill() {
  try {
    const newSkill = {
      sk_name: '新技能',
      sk_category: '',
    };
    const newId = await dbAdd('skills', newSkill);

    // 直接進入明細頁
    navigate(`#/learning/skills/${newId}`);
  } catch (err) {
    console.warn('新增技能失敗:', err);
  }
}

// 匯出供測試
export { getSkillColor, SKILL_COLORS, calcSkillProgress };
