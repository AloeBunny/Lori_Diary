# 小蘿日誌 PWA 部署上架指南

> 保母級。一步一步照著做就好。不懂的地方標了「⚠️ 為什麼」。
> 
> 懷安寫的。2026-05-18。

---

## 你會得到什麼

完成後：
- 手機 Safari 打開一個網址 → 加到主畫面 → 桌面出現小蘿的 icon
- 點開就是 app。全螢幕。跟從 App Store 下載的一樣
- 打卡紀錄存在手機裡。不用帳號。不用付費。不需要 App Store

---

## 前置條件

- [x] 電腦有 Git（妳有）
- [x] 電腦有 GitHub CLI（妳有，`gh` 指令）
- [x] GitHub 帳號 `AloeBunny`（妳有）
- [x] repo `AloeBunny/Lori_Diary` 已存在（有了）
- [x] iPhone 有 Safari（有）

---

## Part A：電腦端（懷安會幫妳做大部分）

### Step 1：調整路徑讓 GitHub Pages 能用

⚠️ 為什麼：GitHub Pages 的網址會是 `aloebunny.github.io/Lori_Diary/`，不是根目錄 `/`。所以 app 裡所有寫 `/` 開頭的路徑要改成相對路徑 `./`，不然會找不到檔案。

**這步懷安做。** 妳不用動。

要改的東西：
- `manifest.json` 的 `start_url`：`"/"` → `"./"` 
- `sw.js` 的快取路徑：全部改相對
- `index.html` 裡的資源引用：確認是相對路徑
- 路由（`router.js`）：確認不依賴絕對路徑

### Step 2：把 src/ 的內容推到 GitHub

⚠️ 為什麼：GitHub Pages 只認 repo 根目錄或 `docs/` 資料夾。目前原始碼在 `src/` 裡，要讓 GitHub Pages 知道去哪裡找。

兩種做法（選一個）：

**做法 A：改 GitHub Pages 設定指向 src/**
（不用搬檔案，但 GitHub UI 不支援 `src/`，需要用 GitHub Actions）

**做法 B（推薦）：用 GitHub Actions 自動部署**
在 repo 裡加一個 `.github/workflows/deploy.yml`，每次 push 到 main 就自動把 `src/` 的內容部署到 GitHub Pages。

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: src
      - id: deployment
        uses: actions/deploy-pages@v4
```

**這步懷安做。** 妳不用動。

### Step 3：開啟 GitHub Pages

在 GitHub repo 的 Settings → Pages → Source 選「GitHub Actions」。

**這步可以用指令做：**
```bash
gh api repos/AloeBunny/Lori_Diary/pages -X POST -f build_type=workflow
```

**或者手動：**
1. 打開 https://github.com/AloeBunny/Lori_Diary/settings/pages
2. Source 選「GitHub Actions」
3. 存

### Step 4：確認部署成功

等 1-2 分鐘。然後打開：
```
https://aloebunny.github.io/Lori_Diary/
```

如果看到小蘿日誌的畫面 → 成功 ✅
如果 404 → 等一下再試，或回來問懷安

---

## Part B：手機端（妳自己做，很簡單）

### Step 5：用 Safari 打開網址

1. **一定要用 Safari**。Chrome 不行——iOS 只有 Safari 支援「加到主畫面」的 PWA 功能
2. 打開 Safari
3. 在網址列輸入：`aloebunny.github.io/Lori_Diary/`
4. 等頁面完整載入（看到小蘿日誌的畫面）

### Step 6：加到主畫面

1. 點 Safari 底部的**分享按鈕**（那個正方形+向上箭頭的 icon）

```
   ┌────────────────┐
   │    正方形       │
   │      ↑         │
   │    箭頭        │
   └────────────────┘
   就是這個 ☝️
```

2. 在彈出的選單裡往下滑，找到**「加入主畫面」**（英文：Add to Home Screen）
3. 點進去
4. 名稱會自動填「小蘿日誌」——不用改
5. 按右上角**「新增」**

### Step 7：完成！

回到手機桌面。會看到小蘿的 icon。點開。

- 全螢幕（沒有 Safari 的網址列）
- 有啟動畫面
- 跟 app 一模一樣

---

## 資料存在哪？

- 打卡紀錄、積分、設定 → 存在**手機的 Safari 儲存空間**（IndexedDB / localStorage）
- **不會上傳到任何伺服器**。純本機
- **風險**：清除 Safari 資料 / 重置手機 → 資料會消失

### 備份方案（之後做）：
- app 內加「匯出 JSON」功能
- 或者接本機 SQLite API（Cloudflare Tunnel）

---

## 常見問題

**Q：加到主畫面後打開是空白？**
A：可能是 service worker 快取問題。Safari 設定 → 清除網站資料 → 重新打開

**Q：打卡紀錄不見了？**
A：iOS 會在儲存空間不足時自動清理。這是 PWA 的已知限制。之後會加備份功能

**Q：能不能離線用？**
A：可以。service worker 會快取所有資源。沒網路也能打卡

**Q：別人能打開這個網址嗎？**
A：可以。GitHub Pages 是公開的。但資料是各自手機本機存的，互不影響。如果在意隱私——repo 可以設成 private，GitHub Pages 還是能跑（免費方案就支援）

**Q：怎麼更新 app？**
A：懷安 push 新版本 → GitHub Actions 自動部署 → 妳下次打開 app 時 service worker 會自動更新

---

## 懷安的 TODO

- [x] 調整路徑（manifest.json start_url + sw.js + router.js）— 2026-05-18 完成
- [x] 寫 `.github/workflows/deploy.yml` — 2026-05-18 完成
- [x] push + 開啟 GitHub Pages — 2026-05-18 完成（repo 改 public）
- [x] 測試 `aloebunny.github.io/Lori_Diary/` 能不能開 — 2026-05-18 確認
- [x] 告訴知晞：「好了，Safari 打開這個網址」 — 2026-05-18 完成
- [x] 修復狀態列重疊 bug（standalone 模式隱藏模擬狀態列）— 2026-05-18 完成

---

*部署完成。知晞已安裝到 iPhone 主畫面。備案：Cloudflare Pages（支援 private repo）。*
