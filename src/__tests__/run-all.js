// 小蘿日誌 — 執行所有測試
// 用法：node --experimental-vm-modules src/__tests__/run-all.js

import { summary } from './test-runner.js';

// 跑各模組測試
await import('./test-router.js');
await import('./test-helpers.js');
await import('./test-db.js');
await import('./test-icons.js');
await import('./test-ring-progress.js');
await import('./test-pill-bar.js');
await import('./test-heatmap.js');
await import('./test-mini-calendar.js');
await import('./test-dashboard.js');
await import('./test-progress-detail.js');
await import('./test-check-circle.js');
await import('./test-swipe.js');
await import('./test-todo-row.js');
await import('./test-add-bar.js');
await import('./test-todo-today.js');
await import('./test-date-stack-row.js');
await import('./test-block-card.js');
await import('./test-step-row.js');
await import('./test-form-elements.js');
await import('./test-block-list.js');
await import('./test-step-edit.js');
await import('./test-routine-history.js');
await import('./test-routine-home.js');
await import('./test-routine-timer.js');
await import('./test-routine-summary.js');
await import('./test-quest-preview-card.js');
await import('./test-quest-pick.js');
await import('./test-skill-card.js');
await import('./test-toggle.js');
await import('./test-skill-list.js');
await import('./test-skill-detail.js');
await import('./test-quest-edit.js');
await import('./test-learning-history.js');
await import('./test-learning-home.js');
await import('./test-quest-claim.js');
await import('./test-setting-elements.js');
await import('./test-encouragement.js');
await import('./test-audio.js');
await import('./test-backup.js');
await import('./test-shop-elements.js');
await import('./test-shop.js');
await import('./test-notification.js');
await import('./test-lori-customize.js');
await import('./test-pwa.js');

// 總結
const allPassed = summary();
process.exit(allPassed ? 0 : 1);
