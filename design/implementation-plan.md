# 小蘿日誌 — 設計稿實作計畫

**產出日期**：2026-05-12
**來源**：Claude Design Handoff Bundle（`design/Lori_dairy-handoff/lori-dairy/project/`）
**現有程式碼**：`src/app.js` + `src/style.css` + `src/index.html`

---

## 一、設計稿摘要

設計稿共 **5 個 Section、21 個 Artboard（畫面）**，裝置規格為 iPhone 14 Plus（430 x 932）。

### Section 1：開機 / 儀表板

| 編號 | 名稱 | 主要 UI 元素 | 互動行為 |
|------|------|-------------|---------|
| 1000 | 封面 | ASCII 兔子、App 標題「小蘿日誌」、START 按鈕、版本資訊 | 暗色背景；點 START 進入儀表板 |
| 1100 | 儀表板 | 紅蘿蔔積分、完成度圓環（RingProgress）、16 週熱力圖、月曆（MiniCalendar）、右上齒輪/商店入口、底部 TabBar | 點圓環進入 1110 進度明細；點月曆日期可展開；右上角進設定/商店 |
| 1110 | 進度明細 | HeaderBar（返回）、日期+整體%、大進度條、三分類（待辦/日常循環/學習）卡片各帶 PillBar、底部鼓勵語 | 返回儀表板 |

### Section 2：一般 / 待辦

| 編號 | 名稱 | 主要 UI 元素 | 互動行為 |
|------|------|-------------|---------|
| 1200 | TODO 當日 | 頁面標題「待辦」、DateBar（日期切換+完成度）、TodoRow 列表（checkbox + 名稱 + 急迫標 + 紅蘿蔔）、浮動「新增待辦」按鈕、TabBar | 點 checkbox 打勾；左滑出現刪除（swipe-to-delete）；點 DateBar 列表圖示進入 1210 |
| 1210 | TODO 列表（日期堆疊） | HeaderBar「TODO 歷史」、DateStackRow（日期卡片帶進度填色）、TabBar | 點某天回到該日的 1200 視圖 |

### Section 3：Routine / 計時器

| 編號 | 名稱 | 主要 UI 元素 | 互動行為 |
|------|------|-------------|---------|
| 1300 | Routine 主頁 | 頁面標題「Routine」、DateBar、AM/PM 提示、中央大圓（Block 名 + 總時間 + step 數 + Play 按鈕）、回顧/Routine 選擇按鈕、今日已完成卡片、TabBar | 點 Play 啟動計時（→1301）；點「Routine 選擇」→1310；點「回顧」→1320 |
| 1301 | 計時進行 | Step 進度條（11 段）、當前 step 名、大字倒數計時、最後 5 秒紅色提示、下一 step 預告、底部「跳過/完成」按鈕 | 倒數歸零→提示音→等待打勾；「完成」加積分跳下一步；「跳過」不加積分跳下一步；全部完成→1302 |
| 1302 | 完成摘要 | HeaderBar、完成百分比（大字）、step 統計、紅蘿蔔獎勵膠囊、跳過 step 列表（帶重做按鈕）、鼓勵語、「確認 · 收下」底部按鈕 | 「確認」回 1300 |
| 1310 | Block 列表 | HeaderBar「Routine 選擇」、BlockCard（色條 + 名稱 + 時間 + step 數 + PillBar）、浮動「新增 Block」、TabBar | 點卡片→131A 編輯 |
| 131A | Block 編輯 | HeaderBar（存檔）、FormRow 表單（名稱、block-rise 時間、block-set 時間）、立即開始卡片（Play）、「編輯 Step 列表」入口、提示音選擇 | 存檔回 1310；點「編輯 Step」→1311；點 Play→1301 |
| 1311 | Step 列表 | HeaderBar（完成）、欄位標頭（名稱/時間/pre-buffer）、StepRow 列表、浮動「新增 Step」 | 點 row→131B 編輯 |
| 131B | Step 編輯 | HeaderBar（存檔）、FormRow（名稱、花費秒數 NumberStepper、pre-buffer NumberStepper、備註）、預覽區塊 | 存檔回 1311 |
| 1320 | Routine 回顧 | HeaderBar「Routine 回顧」、DateStackRow 日期堆疊列表、TabBar | 點某天查看該日 Routine 紀錄 |

### Section 4：學習 / Skill / Quest

| 編號 | 名稱 | 主要 UI 元素 | 互動行為 |
|------|------|-------------|---------|
| 1400 | 學習主頁 | 頁面標題「學習」、DateBar、今日認領 QuestPreviewCard（技能+進度 PillBar）、「認領今日 Quest」按鈕、技能列表/回顧按鈕、本週技能熱度（7 天小方塊）、TabBar | 點「認領」→1401；「技能列表」→1410；「回顧」→1420 |
| 1401 | 認領列表 | HeaderBar「認領 Quest」（確認按鈕帶數量）、小蘿推薦區、全部 Quest 區、QuestPick（checkbox + 技能 + 名稱 + 目標量）、底部「確認認領」按鈕 | 勾選/取消勾選；確認回 1400 |
| 1410 | 技能列表 | HeaderBar「技能列表」、SkillCard（名稱 + 分類標籤 + 進度% + PillBar + quest 數）、浮動「新增技能」、TabBar | 點卡片→141A |
| 141A | Skill 明細 | HeaderBar（存檔）、技能名稱/分類/目標 FormRow、整體進度卡片、Quest 列表（checkbox = 認領）、浮動「新增 Quest」 | 存檔回 1410 |
| 141B | Quest 編輯 | HeaderBar（存檔）、FormRow（名稱、單位、總量、排序方式 Toggle、頻率、紅蘿蔔獎勵 NumberStepper） | 存檔回 141A |
| 1420 | 學習回顧 | HeaderBar「學習回顧」、DateStackRow 日期堆疊列表、TabBar | 點某天查看該日學習紀錄 |

### Section 5：設定 / 商店

| 編號 | 名稱 | 主要 UI 元素 | 互動行為 |
|------|------|-------------|---------|
| 1500 | 設定 | HeaderBar「設定」、提示群組（通知 ToggleSwitch、提示音）、提示音場景群組（四條音量滑桿 slider）、個人化群組（資料備份、小蘿自訂、關於） | ToggleSwitch 開關；slider 拖動調音量 |
| 1600 | 商店 | HeaderBar「商店」、紅蘿蔔餘額、抽獎區（2x2 GachaTile：散步/探索/遠征/史詩四級）、貨架區（2 欄 ShelfCard 帶兌換按鈕）、底部鼓勵語 | 點 GachaTile 扣紅蘿蔔抽獎；點 ShelfCard 兌換按鈕直接兌換 |

---

## 二、Design Tokens 清單

### 色票

| Token | 值 | 用途 |
|-------|-----|------|
| `--mint` | `#A8D8BE` | 主色 · 薄荷鼠尾草 |
| `--violet` | `#9B7DB8` | 強調色 · 霧紫 |
| `--bg` | `#FAF8F3` | 背景 · 象牙暖白 |
| `--card` | `#F0ECE2` | 卡片 · 奶油亞麻 |
| `--ink` | `#3A3F47` | 主文字 · 墨炭 |
| `--wine` | `#7B3B4C` | 暗強調 · 酒紅（急迫/刪除） |
| `--gray` | `#B0ADA6` | 次要文字 · 溫灰 |
| `--green` | `#81C9A3` | 成功 · 柔綠 |
| `--carrot` | `#F4845F` | 紅蘿蔔色 |
| `--navy` | `#1B3A5C` | 海軍藍（倒數字色） |
| `--hairline` | `#E8E4DE` | 分隔線 |
| `--ink-65` | `rgba(58,63,71,0.65)` | 次文字 65% |
| `--ink-45` | `rgba(58,63,71,0.45)` | 次文字 45% |

### 熱力圖色相（9 色 x 5 階）

| 色相名 | 飽和色（100%） | 空白色 |
|--------|---------------|--------|
| mint | `#4DC49A` | `#F2F0ED` |
| lavender | `#7E57C2` | `#F2F0ED` |
| coral | `#E57373` | `#F2F0ED` |
| sky | `#4FC3F7` | `#F2F0ED` |
| sun | `#FFD54F` | `#F2F0ED` |
| peach | `#FFB74D` | `#F2F0ED` |
| rose | `#F06292` | `#F2F0ED` |
| sage | `#81C784` | `#F2F0ED` |
| navy | `#1B3A5C` | `#F2F0ED` |

### 字型

| 場景 | font-family |
|------|-------------|
| 主體 | `-apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", system-ui, sans-serif` |
| 等寬（ASCII 兔子） | `"SF Mono", ui-monospace, "Menlo", "Cascadia Mono", monospace` |
| 數字（計時/積分） | `font-variant-numeric: tabular-nums` |

### 尺寸 / 間距

| Token | 值 | 用途 |
|-------|-----|------|
| 基礎字級 | `15px` | `.lori` 根元素 |
| 行高 | `1.45` | `.lori` 根元素 |
| 字距 | `0.01em` | `.lori` 根元素 |
| 按鈕高度 | `48px` | `.lori-btn` |
| 按鈕內距 | `0 20px` | `.lori-btn` |
| 輸入欄高度 | `48px` | `.lori-input` |
| 輸入欄內距 | `0 14px` | `.lori-input` |
| TabBar 高度 | `84px`（含 30px bottom safe area） | 底部導航 |
| 狀態列高度 | `54px` | StatusBar |
| HeaderBar 高度 | `52px` | 頁面標題列 |

### 圓角

| 元素 | 圓角 |
|------|------|
| 卡片 `.lori-card` | `12px` |
| 按鈕 `.lori-btn` | `12px` |
| 輸入欄 `.lori-input` | `12px` |
| Checkbox 圓形 | `999px`（圓形） |
| 熱力圖格子 | `3px` |
| DateBar | `12px` |
| 月曆日期格 | `8px` |

---

## 三、現有 vs 設計差異分析

### 目前已實作的功能（`app.js` — vanilla JS）

| 功能 | 狀態 | 備註 |
|------|------|------|
| IndexedDB 初始化 | 已有 | `todos`、`records`、`stats` 三個 store |
| Tab 切換（4 tab） | 已有 | emoji icon，非 SVG |
| 儀表板（積分 + 圓環 + 熱力圖） | 骨架 | 圓環用 SVG 手刻；熱力圖只有 28 格空格；無月曆 |
| 一般 TODO CRUD | 基本可用 | prompt() 新增；列表渲染；打勾加積分+鼓勵語 |
| Routine 計時器 | 基本可用 | 倒數、開始/暫停/完成/跳過/結束；硬編碼晨間/晚間 |
| 學習 TODO | 骨架 | 與一般 TODO 同結構，無進度機制 |
| 紅蘿蔔積分 | 已有 | 累加邏輯正常 |
| 鼓勵語 Toast | 已有 | 從 `encouragements.json` 隨機抽取 |
| PWA manifest + SW 註冊 | 已有 | `index.html` 有 manifest/sw 引用 |

### 設計稿新增 / 大幅修改的功能

| 功能 | 差異程度 | 說明 |
|------|---------|------|
| **封面頁（1000）** | 全新 | ASCII 兔子 + 暗色啟動畫面，現有無 |
| **儀表板重構（1100）** | 大改 | 新增月曆（MiniCalendar）、16 週熱力圖（9 色 x 5 階）、圓環升級（RingProgress SVG）、右上齒輪/商店入口 |
| **進度明細頁（1110）** | 全新 | 三分類拆解完成度 |
| **TODO 日期導航（DateBar）** | 全新 | 左右切換日期、完成度百分比、列表入口 |
| **TODO 歷史列表（1210）** | 全新 | DateStackRow 堆疊視圖 |
| **Swipe-to-delete** | 全新 | TODO 項目左滑刪除 |
| **急迫度標記** | 全新 | `!!` `!` 標記 |
| **Routine 重構** | 大改 | Block 概念（多組 Routine）、block-rise/block-set 時間窗、pre-buffer、Step 精細編輯 |
| **計時進行頁（1301）** | 大改 | 全螢幕大字倒數、step 進度條、最後 5 秒視覺提示、下一 step 預告 |
| **完成摘要頁（1302）** | 全新 | 跳過 step 回顧 + 重做按鈕 |
| **學習系統重構** | 大改 | Skill → Quest 兩層結構、認領機制、技能分類與目標、有序/無序排列、頻率設定 |
| **商店重構（1600）** | 大改 | 從數位獎勵改為「微冒險」抽獎 + 貨架，4 級 Gacha |
| **設定頁（1500）** | 全新 | 通知開關、提示音場景滑桿、資料備份、小蘿自訂 |
| **全局 UI 升級** | 大改 | SVG icon 全換、所有色票/間距/圓角對齊 design token、StatusBar、TabBar 重刻 |

### 資料模型差異

現有 IndexedDB schema 需要大幅擴充：

| 新增 Store | 用途 |
|-----------|------|
| `blocks` | Routine Block 定義（名稱、rise 時間、set 時間、提示音） |
| `steps` | Block 內的 Step（名稱、秒數、pre-buffer、備註、排序） |
| `skills` | 學習技能（名稱、分類、目標值、進度） |
| `quests` | Quest 定義（技能 ID、名稱、單位、總量、頻率、排序、紅蘿蔔獎勵） |
| `claims` | 每日 Quest 認領紀錄 |
| `shop_history` | 商店兌換/抽獎紀錄 |
| `settings` | 通知/提示音/備份等設定 |

---

## 四、實作任務清單

### Phase 0：基礎建設（優先級：最高）

| # | 任務 | 影響檔案 | 工作量 |
|---|------|---------|--------|
| 0-1 | **技術決策落地**：選定架構（見第五節），建立專案骨架 | 全部 | 2-4 hr |
| 0-2 | **Design tokens 遷移**：將 `lori.css` 的 `:root` 變數全部搬入 `style.css`，統一色票命名 | `style.css` | 0.5 hr |
| 0-3 | **SVG Icon 系統**：將 `lori-components.jsx` 的 `Ico` 物件轉為 vanilla JS 函式或 SVG sprite | 新增 `icons.js` 或 inline | 1 hr |
| 0-4 | **IndexedDB schema 升級**：新增 `blocks`、`steps`、`skills`、`quests`、`claims`、`shop_history`、`settings` store，DB_VERSION 升至 2+ | `app.js` 或新 `db.js` | 1.5 hr |

### Phase 1：全局 UI 骨架（優先級：高）

| # | 任務 | 影響檔案 | 工作量 |
|---|------|---------|--------|
| 1-1 | **StatusBar 元件**（時間 + 訊號 + 電池 SVG） | `components/status-bar.js`, `style.css` | 0.5 hr |
| 1-2 | **TabBar 重刻**（SVG icon、active 狀態、blur 背景、safe area） | `components/tab-bar.js`, `style.css` | 1 hr |
| 1-3 | **HeaderBar 元件**（返回箭頭、標題、右側按鈕） | `components/header-bar.js`, `style.css` | 0.5 hr |
| 1-4 | **DateBar 元件**（日期切換 + 進度填色 + 列表按鈕） | `components/date-bar.js`, `style.css` | 1 hr |
| 1-5 | **通用卡片 / 按鈕 / 輸入欄**：依 design token 重寫 CSS | `style.css` | 1 hr |
| 1-6 | **路由系統**：實作簡易 hash router 或 state machine 支援 21 個畫面切換 | `router.js` | 2 hr |
| 1-7 | **封面頁（1000）** | `screens/cover.js`, `style.css` | 0.5 hr |

### Phase 2：儀表板（優先級：高）

| # | 任務 | 影響檔案 | 工作量 |
|---|------|---------|--------|
| 2-1 | **RingProgress 元件**（SVG 圓環 + 中央 label） | `components/ring-progress.js` | 1 hr |
| 2-2 | **PillBar 元件**（膠囊進度條） | `components/pill-bar.js` | 0.5 hr |
| 2-3 | **Heatmap 元件**（16x7 格 + 9 色 x 5 階 + pseudo 隨機） | `components/heatmap.js` | 1.5 hr |
| 2-4 | **MiniCalendar 元件**（月曆 + 熱力圖上色 + 今日高亮） | `components/mini-calendar.js` | 2 hr |
| 2-5 | **儀表板頁面組裝（1100）** | `screens/dashboard.js` | 1 hr |
| 2-6 | **進度明細頁（1110）**：三條進度 BAR 樣式統一為 DateBar 同款（全寬簡潔色塊填充代表進度%，不用膠囊型 PillBar）。各自可點擊導航——一般→`#/todo/:date`（1200）、Routine→`#/routine/:date`（1300）、學習→`#/learning/:date`（1400） | `screens/progress-detail.js` | 1.5 hr |

### Phase 3：一般 TODO（優先級：高）

| # | 任務 | 影響檔案 | 工作量 |
|---|------|---------|--------|
| 3-1 | **CheckCircle 元件** | `components/check-circle.js` | 0.5 hr |
| 3-2 | **TodoRow 元件**（checkbox + 名稱 + 急迫標 + 紅蘿蔔 + swipe 刪除） | `components/todo-row.js` | 2 hr |
| 3-3 | **Swipe-to-delete 手勢** | `utils/swipe.js` | 1.5 hr |
| 3-4 | **AddBar 浮動按鈕** | `components/add-bar.js` | 0.5 hr |
| 3-5 | **TODO 當日頁（1200）** + 新增/編輯表單 | `screens/todo-today.js` | 2 hr |
| 3-6 | **DateStackRow 元件** | `components/date-stack-row.js` | 1 hr |
| 3-7 | **TODO 歷史頁（1210）** | `screens/todo-history.js` | 1 hr |

### Phase 4：Routine 計時器（優先級：中高）

| # | 任務 | 影響檔案 | 工作量 |
|---|------|---------|--------|
| 4-1 | **BlockCard 元件** | `components/block-card.js` | 1 hr |
| 4-2 | **StepRow 元件** | `components/step-row.js` | 0.5 hr |
| 4-3 | **FormRow / TimePicker / NumberStepper 元件** | `components/form-elements.js` | 1.5 hr |
| 4-4 | **Routine 主頁（1300）**（大圓 + AM/PM 自動判斷 + 今日已完成） | `screens/routine-home.js` | 2 hr |
| 4-5 | **計時進行頁（1301）**（全螢幕倒數 + step 進度條 + 最後 5 秒視覺 + 音效） | `screens/routine-timer.js` | 3 hr |
| 4-6 | **完成摘要頁（1302）** | `screens/routine-summary.js` | 1.5 hr |
| 4-7 | **Block 列表（1310）** + **Block 編輯（131A）** | `screens/block-list.js`, `screens/block-edit.js` | 2 hr |
| 4-8 | **Step 列表（1311）** + **Step 編輯（131B）** | `screens/step-list.js`, `screens/step-edit.js` | 2 hr |
| 4-9 | **Routine 回顧（1320）** | `screens/routine-history.js` | 1 hr |

### Phase 5：學習系統（優先級：中）

| # | 任務 | 影響檔案 | 工作量 |
|---|------|---------|--------|
| 5-1 | **QuestPreviewCard 元件** | `components/quest-preview-card.js` | 1 hr |
| 5-2 | **QuestPick 元件**（認領 checkbox） | `components/quest-pick.js` | 0.5 hr |
| 5-3 | **SkillCard 元件** | `components/skill-card.js` | 1 hr |
| 5-4 | **Toggle 元件** | `components/toggle.js` | 0.5 hr |
| 5-5 | **學習主頁（1400）** + 本週技能熱度 | `screens/learning-home.js` | 2 hr |
| 5-6 | **認領列表（1401）** | `screens/quest-claim.js` | 1.5 hr |
| 5-7 | **技能列表（1410）** + **Skill 明細（141A）** | `screens/skill-list.js`, `screens/skill-detail.js` | 2 hr |
| 5-8 | **Quest 編輯（141B）** | `screens/quest-edit.js` | 1 hr |
| 5-9 | **學習回顧（1420）** | `screens/learning-history.js` | 1 hr |

### Phase 6：設定 / 商店（優先級：中低）

| # | 任務 | 影響檔案 | 工作量 |
|---|------|---------|--------|
| 6-1 | **SettingRow / ToggleSwitch / Slider 元件** | `components/setting-elements.js` | 1 hr |
| 6-2 | **設定頁（1500）** | `screens/settings.js` | 1.5 hr |
| 6-3 | **GachaTile / ShelfCard 元件** | `components/shop-elements.js` | 1 hr |
| 6-4 | **商店頁（1600）**（抽獎邏輯 + 兌換扣款） | `screens/shop.js` | 2 hr |

### Phase 7：收尾（優先級：低）

| # | 任務 | 影響檔案 | 工作量 |
|---|------|---------|--------|
| 7-1 | **鼓勵語系統**升級（分類對應場景、連續打卡特殊語） | `utils/encouragement.js` | 1 hr |
| 7-2 | **通知推播**（Service Worker + Notification API + 設定聯動） | `sw.js`, `utils/notification.js` | 3 hr |
| 7-3 | **提示音系統**（Web Audio API + 場景音量 slider 聯動） | `utils/audio.js` | 2 hr |
| 7-4 | **資料備份**（JSON 匯出 + 備份時間戳） | `utils/backup.js` | 1 hr |
| 7-5 | **小蘿自訂**（ASCII 表情池、暱稱、鼓勵語頻率） | `screens/lori-customize.js` | 1 hr |
| 7-6 | **PWA 最佳化**（offline cache 策略、icon 更新、splash screen） | `sw.js`, `manifest.json` | 1.5 hr |

### 總工作量估算

| Phase | 預估時數 |
|-------|---------|
| Phase 0：基礎建設 | 5 hr |
| Phase 1：全局 UI 骨架 | 6.5 hr |
| Phase 2：儀表板 | 7 hr |
| Phase 3：一般 TODO | 8.5 hr |
| Phase 4：Routine | 13 hr |
| Phase 5：學習系統 | 10.5 hr |
| Phase 6：設定/商店 | 5.5 hr |
| Phase 7：收尾 | 9.5 hr |
| **合計** | **約 65.5 hr** |

---

## 五、技術決策建議

### 核心問題：設計稿是 React JSX，現有程式碼是 vanilla JS

設計稿使用 React JSX 是因為 Claude Design 工具的產出格式，不代表實際 App 必須用 React。以下三個方案：

### 方案 A：維持 vanilla JS（推薦）

**理由**：
- 現有 `app.js` 已經跑起來了，IndexedDB / 鼓勵語 / PWA 基礎設施都在
- 小蘿日誌是 PWA（Safari + 主畫面），不需要 React 的 Virtual DOM 效能優勢
- 畫面總量 21 頁，規模不大，vanilla JS 完全能管
- 省去 build toolchain（Webpack/Vite），直接瀏覽器跑，部署簡單
- 知晞不常用 npm/Node，維護成本低

**做法**：
1. 設計稿的 JSX 元件逐一翻譯為 vanilla JS 函式（回傳 DOM 或 HTML string）
2. 提取共用元件到 `components/` 目錄，用 ES module 組織
3. 用 hash router（`#/dashboard`、`#/todo`、`#/routine/1301`）管理 21 個畫面
4. CSS 從 `lori.css` 的 design token 搬到 `style.css`，class 命名沿用 `lori-` 前綴

**風險**：手動 DOM 操作容易出 bug，列表更新效能需注意（但資料量小，影響不大）

### 方案 B：遷移到 Preact（折衷）

**理由**：
- Preact 3KB，不需 build tool（可用 CDN + HTM tagged template）
- JSX 元件幾乎原封搬過來
- 仍然是 PWA，不需要 Node 環境開發

**做法**：
1. `index.html` 引入 Preact + HTM CDN
2. 設計稿 JSX 幾乎原樣使用，只需 `React.` 改 `preact.`
3. 現有 IndexedDB 邏輯不用改

**風險**：引入了一個依賴（雖然很小）

### 方案 C：遷移到 React + Vite

**不推薦的理由**：
- 需要 Node.js 環境、npm、build 流程
- 知晞不常用這些工具，維護門檻高
- 對一個個人用 PWA 來說 overengineering

### 最終建議：**方案 A（vanilla JS）**

搭配以下策略降低風險：
- 用 `document.createElement` + 工廠函式而非 innerHTML string（較好的可維護性）
- 每個畫面一個 JS 模組，每個共用元件一個 JS 模組
- 善用 CSS custom properties（design token），減少 JS 內 inline style
- 設計稿的 inline style 盡量轉為 CSS class

---

## 附錄：共用元件清單

從設計稿提取的共用元件，共 **27 個**：

| 元件 | 來源 | 使用頻率 |
|------|------|---------|
| `StatusBar` | lori-components | 每頁 |
| `Home`（home indicator） | lori-components | 每頁 |
| `Phone`（裝置外殼） | lori-components | 僅 mockup 用，實機不需要 |
| `TabBar` | lori-components | 主要頁面 |
| `DateBar` | lori-components | TODO / Routine / 學習 |
| `CheckCircle` | lori-components | TODO / Quest |
| `AddBar` | lori-components | 多個列表頁 |
| `HeaderBar` | lori-components | 子頁面 |
| `Body`（滾動容器） | lori-components | 每頁 |
| `RingProgress` | lori-components | 儀表板 |
| `PillBar` | lori-components | 進度明細 / Block / Skill |
| `Ico.*`（16 個 SVG icon） | lori-components | 全局 |
| `TodoRow` | screens-a | TODO 頁 |
| `DateStackRow` | screens-a | 歷史頁 x3 |
| `Heatmap` | screens-a | 儀表板 |
| `MiniCalendar` | screens-a | 儀表板 |
| `BlockCard` | screens-b | Block 列表 |
| `StepRow` | screens-b | Step 列表 |
| `FormRow` | screens-b | 所有編輯頁 |
| `TimePicker` | screens-b | Block 編輯 |
| `NumberStepper` | screens-b | Step / Quest 編輯 |
| `QuestPreviewCard` | screens-c | 學習主頁 |
| `QuestPick` | screens-c | 認領列表 |
| `SkillCard` | screens-c | 技能列表 |
| `Toggle` | screens-c | Quest 編輯 |
| `SettingRow` / `ToggleSwitch` | screens-d | 設定頁 |
| `GachaTile` / `ShelfCard` | screens-d | 商店頁 |

---

*計畫完成。下一步：知晞確認技術方案後，從 Phase 0 開始執行。*
