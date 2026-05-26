// 小蘿日誌 — Entry Point
// ES module，負責初始化 DB、註冊路由、啟動應用

import { getDB, dbGetAll } from './db.js';
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
import { renderRoutineDetail } from './screens/routine-detail.js';
import { renderSkillList } from './screens/skill-list.js';
import { renderSkillDetail } from './screens/skill-detail.js';
import { renderQuestEdit } from './screens/quest-edit.js';
import { renderLearningHistory } from './screens/learning-history.js';
import { renderLearningDetail } from './screens/learning-detail.js';
import { renderLearningHome } from './screens/learning-home.js';
import { renderQuestClaim } from './screens/quest-claim.js';
import { renderSettings } from './screens/settings.js';
import { renderShop } from './screens/shop.js';
import { renderLoriCustomize } from './screens/lori-customize.js';
import { syncRoutineReminders, scheduleDailyPrompts } from './utils/notification.js';

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

  // Routine 特定日期（DateBar 切換用）——靜態路由放動態前面
  route('#/routine/day/:date', (params) => {
    return renderRoutineHome(getRootEl(), params);
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
    } catch (err) {
      console.warn('[小蘿日誌] routine_redo 解析失敗:', err);
      import('./utils/helpers.js').then(h => h.showToast('重做資料讀取失敗，請重新操作'));
    }

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
          } catch (err) {
            console.warn('[小蘿日誌] routine_result 更新失敗:', err);
            import('./utils/helpers.js').then(h => h.showToast('結果更新失敗，資料可能未儲存'));
          }
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

  // Routine 日期細節（從回顧/進度明細點進來）
  route('#/routine/:date', (params) => {
    return renderRoutineDetail(getRootEl(), params);
  });

  // 學習主頁（Screen 1400）
  route('#/learning', () => {
    return renderLearningHome(getRootEl());
  });

  // 學習特定日期（DateBar 切換用）——靜態路由放動態前面
  route('#/learning/day/:date', (params) => {
    return renderLearningHome(getRootEl(), params);
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

  // 學習日期細節（從回顧/進度明細點進來）
  route('#/learning/:date', (params) => {
    return renderLearningDetail(getRootEl(), params);
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

  // F12 + Routine 推播：啟動時排程每日提醒
  try {
    const blocks = await dbGetAll('blocks');
    if (blocks && blocks.length > 0) {
      await syncRoutineReminders(blocks);
      await scheduleDailyPrompts(blocks);
    }
  } catch (e) {
    console.warn('[小蘿日誌] 推播排程初始化失敗:', e);
  }
}

init().catch(err => {
  console.error('小蘿日誌初始化失敗:', err);
});
