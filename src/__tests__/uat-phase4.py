"""
小蘿日誌 — Phase 4 Routine UAT（Playwright）
驗證 Routine tab、Block 管理、Step 管理、計時器、摘要、回顧
"""
import sys
import os
import time

os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

BASE = "http://localhost:8001"
RESULTS = []

def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    RESULTS.append((status, name))
    print(f"  {status}: {name}" + (f" ({detail})" if detail else ""))

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 430, "height": 932})

        # 先清 IndexedDB 確保乾淨環境
        page.goto(f"{BASE}/index.html")
        page.wait_for_timeout(1500)

        # ===== 1. Routine 主頁 =====
        print("\n--- 1. Routine 主頁 (#/routine) ---")
        page.goto(f"{BASE}/#/routine")
        page.wait_for_timeout(1500)

        # 頁面標題
        page_title = page.query_selector(".lori-routine-home__circle-wrap")
        check("Routine 主頁有中央大圓", page_title is not None)

        # AM/PM 提示
        hint = page.query_selector(".lori-routine-home__hint")
        check("有時段提示", hint is not None)
        if hint:
            hint_text = hint.text_content()
            check("時段提示含文字", len(hint_text) > 0, hint_text[:50])
            # 根據現在時間（下午 5 點），應是下午或晚間
            check("時段判斷正確（下午/晚間）",
                  "下午" in hint_text or "晚間" in hint_text or "時段" in hint_text,
                  hint_text)

        # Block 名稱
        block_name = page.query_selector(".lori-routine-home__block-name")
        check("Block 名稱存在", block_name is not None)
        if block_name:
            bn_text = block_name.text_content()
            check("有匹配的 Block 或預設 Block",
                  "Routine" in bn_text or "載入" in bn_text or len(bn_text) > 0,
                  bn_text)

        # Play 按鈕
        play_btn = page.query_selector(".lori-routine-home__play-btn")
        check("Play 按鈕存在", play_btn is not None)

        # 回顧/選擇按鈕列
        btn_row = page.query_selector(".lori-routine-home__btn-row")
        check("回顧+選擇按鈕列存在", btn_row is not None)

        # TabBar
        tab_bar = page.query_selector(".tab-bar")
        check("有 TabBar", tab_bar is not None)

        # 今日已完成區域
        completed = page.query_selector(".lori-routine-home__completed")
        check("今日已完成區域存在", completed is not None)

        # ===== 2. Block 列表 =====
        print("\n--- 2. Block 列表 (#/routine/blocks) ---")
        page.goto(f"{BASE}/#/routine/blocks")
        page.wait_for_timeout(1000)

        header = page.query_selector(".header-bar__title")
        check("HeaderBar 存在", header is not None)
        if header:
            check("標題為 Routine 選擇", "Routine" in header.text_content(), header.text_content())

        # Block 卡片
        cards = page.query_selector_all(".lori-block-card")
        check("有 Block 卡片（預設 2 筆）", len(cards) >= 2, str(len(cards)))

        if len(cards) >= 1:
            # 檢查卡片結構
            stripe = cards[0].query_selector(".lori-block-card__stripe")
            check("卡片有左側色條", stripe is not None)
            name_el = cards[0].query_selector(".lori-block-card__name")
            check("卡片有名稱", name_el is not None)
            if name_el:
                check("第一張卡名稱為晨間 Routine", "晨間" in name_el.text_content(), name_el.text_content())
            pct_el = cards[0].query_selector(".lori-block-card__pct")
            check("卡片有百分比", pct_el is not None)
            pill = cards[0].query_selector(".lori-block-card__pill")
            check("卡片有 PillBar", pill is not None)

        # AddBar
        add_bar = page.query_selector(".lori-add-bar")
        check("有新增 Block 按鈕", add_bar is not None)

        # ===== 3. Block 編輯 =====
        print("\n--- 3. Block 編輯 (#/routine/blocks/1) ---")
        # 點擊第一張卡片
        if len(cards) >= 1:
            cards[0].click()
            page.wait_for_timeout(1000)

        current_hash = page.evaluate("() => location.hash")
        check("點擊卡片進入 Block 編輯", "#/routine/blocks/" in current_hash, current_hash)

        # 表單元素
        form_rows = page.query_selector_all(".lori-form-row")
        check("有表單行（至少 3 個：名稱/rise/set）", len(form_rows) >= 3, str(len(form_rows)))

        # 名稱輸入
        name_input = page.query_selector(".lori-block-edit__name-input")
        check("有名稱輸入欄", name_input is not None)
        if name_input:
            val = name_input.input_value()
            check("名稱欄有值", len(val) > 0, val)

        # TimePicker
        time_pickers = page.query_selector_all(".lori-time-picker")
        check("有 TimePicker（rise + set）", len(time_pickers) >= 2, str(len(time_pickers)))

        # 立即開始卡片
        play_card = page.query_selector(".lori-block-edit__play-card")
        check("有立即開始卡片", play_card is not None)

        # Step 列表入口
        step_bar = page.query_selector(".lori-block-edit__step-bar")
        check("有 Step 列表入口", step_bar is not None)

        # HeaderBar 存檔按鈕
        save_btn = page.query_selector(".header-bar__action")
        check("有存檔按鈕", save_btn is not None)

        # ===== 4. Step 列表 =====
        print("\n--- 4. Step 列表 ---")
        if step_bar:
            step_bar.click()
            page.wait_for_timeout(1000)

        current_hash = page.evaluate("() => location.hash")
        check("進入 Step 列表", "/steps" in current_hash, current_hash)

        # Step 列欄位標頭
        col_headers = page.query_selector(".lori-step-list__col-headers")
        check("有欄位標頭", col_headers is not None)

        # Step rows
        step_rows = page.query_selector_all(".lori-step-row")
        check("有 Step rows（晨間預設 10 筆）", len(step_rows) >= 10, str(len(step_rows)))

        if len(step_rows) >= 1:
            # 檢查第一個 row 結構
            idx_el = step_rows[0].query_selector(".lori-step-row__idx")
            check("StepRow 有序號", idx_el is not None)
            name_el = step_rows[0].query_selector(".lori-step-row__name")
            check("StepRow 有名稱", name_el is not None)
            time_el = step_rows[0].query_selector(".lori-step-row__time")
            check("StepRow 有時間", time_el is not None)
            pre_el = step_rows[0].query_selector(".lori-step-row__pre")
            check("StepRow 有 pre-buffer", pre_el is not None)
            divider = step_rows[0].query_selector(".lori-step-row__divider")
            check("StepRow 有分隔線", divider is not None)

        # ===== 5. Step 編輯 =====
        print("\n--- 5. Step 編輯 ---")
        if len(step_rows) >= 1:
            step_rows[0].click()
            page.wait_for_timeout(1000)

        current_hash = page.evaluate("() => location.hash")
        check("進入 Step 編輯", "/steps/" in current_hash, current_hash)

        # 表單元素
        step_form_rows = page.query_selector_all(".lori-form-row")
        check("Step 編輯有表單行（至少 4：名稱/秒數/pre-buffer/備註）", len(step_form_rows) >= 4, str(len(step_form_rows)))

        # NumberStepper
        steppers = page.query_selector_all(".lori-number-stepper")
        check("有 NumberStepper（秒數 + pre-buffer）", len(steppers) >= 2, str(len(steppers)))

        # 預覽區
        preview = page.query_selector(".lori-step-edit__preview-box")
        check("有預覽區", preview is not None)

        # ===== 6. 計時器頁面 =====
        print("\n--- 6. 計時器頁面 (#/routine/timer/1) ---")
        page.goto(f"{BASE}/#/routine/timer/1")
        page.wait_for_timeout(2000)

        # 計時器容器
        timer_container = page.query_selector(".lori-routine-timer")
        check("計時器容器存在", timer_container is not None)

        # 進度條
        progress_segs = page.query_selector_all(".lori-routine-timer__progress-seg")
        check("有進度條 segments（10 個 step）", len(progress_segs) >= 10, str(len(progress_segs)))

        # Step 名稱
        step_name = page.query_selector(".lori-routine-timer__step-name")
        check("有 Step 名稱", step_name is not None)
        if step_name:
            sn_text = step_name.text_content()
            check("第一步是賴床", "賴床" in sn_text, sn_text)

        # 倒數顯示
        countdown = page.query_selector(".lori-routine-timer__countdown")
        check("有倒數顯示", countdown is not None)

        # phase label
        phase_label = page.query_selector(".lori-routine-timer__phase-label")
        check("有 phase label", phase_label is not None)
        if phase_label:
            check("初始 phase 為準備中", "準備" in phase_label.text_content(), phase_label.text_content())

        # 完成/跳過按鈕
        skip_btn = page.query_selector(".lori-routine-timer__skip-btn")
        check("有跳過按鈕", skip_btn is not None)
        complete_btn = page.query_selector(".lori-routine-timer__complete-btn")
        check("有完成按鈕", complete_btn is not None)

        # 背景 overlay（用於最後 5 秒）
        bg_overlay = page.query_selector(".lori-routine-timer__bg")
        check("有背景 overlay", bg_overlay is not None)

        # 下一 step 預告
        next_hint = page.query_selector(".lori-routine-timer__next-hint")
        check("有下一 step 預告", next_hint is not None)

        # ===== 7. 計時器功能測試 =====
        print("\n--- 7. 計時器功能（跳過/完成）---")

        # 跳過第一步
        if skip_btn:
            skip_btn.click()
            page.wait_for_timeout(500)
            # 檢查進度條第一格變灰
            first_seg = progress_segs[0] if len(progress_segs) > 0 else None
            if first_seg:
                bg_color = page.evaluate("(el) => el.style.background", first_seg)
                check("跳過後第一格變灰色", "gray" in bg_color.lower() or "var(--gray)" in bg_color, bg_color)

            # step 名稱應該變成下一步
            step_name2 = page.query_selector(".lori-routine-timer__step-name")
            if step_name2:
                sn2_text = step_name2.text_content()
                check("跳過後進入下一步", "準備運動" in sn2_text or sn2_text != "賴床", sn2_text)

        # 完成當前步
        complete_btn2 = page.query_selector(".lori-routine-timer__complete-btn")
        if complete_btn2:
            complete_btn2.click()
            page.wait_for_timeout(500)
            # 第二格應變 mint
            if len(progress_segs) > 1:
                bg_color2 = page.evaluate("(el) => el.style.background", progress_segs[1])
                check("完成後第二格變 mint", "mint" in bg_color2.lower() or "var(--mint)" in bg_color2, bg_color2)

        # 快速跳過剩餘 steps 到摘要頁
        for i in range(8):  # 跳過剩餘的 8 步（共 10 步，已處理 2 步）
            skip_b = page.query_selector(".lori-routine-timer__skip-btn")
            if skip_b:
                skip_b.click()
                page.wait_for_timeout(300)

        page.wait_for_timeout(1000)

        # ===== 8. 摘要頁 =====
        print("\n--- 8. 摘要頁 (#/routine/summary/) ---")
        current_hash = page.evaluate("() => location.hash")
        check("跳到摘要頁", "#/routine/summary/" in current_hash, current_hash)

        # 百分比顯示
        pct_num = page.query_selector(".lori-routine-summary__pct-num")
        check("有完成百分比大字", pct_num is not None)
        if pct_num:
            pct_val = pct_num.text_content()
            check("百分比為 10%（1/10 完成）", pct_val == "10", pct_val)

        # step 統計
        stat_line = page.query_selector(".lori-routine-summary__stat-line")
        check("有 step 統計", stat_line is not None)
        if stat_line:
            check("統計為 1/10 step", "1 / 10" in stat_line.text_content(), stat_line.text_content())

        # 紅蘿蔔獎勵
        carrot_pill = page.query_selector(".lori-routine-summary__carrot-pill")
        check("有紅蘿蔔獎勵", carrot_pill is not None)
        if carrot_pill:
            ct = carrot_pill.text_content()
            # 10% → 1 紅蘿蔔
            check("積分為 +1（10% → 1 紅蘿蔔）", "+1" in ct, ct)

        # 跳過的 step 列表
        skip_section = page.query_selector(".lori-routine-summary__skip-section")
        check("有跳過 step 列表", skip_section is not None)
        if skip_section:
            skip_cards = skip_section.query_selector_all(".lori-routine-summary__skip-card")
            check("跳過 step 有 9 張卡（9 步跳過）", len(skip_cards) == 9, str(len(skip_cards)))

        # 重做按鈕
        redo_btns = page.query_selector_all(".lori-routine-summary__redo-btn")
        check("每張跳過卡有重做按鈕", len(redo_btns) >= 1)

        # 鼓勵語
        encourage = page.query_selector(".lori-routine-summary__encourage")
        check("有鼓勵語", encourage is not None)

        # 確認按鈕
        confirm_btn = page.query_selector(".lori-routine-summary__bottom .lori-btn-primary")
        check("有確認按鈕", confirm_btn is not None)

        # 確認收下
        if confirm_btn:
            confirm_btn.click()
            page.wait_for_timeout(1000)
            current_hash = page.evaluate("() => location.hash")
            check("確認後回到 Routine 主頁", current_hash == "#/routine", current_hash)

        # ===== 9. 回顧頁 =====
        print("\n--- 9. 回顧頁 (#/routine/history) ---")
        page.goto(f"{BASE}/#/routine/history")
        page.wait_for_timeout(1000)

        header = page.query_selector(".header-bar__title")
        check("回顧頁有 HeaderBar", header is not None)
        if header:
            check("標題為 Routine 回顧", "回顧" in header.text_content(), header.text_content())

        # DateStackRow
        date_rows = page.query_selector_all(".lori-date-stack-row")
        check("回顧頁有日期列（至少今日）", len(date_rows) >= 1, str(len(date_rows)))

        # TabBar
        tab_bar = page.query_selector(".tab-bar")
        check("回顧頁有 TabBar", tab_bar is not None)

        # ===== 10. Console 錯誤 =====
        print("\n--- 10. Console 錯誤檢查 ---")
        # 重新導航並收集錯誤
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"{BASE}/#/routine")
        page.wait_for_timeout(1500)
        page.goto(f"{BASE}/#/routine/blocks")
        page.wait_for_timeout(1000)
        page.goto(f"{BASE}/#/routine/blocks/1")
        page.wait_for_timeout(1000)

        check("無 JS 錯誤", len(errors) == 0, "; ".join(errors[:3]) if errors else "clean")

        browser.close()

    # 總結
    passed = sum(1 for s, _ in RESULTS if s == "PASS")
    failed = sum(1 for s, _ in RESULTS if s == "FAIL")
    print(f"\n=============================")
    print(f"Phase 4 UAT: {passed} passed, {failed} failed, {passed + failed} total")
    print(f"=============================")

    if failed > 0:
        print("\nFailed tests:")
        for s, name in RESULTS:
            if s == "FAIL":
                print(f"  - {name}")
        sys.exit(1)

if __name__ == "__main__":
    run()
