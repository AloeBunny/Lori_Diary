# Pace PWA — 開發狀態

**最後更新**：2026-05-10 by 懷安

## 測試方式

```bash
cd Projects/1D_routine_app/src/
python serve.py
# 瀏覽器開 http://localhost:8001
```

iPhone 測試：同 Wi-Fi → Safari 開 `http://<電腦IP>:8000` → 分享 → 加到主畫面

## 已完成

### 基礎架構
- [x] PWA manifest + service worker（離線支援）
- [x] IndexedDB 資料庫（todos / records / stats）
- [x] 色票對齊 SPEC（薄荷鼠尾草 + 霧紫 + 象牙暖白 + 海軍藍）
- [x] 底部 Tab Bar（4 tab）

### 儀表板
- [x] 紅蘿蔔計數
- [x] 今日進度圓環（即時計算）
- [x] 熱力圖佔位（28 格）

### 一般 TODO
- [x] 新增 / 打勾
- [x] 列表渲染
- [x] 打勾得 🥕1 + 鼓勵語 toast

### Routine TODO
- [x] 晨間 / 晚間兩組（對齊知晞真實作息）
- [x] 倒數計時器
- [x] 完成 ✓ / 跳過 → / 結束本輪
- [x] 步驟列表（當前步驟高亮）
- [x] 完成得 🥕2 + 鼓勵語

### 學習 TODO
- [x] 新增 / 打勾
- [x] 打勾得 🥕3 + 鼓勵語

### 資料檔
- [x] encouragements.json（5 分類 + 連續獎勵）
- [x] adventures.json（4 級 48 任務 + reroll 機制）

## 待做

- [ ] Settings 頁面（齒輪圖示）
- [ ] 懷安商店（日常區 + 微冒險池）
- [ ] 熱力圖真實資料（每日完成度 → 色彩濃淡）
- [ ] 日曆視圖（儀表板下方）
- [ ] 匯出 JSON 備份
- [ ] 小蘿 icon（需要圖檔）
- [ ] 推播通知
- [ ] Routine 步驟自訂 CRUD
- [ ] 學習 TODO 進度條（有目標 / 無目標）
- [ ] 重複 TODO（每天 / 每週 / 每月）
