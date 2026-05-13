"""
小蘿日誌 — Phase 6 UAT（Playwright）
設定頁 + 商店頁完整測試
"""
import sys
import os

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

        # ===== 初始化：開啟 dashboard 讓 DB 完成初始化 =====
        page.goto(f"{BASE}/#/dashboard")
        page.wait_for_timeout(1500)

        # ===== 儀表板右上角導航 =====
        print("\n--- 儀表板導航按鈕 ---")
        gear_btn = page.query_selector('[aria-label="設定"]')
        check("⚙️ 設定按鈕存在", gear_btn is not None)

        shop_btn = page.query_selector('[aria-label="商店"]')
        check("🏪 商店按鈕存在", shop_btn is not None)

        # 點設定按鈕
        if gear_btn:
            gear_btn.click()
            page.wait_for_timeout(500)
            h = page.evaluate("() => location.hash")
            check("點設定按鈕 → #/settings", h == "#/settings", h)

        # 回 dashboard
        page.goto(f"{BASE}/#/dashboard")
        page.wait_for_timeout(500)

        # 點商店按鈕
        shop_btn = page.query_selector('[aria-label="商店"]')
        if shop_btn:
            shop_btn.click()
            page.wait_for_timeout(500)
            h = page.evaluate("() => location.hash")
            check("點商店按鈕 → #/shop", h == "#/shop", h)

        # ===== 設定頁 =====
        print("\n--- 設定頁（#/settings）---")
        page.goto(f"{BASE}/#/settings")
        page.wait_for_timeout(1000)

        # HeaderBar
        header = page.query_selector(".header-bar__title")
        check("設定頁標題為「設定」", header is not None and "設定" in header.text_content())

        # 群組標籤
        group_labels = page.query_selector_all(".lori-settings__group-label")
        label_texts = [el.text_content() for el in group_labels]
        check("有「提示」群組", "提示" in label_texts, str(label_texts))
        check("有「提示音 · 場景」群組", "提示音 · 場景" in label_texts, str(label_texts))
        check("有「個人化」群組", "個人化" in label_texts, str(label_texts))

        # ToggleSwitch
        toggles = page.query_selector_all(".lori-toggle-switch")
        check("有 2 個 ToggleSwitch", len(toggles) == 2, str(len(toggles)))

        # 通知開關
        if len(toggles) >= 1:
            notif_toggle = toggles[0]
            aria = notif_toggle.get_attribute("aria-checked")
            check("通知開關有 aria-checked", aria in ["true", "false"], aria)

            # 切換
            initial = aria
            notif_toggle.click()
            page.wait_for_timeout(300)
            after = notif_toggle.get_attribute("aria-checked")
            check("切換後 aria-checked 改變", after != initial, f"{initial} -> {after}")

            # 切回去
            notif_toggle.click()
            page.wait_for_timeout(300)

        # Slider
        sliders = page.query_selector_all(".lori-slider")
        check("有 4 個 Slider", len(sliders) == 4, str(len(sliders)))

        # 驗證 Slider 標籤
        slider_names = [s.query_selector(".lori-slider__name").text_content() for s in sliders if s.query_selector(".lori-slider__name")]
        check("Slider 含總音量", "總音量" in slider_names, str(slider_names))
        check("Slider 含 Routine 倒數", "Routine 倒數" in slider_names, str(slider_names))
        check("Slider 含完成打勾", "完成打勾" in slider_names, str(slider_names))
        check("Slider 含鼓勵語 Toast", "鼓勵語 Toast" in slider_names, str(slider_names))

        # Slider 初始值
        slider_values = [s.query_selector(".lori-slider__value").text_content() for s in sliders if s.query_selector(".lori-slider__value")]
        check("總音量預設 65", slider_values[0] == "65" if len(slider_values) > 0 else False, str(slider_values))

        # 設定群組分隔正確（最後一個 row 無底線）
        last_rows = page.query_selector_all(".lori-setting-row--last")
        check("有 --last 的 SettingRow", len(last_rows) >= 1, str(len(last_rows)))

        # 個人化群組 — chevron 箭頭
        chevs = page.query_selector_all(".lori-setting-row__chev")
        check("有 chevron 箭頭的行（資料備份/小蘿自訂/關於）", len(chevs) >= 2, str(len(chevs)))

        # Footer
        footer = page.query_selector(".lori-settings__footer")
        check("Footer 存在", footer is not None)
        if footer:
            check("Footer 含小蘿日誌", "小蘿日誌" in footer.text_content())

        # 設定頁 → 小蘿自訂
        print("\n--- 設定子路由 ---")
        page.goto(f"{BASE}/#/settings/lori")
        page.wait_for_timeout(500)
        h = page.evaluate("() => location.hash")
        check("可導航到 #/settings/lori", h == "#/settings/lori", h)

        lori_header = page.query_selector(".header-bar__title")
        check("小蘿自訂頁標題", lori_header is not None and "小蘿自訂" in lori_header.text_content())

        # ===== 商店頁 =====
        print("\n--- 商店頁（#/shop）---")

        # 先給 50 紅蘿蔔
        page.goto(f"{BASE}/#/dashboard")
        page.wait_for_timeout(500)
        page.evaluate("""() => new Promise((resolve) => {
            const req = indexedDB.open('lori_diary_db');
            req.onsuccess = () => {
                const db = req.result;
                const tx = db.transaction('stats', 'readwrite');
                tx.objectStore('stats').put({ key: 'carrots', value: 50 });
                tx.oncomplete = () => { db.close(); resolve(); };
            };
        })""")
        page.wait_for_timeout(300)

        page.goto(f"{BASE}/#/shop")
        page.wait_for_timeout(1500)

        # HeaderBar
        shop_header = page.query_selector(".header-bar__title")
        check("商店頁標題為「商店」", shop_header is not None and "商店" in shop_header.text_content())

        # 返回按鈕
        back_btn = page.query_selector(".header-bar__back")
        check("商店頁有返回按鈕", back_btn is not None)

        # 餘額顯示
        balance = page.query_selector(".lori-shop__balance-num")
        check("餘額數字存在", balance is not None)
        if balance:
            bal_text = balance.text_content()
            check("餘額顯示 50", bal_text == "50", bal_text)

        # 抽獎格
        gacha_tiles = page.query_selector_all(".lori-gacha-tile")
        check("有 4 個抽獎格", len(gacha_tiles) == 4, str(len(gacha_tiles)))

        # 抽獎格等級檢查
        if len(gacha_tiles) >= 4:
            levels = [t.get_attribute("data-level") for t in gacha_tiles]
            check("抽獎格等級 1-4", levels == ["1", "2", "3", "4"], str(levels))

        # 抽獎格名稱
        gacha_names = [t.query_selector(".lori-gacha-tile__name").text_content() for t in gacha_tiles if t.query_selector(".lori-gacha-tile__name")]
        check("抽獎格含散步級", "散步級" in gacha_names, str(gacha_names))
        check("抽獎格含探索級", "探索級" in gacha_names, str(gacha_names))
        check("抽獎格含遠征級", "遠征級" in gacha_names, str(gacha_names))
        check("抽獎格含史詩級", "史詩級" in gacha_names, str(gacha_names))

        # 抽獎格可用狀態（50 紅蘿蔔 → Lv1=7, Lv2=19 買得起，Lv3=58 Lv4=116 買不起）
        if len(gacha_tiles) >= 4:
            lv1_disabled = gacha_tiles[0].get_attribute("disabled")
            lv3_disabled = gacha_tiles[2].get_attribute("disabled")
            check("Lv1 (7🥕) 買得起 → 不 disabled", lv1_disabled is None or lv1_disabled == "false")
            check("Lv3 (58🥕) 買不起 → disabled", lv3_disabled is not None and lv3_disabled != "false", str(lv3_disabled))

        # 貨架區
        shelf_cards = page.query_selector_all(".lori-shelf-card")
        check("貨架有商品卡（至少 1 張）", len(shelf_cards) >= 1, str(len(shelf_cards)))

        # 兌換按鈕
        redeem_btns = page.query_selector_all(".lori-shelf-card__redeem")
        check("貨架商品卡有兌換按鈕", len(redeem_btns) >= 1, str(len(redeem_btns)))

        # 底部鼓勵語
        encourage = page.query_selector(".lori-shop__encourage")
        check("底部鼓勵語存在", encourage is not None)

        # ===== 抽獎流程 =====
        print("\n--- 抽獎流程 ---")
        # 重載入商店確保乾淨狀態
        page.goto(f"{BASE}/#/shop")
        page.wait_for_timeout(1500)

        gacha_tiles = page.query_selector_all(".lori-gacha-tile")
        if len(gacha_tiles) >= 1:
            # 點 Lv1 散步級抽獎
            gacha_tiles[0].click()
            page.wait_for_timeout(800)

            # 彈窗
            overlay = page.query_selector(".lori-shop-overlay")
            check("抽獎後出現結果彈窗", overlay is not None)

            sheet = page.query_selector(".lori-shop-sheet")
            check("結果 sheet 存在", sheet is not None)

            if sheet:
                title = sheet.query_selector(".lori-shop-sheet__title")
                check("彈窗標題含抽到了", title is not None and "抽到了" in title.text_content())

                result = sheet.query_selector(".lori-shop-sheet__result")
                check("有抽獎結果文字", result is not None and len(result.text_content()) > 0)

                cost_label = sheet.query_selector(".lori-shop-sheet__cost")
                check("有已扣紅蘿蔔文字", cost_label is not None and "已扣" in cost_label.text_content())

                level_label = sheet.query_selector(".lori-shop-sheet__level")
                check("有等級標籤", level_label is not None and "Lv.1" in level_label.text_content())

                # 重抽按鈕
                btns = sheet.query_selector_all(".lori-btn")
                check("有重抽和接受兩個按鈕", len(btns) >= 2, str(len(btns)))

                # 點「接受」
                accept_btn = None
                for btn in btns:
                    if "接受" in btn.text_content():
                        accept_btn = btn
                        break
                if accept_btn:
                    accept_btn.click()
                    page.wait_for_timeout(500)
                    overlay_after = page.query_selector(".lori-shop-overlay")
                    check("接受後彈窗關閉", overlay_after is None)

                    # 餘額減少
                    balance_after = page.query_selector(".lori-shop__balance-num")
                    if balance_after:
                        new_bal = int(balance_after.text_content())
                        check("餘額減少（< 50）", new_bal < 50, str(new_bal))

            # 驗證 shop_history 有記錄
            history_count = page.evaluate("""() => new Promise((resolve) => {
                const req = indexedDB.open('lori_diary_db');
                req.onsuccess = () => {
                    const db = req.result;
                    const tx = db.transaction('shop_history', 'readonly');
                    const countReq = tx.objectStore('shop_history').count();
                    countReq.onsuccess = () => { db.close(); resolve(countReq.result); };
                    countReq.onerror = () => { db.close(); resolve(-1); };
                };
            })""")
            check("shop_history 有記錄", history_count >= 1, str(history_count))

        # ===== 重抽流程 =====
        print("\n--- 重抽流程 ---")
        # 補充紅蘿蔔
        page.evaluate("""() => new Promise((resolve) => {
            const req = indexedDB.open('lori_diary_db');
            req.onsuccess = () => {
                const db = req.result;
                const tx = db.transaction('stats', 'readwrite');
                tx.objectStore('stats').put({ key: 'carrots', value: 100 });
                tx.oncomplete = () => { db.close(); resolve(); };
            };
        })""")
        page.goto(f"{BASE}/#/shop")
        page.wait_for_timeout(1500)

        gacha_tiles = page.query_selector_all(".lori-gacha-tile")
        if len(gacha_tiles) >= 1:
            gacha_tiles[0].click()
            page.wait_for_timeout(800)

            sheet = page.query_selector(".lori-shop-sheet")
            if sheet:
                btns = sheet.query_selector_all(".lori-btn")
                reroll_btn = None
                for btn in btns:
                    if "換一個" in btn.text_content():
                        reroll_btn = btn
                        break

                if reroll_btn:
                    reroll_btn.click()
                    page.wait_for_timeout(800)

                    # 重抽後應出現新的彈窗
                    new_sheet = page.query_selector(".lori-shop-sheet")
                    check("重抽後出現新結果彈窗", new_sheet is not None)

                    if new_sheet:
                        # 接受
                        new_btns = new_sheet.query_selector_all(".lori-btn")
                        for btn in new_btns:
                            if "接受" in btn.text_content():
                                btn.click()
                                page.wait_for_timeout(300)
                                break

        # ===== 貨架兌換 =====
        print("\n--- 貨架兌換 ---")
        page.evaluate("""() => new Promise((resolve) => {
            const req = indexedDB.open('lori_diary_db');
            req.onsuccess = () => {
                const db = req.result;
                const tx = db.transaction('stats', 'readwrite');
                tx.objectStore('stats').put({ key: 'carrots', value: 200 });
                tx.oncomplete = () => { db.close(); resolve(); };
            };
        })""")
        page.goto(f"{BASE}/#/shop")
        page.wait_for_timeout(1500)

        balance_before = page.query_selector(".lori-shop__balance-num")
        bal_before = int(balance_before.text_content()) if balance_before else 0

        redeem_btns = page.query_selector_all(".lori-shelf-card__redeem")
        # 找一個沒有 disabled 的兌換按鈕
        redeemable = None
        for btn in redeem_btns:
            if not btn.is_disabled():
                redeemable = btn
                break

        if redeemable:
            redeemable.click()
            page.wait_for_timeout(800)

            balance_after = page.query_selector(".lori-shop__balance-num")
            bal_after = int(balance_after.text_content()) if balance_after else 0
            check("兌換後餘額減少", bal_after < bal_before, f"{bal_before} -> {bal_after}")

            history_count_after = page.evaluate("""() => new Promise((resolve) => {
                const req = indexedDB.open('lori_diary_db');
                req.onsuccess = () => {
                    const db = req.result;
                    const tx = db.transaction('shop_history', 'readonly');
                    const countReq = tx.objectStore('shop_history').count();
                    countReq.onsuccess = () => { db.close(); resolve(countReq.result); };
                    countReq.onerror = () => { db.close(); resolve(-1); };
                };
            })""")
            check("兌換後 shop_history 有新記錄", history_count_after >= 2, str(history_count_after))
        else:
            check("有可兌換的貨架商品", False, "所有商品都 disabled")

        # ===== 設定值持久化 =====
        print("\n--- 設定值持久化 ---")
        page.goto(f"{BASE}/#/settings")
        page.wait_for_timeout(1000)

        # 切換通知開關
        toggles = page.query_selector_all(".lori-toggle-switch")
        if len(toggles) >= 1:
            # 記錄切換前
            before = toggles[0].get_attribute("aria-checked")
            toggles[0].click()
            page.wait_for_timeout(300)

            # 換頁再回來
            page.goto(f"{BASE}/#/dashboard")
            page.wait_for_timeout(300)
            page.goto(f"{BASE}/#/settings")
            page.wait_for_timeout(1000)

            toggles2 = page.query_selector_all(".lori-toggle-switch")
            if len(toggles2) >= 1:
                after = toggles2[0].get_attribute("aria-checked")
                check("通知開關切換後持久化", after != before, f"before={before}, after={after}")

        browser.close()

    # 總結
    passed = sum(1 for s, _ in RESULTS if s == "PASS")
    failed = sum(1 for s, _ in RESULTS if s == "FAIL")
    print(f"\n=============================")
    print(f"Phase 6 UAT: {passed} passed, {failed} failed, {passed + failed} total")
    print(f"=============================")

    if failed > 0:
        print("\nFailed tests:")
        for s, name in RESULTS:
            if s == "FAIL":
                print(f"  - {name}")
        sys.exit(1)

if __name__ == "__main__":
    run()
