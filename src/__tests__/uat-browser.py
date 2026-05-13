"""
小蘿日誌 — 瀏覽器 UAT（用 Playwright）
測試：封面頁渲染、路由切換、元件顯示
"""
import sys
import os
import time

# 修正 Windows cp950 編碼問題
os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

BASE = "http://localhost:8004"
RESULTS = []

def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    RESULTS.append((status, name))
    print(f"  {status}: {name}" + (f" ({detail})" if detail else ""))

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 430, "height": 932})

        # ===== 1. 封面頁 =====
        print("\n--- 封面頁（#/cover）---")
        page.goto(f"{BASE}/#/cover")
        page.wait_for_timeout(1000)

        # 背景色
        bg = page.evaluate("() => getComputedStyle(document.getElementById('app')).background")
        check("封面背景為深色", "63, 71" in bg or "3A3F47" in bg.upper() or "rgb(58" in bg, bg)

        # ASCII 兔子
        ascii_el = page.query_selector(".ascii")
        check("ASCII 兔子存在", ascii_el is not None)
        if ascii_el:
            text = ascii_el.text_content()
            check("兔子包含表情字元", "ω" in text or "×" in text, text[:30])

        # 標題
        title = page.query_selector(".cover__title")
        check("標題存在", title is not None)
        if title:
            check("標題包含小蘿日誌", "小蘿日誌" in title.text_content())

        # START 按鈕
        start_btn = page.query_selector(".cover__start")
        check("START 按鈕存在", start_btn is not None)
        if start_btn:
            check("按鈕文字為 START", start_btn.text_content().strip() == "START")

        # 狀態列
        status_bar = page.query_selector(".status-bar")
        check("狀態列存在", status_bar is not None)

        # Dynamic Island
        island = page.query_selector(".status-bar__island")
        check("Dynamic Island 存在", island is not None)

        # 時間
        time_el = page.query_selector(".status-bar__time")
        check("時間顯示存在", time_el is not None)
        if time_el:
            check("時間格式正確（含 :）", ":" in time_el.text_content())

        # ===== 2. 路由切換：START → 儀表板 =====
        print("\n--- 路由切換 ---")
        if start_btn:
            start_btn.click()
            page.wait_for_timeout(500)
            current_hash = page.evaluate("() => location.hash")
            check("點 START 後 hash 為 #/dashboard", current_hash == "#/dashboard", current_hash)

        # Tab Bar
        tab_bar = page.query_selector(".tab-bar")
        check("儀表板頁有 TabBar", tab_bar is not None)

        tab_items = page.query_selector_all(".tab-bar__item")
        check("TabBar 有 4 個 tab", len(tab_items) == 4, str(len(tab_items)))

        # ===== 3. Tab 切換 =====
        print("\n--- Tab 切換 ---")
        # 每次切換後 DOM 重建，需要重新查詢元素
        # 點「一般」tab
        tabs = page.query_selector_all(".tab-bar__item")
        if len(tabs) >= 2:
            tabs[1].click()
            page.wait_for_timeout(500)
            current_hash = page.evaluate("() => location.hash")
            check("點一般 tab 後 hash 為 #/todo", current_hash == "#/todo", current_hash)

        # 點「Routine」tab（重新查詢）
        tabs = page.query_selector_all(".tab-bar__item")
        if len(tabs) >= 3:
            tabs[2].click()
            page.wait_for_timeout(500)
            current_hash = page.evaluate("() => location.hash")
            check("點 Routine tab 後 hash 為 #/routine", current_hash == "#/routine", current_hash)

        # 點「學習」tab（重新查詢）
        tabs = page.query_selector_all(".tab-bar__item")
        if len(tabs) >= 4:
            tabs[3].click()
            page.wait_for_timeout(500)
            current_hash = page.evaluate("() => location.hash")
            check("點學習 tab 後 hash 為 #/learning", current_hash == "#/learning", current_hash)

        # 點回「儀表板」tab（重新查詢）
        tabs = page.query_selector_all(".tab-bar__item")
        if len(tabs) >= 1:
            tabs[0].click()
            page.wait_for_timeout(500)
            current_hash = page.evaluate("() => location.hash")
            check("點儀表板 tab 回到 #/dashboard", current_hash == "#/dashboard", current_hash)

        # ===== 4. Design token 驗證 =====
        print("\n--- Design Token 驗證 ---")
        mint = page.evaluate("() => getComputedStyle(document.documentElement).getPropertyValue('--mint').trim()")
        check("--mint 為 #A8D8BE", mint == "#A8D8BE", mint)

        violet = page.evaluate("() => getComputedStyle(document.documentElement).getPropertyValue('--violet').trim()")
        check("--violet 為 #9B7DB8", violet == "#9B7DB8", violet)

        carrot = page.evaluate("() => getComputedStyle(document.documentElement).getPropertyValue('--carrot').trim()")
        check("--carrot 為 #F4845F", carrot == "#F4845F", carrot)

        navy = page.evaluate("() => getComputedStyle(document.documentElement).getPropertyValue('--navy').trim()")
        check("--navy 為 #1B3A5C", navy == "#1B3A5C", navy)

        # ===== 5. 直接導航測試 =====
        print("\n--- 直接 hash 導航 ---")
        page.goto(f"{BASE}/#/settings")
        page.wait_for_timeout(500)
        # 設定頁應有 HeaderBar 帶返回
        header = page.query_selector(".header-bar")
        check("設定頁有 HeaderBar", header is not None)
        back_btn = page.query_selector(".header-bar__back")
        check("設定頁有返回按鈕", back_btn is not None)

        # ===== 6. IndexedDB 初始化 =====
        print("\n--- IndexedDB ---")
        db_check = page.evaluate("""() => new Promise((resolve) => {
            const req = indexedDB.open('lori_diary_db');
            req.onsuccess = () => {
                const db = req.result;
                const names = Array.from(db.objectStoreNames);
                db.close();
                resolve(names);
            };
            req.onerror = () => resolve([]);
        })""")
        check("IndexedDB 已建立", len(db_check) > 0, str(db_check))
        expected_stores = ['todos', 'records', 'stats', 'blocks', 'steps', 'skills', 'quests', 'claims', 'shop_history', 'settings']
        for store in expected_stores:
            check(f"  store '{store}' 存在", store in db_check)

        # 檢查預設 Block 資料
        block_count = page.evaluate("""() => new Promise((resolve) => {
            const req = indexedDB.open('lori_diary_db');
            req.onsuccess = () => {
                const db = req.result;
                const tx = db.transaction('blocks', 'readonly');
                const countReq = tx.objectStore('blocks').count();
                countReq.onsuccess = () => { db.close(); resolve(countReq.result); };
                countReq.onerror = () => { db.close(); resolve(-1); };
            };
        })""")
        check("預設 Block 有 2 筆", block_count == 2, str(block_count))

        step_count = page.evaluate("""() => new Promise((resolve) => {
            const req = indexedDB.open('lori_diary_db');
            req.onsuccess = () => {
                const db = req.result;
                const tx = db.transaction('steps', 'readonly');
                const countReq = tx.objectStore('steps').count();
                countReq.onsuccess = () => { db.close(); resolve(countReq.result); };
                countReq.onerror = () => { db.close(); resolve(-1); };
            };
        })""")
        check("預設 Step 有 17 筆", step_count == 17, str(step_count))

        browser.close()

    # 總結
    passed = sum(1 for s, _ in RESULTS if s == "PASS")
    failed = sum(1 for s, _ in RESULTS if s == "FAIL")
    print(f"\n=============================")
    print(f"UAT: {passed} passed, {failed} failed, {passed + failed} total")
    print(f"=============================")

    if failed > 0:
        print("\nFailed tests:")
        for s, name in RESULTS:
            if s == "FAIL":
                print(f"  - {name}")
        sys.exit(1)

if __name__ == "__main__":
    run()
