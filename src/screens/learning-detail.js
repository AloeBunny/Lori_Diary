// 小蘿日誌 — Learning 日期細節頁
// 顯示某天的學習完成紀錄：認領的 Quest 列表 + 各 Quest 進度

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { navigate } from '../router.js';
import { dbGetAll } from '../db.js';
import { silentCatch } from '../utils/helpers.js';

// ===== 日期格式化 =====

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 格式化日期標題
 * @param {string} dateStr YYYY-MM-DD
 * @returns {string} 例如 "2026-05-26 (二)"
 */
function formatDateTitle(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const w = WEEK_DAYS[d.getDay()];
  return `${dateStr} (${w})`;
}

/**
 * 格式化目標/實際為人類可讀的進度文字
 * @param {object} claim
 * @param {string} unit
 * @returns {string}
 */
function formatProgress(claim, unit) {
  const actual = claim.c_actual || 0;
  const target = claim.c_target || 0;
  const unitStr = unit ? ` ${unit}` : '';
  return `${actual} / ${target}${unitStr}`;
}

// ===== 渲染 =====

/**
 * 渲染 Learning 日期細節頁
 * @param {HTMLElement} root
 * @param {object} params - { date: 'YYYY-MM-DD' }
 * @returns {function} cleanup
 */
export function renderLearningDetail(root, params = {}) {
  const dateStr = params.date || '';

  root.className = 'lori';

  // 狀態列
  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  // HeaderBar
  const header = createHeaderBar({
    title: '學習紀錄',
    showBack: true,
    onBack: () => navigate('#/learning/history'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '36px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // 載入資料
  _loadDetail(dateStr, body);

  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}

/**
 * 非同步載入並渲染細節
 */
async function _loadDetail(dateStr, body) {
  // 日期大標
  const dateTitle = document.createElement('div');
  dateTitle.className = 'lori-learning-detail__date-title';
  dateTitle.textContent = formatDateTitle(dateStr);
  body.appendChild(dateTitle);

  // 讀取當日 claims
  let claims = [];
  try {
    claims = await dbGetAll('claims', 'c_date', dateStr);
  } catch (e) {
    silentCatch(e, 'learning detail claims load');
  }

  if (!claims || claims.length === 0) {
    // 空狀態
    const empty = document.createElement('div');
    empty.className = 'lori-learning-detail__empty';
    empty.textContent = '這天沒有學習紀錄';
    body.appendChild(empty);
    return;
  }

  // 讀取 skills 和 quests 用來對照名稱
  let allSkills = [];
  let allQuests = [];
  try {
    allSkills = await dbGetAll('skills');
  } catch (e) {
    silentCatch(e, 'learning detail skills load');
  }
  try {
    allQuests = await dbGetAll('quests');
  } catch (e) {
    silentCatch(e, 'learning detail quests load');
  }

  // 建立查找表
  const skillMap = new Map();
  for (const sk of allSkills) {
    skillMap.set(sk.sk_index, sk);
  }
  const questMap = new Map();
  for (const q of allQuests) {
    questMap.set(`${q.sk_index}-${q.q_index}`, q);
  }

  // 總覽統計
  const totalTarget = claims.reduce((s, c) => s + (c.c_target || 0), 0);
  const totalActual = claims.reduce((s, c) => s + Math.min(c.c_actual || 0, c.c_target || 1), 0);
  const overallPct = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

  const summarySection = document.createElement('div');
  summarySection.className = 'lori-learning-detail__summary';
  summarySection.textContent = `${claims.length} 個 Quest · 整體 ${overallPct}% 完成`;
  body.appendChild(summarySection);

  // Quest 卡片
  for (const claim of claims) {
    const skill = skillMap.get(claim.sk_index);
    const quest = questMap.get(`${claim.sk_index}-${claim.q_index}`);

    const card = document.createElement('div');
    card.className = 'lori-card lori-learning-detail__quest-card';

    // Quest 名稱
    const questName = document.createElement('div');
    questName.className = 'lori-learning-detail__quest-name';
    questName.textContent = quest ? quest.q_name : `Quest ${claim.q_index}`;
    card.appendChild(questName);

    // 技能分類
    if (skill) {
      const skillLabel = document.createElement('div');
      skillLabel.className = 'lori-learning-detail__skill-label';
      skillLabel.textContent = skill.sk_name;
      if (skill.sk_category) {
        skillLabel.textContent += ` · ${skill.sk_category}`;
      }
      card.appendChild(skillLabel);
    }

    // 進度列
    const progressRow = document.createElement('div');
    progressRow.className = 'lori-learning-detail__progress-row';

    // 進度條
    const barWrap = document.createElement('div');
    barWrap.className = 'lori-learning-detail__bar-wrap';

    const barFill = document.createElement('div');
    barFill.className = 'lori-learning-detail__bar-fill';
    const claimPct = claim.c_target > 0
      ? Math.min(Math.round((claim.c_actual / claim.c_target) * 100), 100)
      : 0;
    barFill.style.width = `${claimPct}%`;

    // 完成的用 mint，未完成的用預設色
    if (claim.c_actual >= claim.c_target && claim.c_target > 0) {
      barFill.style.background = 'var(--hm-mint, #4DC49A)';
    }

    barWrap.appendChild(barFill);
    progressRow.appendChild(barWrap);

    // 進度文字
    const progressText = document.createElement('div');
    progressText.className = 'lori-learning-detail__progress-text';
    progressText.textContent = formatProgress(claim, quest?.q_unit);
    progressRow.appendChild(progressText);

    card.appendChild(progressRow);

    body.appendChild(card);
  }
}
