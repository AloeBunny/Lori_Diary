"""
小蘿日誌 — Phase 7 瀏覽器 UAT（Playwright）
測試：設定頁→小蘿自訂入口、自訂頁面、商店抽獎、封面→儀表板→全 tab 導航
"""
import sys
import os
import time

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
        print("\n--- 封面頁 ---")
        page.goto(f"{BASE}/#/cover")
        page.wait_for_timeout(1000)

        ascii_el = page.query_selector(".ascii")
        check("ASCII 兔子存在", ascii_el is not None)

        start_btn = page.query_selector(".cover__start")
        check("START 按鈕存在", start_btn is not None)

        # ===== 2. 封面 → 儀表板 =====
        print("\n--- 封面 → 儀表板 ---")
        if start_btn:
            start_btn.click()
            page.wait_for_timeout(500)
            h = page.evaluate("() => location.hash")
            check("START 導航至 #/dashboard", h == "#/dashboard", h)

        tab_bar = page.query_selector(".tab-bar")
        check("儀表板有 TabBar", tab_bar is not None)

        # ===== 3. 全 Tab 導航 =====
        print("\n--- Tab 導航 ---")
        # TODO tab
        tabs = page.query_selector_all(".tab-bar__item")
        if len(tabs) >= 2:
            tabs[1].click()
            page.wait_for_timeout(500)
            h = page.evaluate("() => location.hash")
            check("TODO tab → #/todo", h == "#/todo", h)

        # Routine tab
        tabs = page.query_selector_all(".tab-bar__item")
        if len(tabs) >= 3:
            tabs[2].click()
            page.wait_for_timeout(500)
            h = page.evaluate("() => location.hash")
            check("Routine tab → #/routine", h == "#/routine", h)

        # Learning tab
        tabs = page.query_selector_all(".tab-bar__item")
        if len(tabs) >= 4:
            tabs[3].click()
            page.wait_for_timeout(500)
            h = page.evaluate("() => location.hash")
            check("Learning tab → #/learning", h == "#/learning", h)

        # Back to dashboard
        tabs = page.query_selector_all(".tab-bar__item")
        if len(tabs) >= 1:
            tabs[0].click()
            page.wait_for_timeout(500)
            h = page.evaluate("() => location.hash")
            check("Dashboard tab → #/dashboard", h == "#/dashboard", h)

        # ===== 4. 設定頁 =====
        print("\n--- 設定頁 ---")
        page.goto(f"{BASE}/#/settings")
        page.wait_for_timeout(800)

        header = page.query_selector(".header-bar")
        check("設定頁有 HeaderBar", header is not None)

        # 找通知 ToggleSwitch
        toggle_switches = page.query_selector_all(".lori-toggle-switch")
        check("設定頁有 ToggleSwitch (>=1)", len(toggle_switches) >= 1, str(len(toggle_switches)))

        # 找音量 Slider
        sliders = page.query_selector_all(".lori-slider")
        check("設定頁有四條音量 Slider", len(sliders) == 4, str(len(sliders)))

        # 找「資料備份」和「小蘿自訂」SettingRow
        setting_rows = page.query_selector_all(".lori-setting-row")
        check("設定頁有 SettingRow (>=3)", len(setting_rows) >= 3, str(len(setting_rows)))

        # 查看各 SettingRow 的文字
        row_texts = []
        for row in setting_rows:
            name_el = row.query_selector(".lori-setting-row__name")
            if name_el:
                row_texts.append(name_el.text_content())

        check("有「通知」行", "通知" in row_texts, str(row_texts))
        check("有「提示音」行", "提示音" in row_texts, str(row_texts))
        check("有「資料備份」行", "資料備份" in row_texts, str(row_texts))
        check("有「小蘿自訂」行", "小蘿自訂" in row_texts, str(row_texts))

        # ===== 5. 設定頁 → 小蘿自訂 =====
        print("\n--- 小蘿自訂入口 ---")
        # 找到小蘿自訂的 row 並點擊
        lori_row = None
        for row in setting_rows:
            name_el = row.query_selector(".lori-setting-row__name")
            if name_el and "小蘿自訂" in name_el.text_content():
                lori_row = row
                break

        if lori_row:
            lori_row.click()
            page.wait_for_timeout(500)
            h = page.evaluate("() => location.hash")
            check("點小蘿自訂 → #/settings/lori", h == "#/settings/lori", h)
        else:
            check("點小蘿自訂 → #/settings/lori", False, "找不到小蘿自訂行")

        # ===== 6. 小蘿自訂頁面 =====
        print("\n--- 小蘿自訂頁面 ---")
        page.wait_for_timeout(300)

        # 表情池格子
        face_grid = page.query_selector(".lori-customize__face-grid")
        check("有表情池格子", face_grid is not None)

        face_cards = page.query_selector_all(".lori-customize__face-card")
        check("表情池卡片 >= 6 張 (1隨機 + 5表情)", len(face_cards) >= 6, str(len(face_cards)))

        # 隨機卡片
        random_card = page.query_selector(".lori-customize__face-random")
        check("有隨機選項", random_card is not None)

        # 暱稱輸入框
        nick_input = page.query_selector(".lori-customize__nick-input")
        check("有暱稱輸入框", nick_input is not None)

        # 頻率按鈕群
        freq_btns = page.query_selector_all(".lori-customize__freq-btn")
        check("有 3 個頻率按鈕", len(freq_btns) == 3, str(len(freq_btns)))

        # 點一個表情卡片
        if len(face_cards) >= 2:
            face_cards[1].click()
            page.wait_for_timeout(200)
            is_selected = "lori-customize__face-card--selected" in (face_cards[1].get_attribute("class") or "")
            check("點選表情卡片後加上 selected class", is_selected)

        # 點頻率按鈕
        if len(freq_btns) >= 2:
            freq_btns[1].click()
            page.wait_for_timeout(200)
            cls = freq_btns[1].get_attribute("class") or ""
            check("點頻率按鈕後加上 violet class", "lori-btn-violet" in cls)

        # HeaderBar 的儲存按鈕
        save_btn = page.query_selector(".header-bar__action")
        check("有儲存按鈕", save_btn is not None)

        # ===== 7. 商店頁 =====
        print("\n--- 商店頁 ---")
        page.goto(f"{BASE}/#/shop")
        page.wait_for_timeout(800)

        balance = page.query_selector(".lori-shop__balance-num")
        check("商店頁有餘額顯示", balance is not None)

        gacha_grid = page.query_selector(".lori-shop__gacha-grid")
        check("商店頁有抽獎格", gacha_grid is not None)

        gacha_tiles = page.query_selector_all(".lori-gacha-tile")
        check("有 4 個抽獎格", len(gacha_tiles) == 4, str(len(gacha_tiles)))

        shelf_grid = page.query_selector(".lori-shop__shelf-grid")
        check("商店頁有貨架區", shelf_grid is not None)

        shelf_cards = page.query_selector_all(".lori-shelf-card")
        check("貨架有商品卡 (>=1)", len(shelf_cards) >= 1, str(len(shelf_cards)))

        # ===== 8. Routine 主頁 =====
        print("\n--- Routine 主頁 ---")
        page.goto(f"{BASE}/#/routine")
        page.wait_for_timeout(800)

        play_btn = page.query_selector(".lori-routine-home__play-btn")
        check("Routine 主頁有播放按鈕", play_btn is not None)

        circle = page.query_selector(".lori-routine-home__circle")
        check("Routine 主頁有圓形區域", circle is not None)

        browser.close()

    # 總結
    passed = sum(1 for s, _ in RESULTS if s == "PASS")
    failed = sum(1 for s, _ in RESULTS if s == "FAIL")
    print(f"\n=============================")
    print(f"Phase 7 UAT: {passed} passed, {failed} failed, {passed + failed} total")
    print(f"=============================")

    if failed > 0:
        print("\nFailed tests:")
        for s, name in RESULTS:
            if s == "FAIL":
                print(f"  - {name}")
        sys.exit(1)

if __name__ == "__main__":
    run()
