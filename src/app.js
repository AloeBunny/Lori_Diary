// 小蘿日誌 — Entry Point
// ES module，負責初始化 DB、註冊路由、啟動應用

import { getDB } from './db.js';
import { route, initRouter, navigate, onNotFound, getRootEl } from './router.js';
import { renderCover } from './screens/cover.js';
import { renderPlaceholder } from './screens/placeholder.js';
import { renderDashboard } from './screens/dashboard.js';
import { renderProgressDetail } from './screens/progress-detail.js';
import { renderTodoToday } from './screens/todo-today.js';
import { renderTodoHistory } from './screens/todo-history.js';
import { renderRoutineHome } from './screens/routine-home.js';
import { renderRoutineTimer } from './screens/routine-timer.js';
import { renderRoutineSummary } from './screens/routine-summary.js';
import { renderBlockList } from './screens/block-list.js';
import { renderBlockEdit } from './screens/block-edit.js';
import { renderStepList } from './screens/step-list.js';
import { renderStepEdit } from './screens/step-edit.js';
import { renderRoutineHistory } from './screens/routine-history.js';
import { renderSkillList } from './screens/skill-list.js';
import { renderSkillDetail } from './screens/skill-detail.js';
import { renderQuestEdit } from './screens/quest-edit.js';
import { renderLearningHistory } from './screens/learning-history.js';
import { renderLearningHome } from './screens/learning-home.js';
import { renderQuestClaim } from './screens/quest-claim.js';
import { renderSettings } from './screens/settings.js';
import { renderShop } from './screens/shop.js';
import { renderLoriCustomize } from './screens/lori-customize.js';

// ===== 路由註冊 =====
function registerRoutes() {
  // 封面
  route('#/cover', () => {
    return renderCover(getRootEl());
  });

  // 儀表板（Phase 2 實作）
  route('#/dashboard', () => {
    return renderDashboard(getRootEl());
  });

  // 進度明細（Phase 2 實作）
  route('#/progress/:date', (params) => {
    return renderProgressDetail(getRootEl(), params);
  });

  // TODO 歷史（Screen 1210）——靜態路由放動態前面
  route('#/todo/history', () => {
    return renderTodoHistory(getRootEl());
  });

  // TODO 當日（Screen 1200）
  route('#/todo', () => {
    return renderTodoToday(getRootEl());
  });

  // TODO 特定日期（Screen 1200 帶日期參數）
  route('#/todo/:date', (params) => {
    return renderTodoToday(getRootEl(), params);
  });

  // Routine 主頁（Screen 1300）
  route('#/routine', () => {
    return renderRoutineHome(getRootEl());
  });

  // Routine 回顧（Screen 1320）——靜態路由放動態前面
  route('#/routine/history', () => {
    return renderRoutineHistory(getRootEl());
  });

  // Block 列表（Screen 1310）——靜態路由放動態前面
  route('#/routine/blocks', () => {
    return renderBlockList(getRootEl());
  });

  // Step 編輯（Screen 131B）——多段路由放短路由前面
  route('#/routine/blocks/:blockId/steps/:stepId', (params) => {
    return renderStepEdit(getRootEl(), params);
  });

  // Step 列表（Screen 1311）
  route('#/routine/blocks/:blockId/steps', (params) => {
    return renderStepList(getRootEl(), params);
  });

  // Block 編輯（Screen 131A）
  route('#/routine/blocks/:blockId', (params) => {
    return renderBlockEdit(getRootEl(), params);
  });

  // Routine 重做（從 1302 摘要頁重做跳過的 step）
  route('#/routine/redo/:blockIndex', (params) => {
    // 從 sessionStorage 讀取重做資料
    let redoData = null;
    try {
      const raw = sessionStorage.getItem('routine_redo');
      if (raw) redoData = JSON.parse(raw);
    } catch { /* ignore */ }

    if (redoData) {
      return renderRoutineTimer(getRootEl(), { blockIndex: params.blockIndex }, {
        redoStep: redoData.step,
        blockName: redoData.blockName,
        onRedoComplete: (result) => {
          // 更新原始結果
          try {
            const raw = sessionStorage.getItem('routine_result');
            if (raw) {
              const data = JSON.parse(raw);
              if (result === 'completed') {
                data.results[redoData.originalIdx] = 'completed';
              }
              sessionStorage.setItem('routine_result', JSON.stringify(data));
            }
          } catch { /* ignore */ }
          sessionStorage.removeItem('routine_redo');
          navigate(`#/routine/summary/${params.blockIndex}`);
        },
      });
    }
    return renderPlaceholder(getRootEl(), '重做', { showBack: true, showTabBar: false });
  });

  // Routine 計時進行（Screen 1301）
  route('#/routine/timer/:blockIndex', (params) => {
    return renderRoutineTimer(getRootEl(), params);
  });

  // Routine 完成摘要（Screen 1302）
  route('#/routine/summary/:blockIndex', (params) => {
    return renderRoutineSummary(getRootEl(), params);
  });

  // Routine 特定日期
  route('#/routine/:blockId', (params) => {
    return renderPlaceholder(getRootEl(), `Routine · ${params.blockId}`, { showBack: true, showTabBar: false });
  });

  // 學習主頁（Screen 1400）
  route('#/learning', () => {
    return renderLearningHome(getRootEl());
  });

  // 學習回顧（Screen 1420）——靜態路由放動態前面
  route('#/learning/history', () => {
    return renderLearningHistory(getRootEl());
  });

  // 認領 Quest（Screen 1401）
  route('#/learning/claim', () => {
    return renderQuestClaim(getRootEl());
  });

  // 技能列表（Screen 1410）
  route('#/learning/skills', () => {
    return renderSkillList(getRootEl());
  });

  // Quest 編輯（Screen 141B）——多段路由放短路由前面
  route('#/learning/skills/:skillId/quests/:questId', (params) => {
    return renderQuestEdit(getRootEl(), params);
  });

  // Skill 明細（Screen 141A）
  route('#/learning/skills/:skillId', (params) => {
    return renderSkillDetail(getRootEl(), params);
  });

  // 學習特定日期（進度明細跳轉用，Phase 5 實作）
  route('#/learning/:date', (params) => {
    return renderPlaceholder(getRootEl(), `學習 · ${params.date}`, { showBack: true });
  });

  // 小蘿自訂（Screen 1500 子頁）——靜態路由放動態前面
  route('#/settings/lori', () => {
    return renderLoriCustomize(getRootEl());
  });

  // 設定（Screen 1500）
  route('#/settings', () => {
    return renderSettings(getRootEl());
  });

  // 商店（Screen 1600）
  route('#/shop', () => {
    return renderShop(getRootEl());
  });

  // 404
  onNotFound(() => {
    renderPlaceholder(getRootEl(), '404', { showTabBar: false });
  });
}

// ===== 啟動 =====
async function init() {
  // 初始化 IndexedDB
  await getDB();

  // 建立渲染容器
  const appEl = document.getElementById('app');

  // 註冊路由
  registerRoutes();

  // 初始化 router
  initRouter(appEl);
}

init().catch(err => {
  console.error('小蘿日誌初始化失敗:', err);
});
