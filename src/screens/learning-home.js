// 小蘿日誌 — 學習主頁（Screen 1400）
// StatusBar → DateBar → 今日認領 Quest → 認領/技能/回顧按鈕 → 本週技能熱度 → TabBar

import { createStatusBar } from '../components/status-bar.js';
import { createTabBar } from '../components/tab-bar.js';
import { createDateBar, updateDateBarProgress } from '../components/date-bar.js';
import { createQuestPreviewCard } from '../components/quest-preview-card.js';
import { createPillBar } from '../components/pill-bar.js';
import { iconPlus } from '../components/icons.js';
import { navigate } from '../router.js';
import { dbGetAll, dbPut, addCarrots } from '../db.js';
import { todayStr, showToast, getEncouragement } from '../utils/helpers.js';

// ===== 色彩分配 =====
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
 * 根據 skill index 取得顏色
 */
function skillColor(skIndex) {
  return SKILL_COLORS[(skIndex - 1) % SKILL_COLORS.length];
}

// ===== 積分計算 =====

/**
 * 根據當日 Quest 完成度計算紅蘿蔔
 * @param {number} pct - 完成比例（0~N，可超過 1）
 * @returns {number} 0 | 1 | 2
 */
function calcLearningCarrots(pct) {
  if (pct > 1) return 2;
  if (pct > 0.5) return 1;
  return 0;
}

/**
 * 計算今日認領完成度
 * @param {Array} claims - 今日認領紀錄
 * @returns {number} 0~N
 */
function calcClaimsProgress(claims) {
  if (!claims || claims.length === 0) return 0;
  const totalTarget = claims.reduce((s, c) => s + (c.c_target || 0), 0);
  const totalActual = claims.reduce((s, c) => s + (c.c_actual || 0), 0);
  if (totalTarget === 0) return 0;
  return totalActual / totalTarget;
}

// ===== 本週技能熱度計算 =====

/**
 * 取得本週七天的日期字串陣列（週一~週日）
 * @returns {string[]} YYYY-MM-DD 格式
 */
function getWeekDates() {
  const today = new Date();
  const dow = today.getDay(); // 0=日
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * 計算每個技能在本週七天是否有 claim
 * @param {Array} skills
 * @param {Array} claims
 * @param {string[]} weekDates
 * @returns {Array<{name, color, days: boolean[]}>}
 */
function calcWeeklyHeat(skills, claims, weekDates) {
  return skills.map(sk => {
    const days = weekDates.map(dateStr => {
      return claims.some(c =>
        c.sk_index === sk.sk_index &&
        c.c_date === dateStr &&
        c.c_actual > 0
      );
    });
    return {
      name: sk.sk_name,
      color: skillColor(sk.sk_index),
      days,
    };
  });
}

// ===== 渲染 =====

/**
 * 渲染學習主頁
 * @param {HTMLElement} root
 * @returns {function} cleanup
 */
export function renderLearningHome(root) {
  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '54px';
  body.style.paddingBottom = '100px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 頁面標題
  const titleSection = document.createElement('div');
  titleSection.style.padding = '10px 16px 14px';
  const pageTitle = document.createElement('div');
  pageTitle.style.fontSize = '26px';
  pageTitle.style.fontWeight = '700';
  pageTitle.style.letterSpacing = '-0.4px';
  pageTitle.textContent = '學習';
  titleSection.appendChild(pageTitle);
  body.appendChild(titleSection);

  // DateBar
  const dateBar = createDateBar({
    date: new Date(),
    progress: 0,
    isToday: true,
    onList: () => navigate('#/learning/history'),
  });
  body.appendChild(dateBar);

  // 今日認領區
  const claimSection = document.createElement('div');
  claimSection.style.marginTop = '18px';
  claimSection.style.padding = '0 16px';

  const claimLabel = document.createElement('div');
  claimLabel.className = 'lori-learning-home__section-label';
  claimLabel.textContent = '今日認領（0）';
  claimSection.appendChild(claimLabel);

  const claimList = document.createElement('div');
  claimList.className = 'lori-learning-home__claim-list';
  claimSection.appendChild(claimList);

  // 認領今日 Quest 按鈕
  const claimBtn = document.createElement('button');
  claimBtn.className = 'lori-btn lori-btn-violet lori-learning-home__claim-btn';
  const plusIcon = iconPlus(18);
  plusIcon.style.color = '#fff';
  claimBtn.appendChild(plusIcon);
  const btnText = document.createTextNode(' 認領今日 Quest');
  claimBtn.appendChild(btnText);
  claimBtn.addEventListener('click', () => navigate('#/learning/claim'));
  claimSection.appendChild(claimBtn);

  // 技能列表 + 回顧按鈕
  const navRow = document.createElement('div');
  navRow.className = 'lori-learning-home__nav-row';

  const skillsBtn = document.createElement('button');
  skillsBtn.className = 'lori-btn lori-btn-ghost';
  skillsBtn.style.flex = '1';
  skillsBtn.style.height = '52px';
  skillsBtn.textContent = '技能列表';
  skillsBtn.addEventListener('click', () => navigate('#/learning/skills'));
  navRow.appendChild(skillsBtn);

  const historyBtn = document.createElement('button');
  historyBtn.className = 'lori-btn lori-btn-ghost';
  historyBtn.style.flex = '1';
  historyBtn.style.height = '52px';
  historyBtn.textContent = '回顧';
  historyBtn.addEventListener('click', () => navigate('#/learning/history'));
  navRow.appendChild(historyBtn);

  claimSection.appendChild(navRow);
  body.appendChild(claimSection);

  // 本週技能熱度
  const heatSection = document.createElement('div');
  heatSection.className = 'lori-learning-home__heat-section';

  const heatLabel = document.createElement('div');
  heatLabel.className = 'lori-learning-home__section-label';
  heatLabel.textContent = '本週技能熱度';
  heatSection.appendChild(heatLabel);

  const heatCard = document.createElement('div');
  heatCard.className = 'lori-card lori-learning-home__heat-card';
  heatSection.appendChild(heatCard);

  body.appendChild(heatSection);

  // TabBar
  const tabBar = createTabBar('lrn');
  root.appendChild(tabBar);

  // 載入資料
  _loadLearningData(claimLabel, claimList, heatCard, dateBar);

  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 非同步載入學習資料
 */
async function _loadLearningData(claimLabelEl, claimListEl, heatCardEl, dateBarEl) {
  try {
    const today = todayStr();
    const skills = await dbGetAll('skills');
    const quests = await dbGetAll('quests');
    const allClaims = await dbGetAll('claims');

    // 今日認領
    const todayClaims = allClaims.filter(c => c.c_date === today);

    // 更新標題
    claimLabelEl.textContent = `今日認領（${todayClaims.length}）`;

    if (todayClaims.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'lori-learning-home__empty';
      emptyMsg.textContent = '尚未認領任何 Quest，點下方按鈕開始';
      claimListEl.appendChild(emptyMsg);
    } else {
      // 渲染每個認領的 Quest
      for (const claim of todayClaims) {
        const skill = skills.find(s => s.sk_index === claim.sk_index);
        const quest = quests.find(q =>
          q.sk_index === claim.sk_index && q.q_index === claim.q_index
        );
        if (!skill || !quest) continue;

        const pct = claim.c_target > 0
          ? Math.round((claim.c_actual / claim.c_target) * 100)
          : 0;
        const color = skillColor(skill.sk_index);
        const isDone = claim.c_actual >= claim.c_target;

        const card = createQuestPreviewCard({
          quest: {
            q_name: quest.q_name,
            q_unit: quest.q_unit || '',
            c_target: claim.c_target,
            c_actual: claim.c_actual,
          },
          skillName: skill.sk_name,
          progressPercent: pct,
          color,
          onComplete: isDone ? null : async () => {
            await _completeQuest(claim, claimLabelEl, claimListEl, heatCardEl, dateBarEl);
          },
        });

        claimListEl.appendChild(card);
      }
    }

    // 更新 DateBar 進度
    const progress = calcClaimsProgress(todayClaims);
    updateDateBarProgress(dateBarEl, progress);

    // 本週技能熱度
    if (skills.length === 0) {
      const emptyHeat = document.createElement('div');
      emptyHeat.style.padding = '20px';
      emptyHeat.style.textAlign = 'center';
      emptyHeat.style.color = 'var(--gray)';
      emptyHeat.style.fontSize = '13px';
      emptyHeat.textContent = '尚無技能，先去新增吧';
      heatCardEl.appendChild(emptyHeat);
    } else {
      const weekDates = getWeekDates();
      const heatData = calcWeeklyHeat(skills, allClaims, weekDates);
      _renderHeatmap(heatCardEl, heatData);
    }

  } catch (err) {
    console.warn('學習主頁資料載入失敗:', err);
    claimLabelEl.textContent = '今日認領（載入失敗）';
  }
}

/**
 * 完成按鈕邏輯：把 c_actual 設為 c_target，加紅蘿蔔 + toast
 */
async function _completeQuest(claim, claimLabelEl, claimListEl, heatCardEl, dateBarEl) {
  try {
    // 更新 claim
    claim.c_actual = claim.c_target;
    await dbPut('claims', claim);

    // 計算紅蘿蔔
    const today = todayStr();
    const allClaims = await dbGetAll('claims');
    const todayClaims = allClaims.filter(c => c.c_date === today);
    const pct = calcClaimsProgress(todayClaims);
    const carrots = calcLearningCarrots(pct);

    if (carrots > 0) {
      await addCarrots(carrots);
    }

    // toast
    const msg = await getEncouragement('learning');
    showToast(msg);

    // 重新渲染列表
    while (claimListEl.firstChild) claimListEl.removeChild(claimListEl.firstChild);
    const skills = await dbGetAll('skills');
    const quests = await dbGetAll('quests');
    await _loadLearningData(claimLabelEl, claimListEl, heatCardEl, dateBarEl);
  } catch (err) {
    console.warn('完成 Quest 失敗:', err);
  }
}

/**
 * 渲染本週技能熱度小方塊
 */
function _renderHeatmap(container, heatData) {
  while (container.firstChild) container.removeChild(container.firstChild);

  for (const row of heatData) {
    const rowEl = document.createElement('div');
    rowEl.className = 'lori-learning-home__heat-row';

    const nameEl = document.createElement('div');
    nameEl.className = 'lori-learning-home__heat-name';
    nameEl.textContent = row.name;
    rowEl.appendChild(nameEl);

    const dotsEl = document.createElement('div');
    dotsEl.className = 'lori-learning-home__heat-dots';

    for (let i = 0; i < 7; i++) {
      const dot = document.createElement('div');
      dot.className = 'lori-learning-home__heat-dot';
      dot.style.background = row.days[i] ? row.color : '#EFEBE1';
      dotsEl.appendChild(dot);
    }

    rowEl.appendChild(dotsEl);
    container.appendChild(rowEl);
  }
}

// 匯出純函式供測試使用
export {
  skillColor,
  calcLearningCarrots,
  calcClaimsProgress,
  getWeekDates,
  calcWeeklyHeat,
};
