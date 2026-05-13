"""
小蘿日誌 — Phase 5 瀏覽器 UAT（用 Playwright）
測試完整學習模組流程：
1. 學習 tab → 主頁
2. 技能列表 → 新增技能 → 明細 → 新增 Quest → Quest 編輯 → 存檔
3. 認領按鈕 → 認領列表 → 勾選確認 → 回主頁有 QuestPreviewCard
4. 完成 → 積分增加
5. 回顧頁
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
        context = browser.new_context(viewport={"width": 430, "height": 932})
        page = context.new_page()

        # 用乾淨的 context（IndexedDB 隔離），不需要手動刪 DB
        page.goto(f"{BASE}/#/cover")
        page.wait_for_timeout(2000)

        # ===== 1. 封面 → 學習 tab =====
        print("\n--- 學習主頁（#/learning）---")
        page.goto(f"{BASE}/#/learning")
        page.wait_for_timeout(1000)

        # 確認頁面元素
        page_title = page.evaluate("() => document.querySelector('.lori-scroll')?.textContent || ''")
        check("學習主頁載入", "學習" in page_title, page_title[:50])

        tab_bar = page.query_selector(".tab-bar")
        check("學習主頁有 TabBar", tab_bar is not None)

        # 確認「今日認領（0）」
        claim_label = page.evaluate("""() => {
            const els = document.querySelectorAll('.lori-learning-home__section-label');
            for (const el of els) { if (el.textContent.includes('今日認領')) return el.textContent; }
            return '';
        }""")
        check("今日認領計數為 0", "0" in claim_label, claim_label)

        # 確認空訊息
        empty_msg = page.query_selector(".lori-learning-home__empty")
        check("顯示未認領提示", empty_msg is not None)

        # 確認認領按鈕
        claim_btn = page.query_selector(".lori-learning-home__claim-btn")
        check("認領按鈕存在", claim_btn is not None)

        # 確認熱度區域
        heat_section = page.query_selector(".lori-learning-home__heat-section")
        check("本週技能熱度區存在", heat_section is not None)

        # ===== 2. 技能列表 → 新增技能 =====
        print("\n--- 技能列表 + 新增技能 ---")
        page.goto(f"{BASE}/#/learning/skills")
        page.wait_for_timeout(1000)

        # 確認空列表
        empty_skill = page.query_selector(".lori-skill-list__empty")
        check("初始技能列表為空", empty_skill is not None)

        # 點新增技能
        add_bar_btn = page.query_selector(".lori-add-bar__btn")
        check("新增技能按鈕存在", add_bar_btn is not None)

        if add_bar_btn:
            add_bar_btn.click()
            page.wait_for_timeout(1500)

            current_hash = page.evaluate("() => location.hash")
            check("點新增後跳轉到技能明細", "/learning/skills/" in current_hash, current_hash)

            # ===== 3. 技能明細 → 填表 → 存檔 =====
            print("\n--- 技能明細 ---")

            # 修改名稱
            name_input = page.query_selector(".lori-skill-detail__name-input")
            check("技能名稱輸入框存在", name_input is not None)

            if name_input:
                name_input.fill("")
                name_input.fill("日語 N2")
                page.wait_for_timeout(300)

            # 選擇分類
            cat_select = page.query_selector(".lori-skill-detail__cat-select")
            check("分類下拉存在", cat_select is not None)
            if cat_select:
                cat_select.select_option("語言")
                page.wait_for_timeout(300)

            # 確認進度卡片
            progress_card = page.query_selector(".lori-skill-detail__progress-card")
            check("進度卡片存在", progress_card is not None)

            # 確認 Quest 區域顯示空
            quest_empty = page.query_selector(".lori-skill-detail__quest-empty")
            check("Quest 列表初始為空", quest_empty is not None)

            # 存檔技能
            save_btn = page.query_selector(".header-bar__action")
            check("存檔按鈕存在", save_btn is not None)
            if save_btn:
                save_btn.click()
                page.wait_for_timeout(1000)
                current_hash = page.evaluate("() => location.hash")
                check("存檔後回到技能列表", current_hash == "#/learning/skills", current_hash)

            # ===== 4. 確認技能列表有新技能 =====
            page.wait_for_timeout(500)
            skill_card = page.query_selector(".lori-skill-card")
            check("技能列表有 SkillCard", skill_card is not None)

            if skill_card:
                skill_name = page.query_selector(".lori-skill-card__name")
                check("SkillCard 顯示正確名稱", skill_name and "日語 N2" in skill_name.text_content(),
                      skill_name.text_content() if skill_name else "null")

                skill_cat = page.query_selector(".lori-skill-card__cat")
                check("SkillCard 顯示分類標籤", skill_cat and "語言" in skill_cat.text_content(),
                      skill_cat.text_content() if skill_cat else "null")

            # ===== 5. 進入技能明細 → 新增 Quest =====
            print("\n--- 新增 Quest ---")
            if skill_card:
                skill_card.click()
                page.wait_for_timeout(1000)

            current_hash = page.evaluate("() => location.hash")
            check("進入技能明細頁", "/learning/skills/" in current_hash, current_hash)

            # 點新增 Quest
            add_quest_btn = page.query_selector(".lori-add-bar__btn")
            check("新增 Quest 按鈕存在", add_quest_btn is not None)

            if add_quest_btn:
                add_quest_btn.click()
                page.wait_for_timeout(1500)

                current_hash = page.evaluate("() => location.hash")
                check("跳轉到 Quest 編輯頁", "/quests/" in current_hash, current_hash)

                # ===== 6. Quest 編輯 → 填表 → 存檔 =====
                print("\n--- Quest 編輯 ---")

                quest_name_input = page.query_selector(".lori-quest-edit__name-input")
                check("Quest 名稱輸入框存在", quest_name_input is not None)

                if quest_name_input:
                    quest_name_input.fill("")
                    quest_name_input.fill("文法每日一課")
                    page.wait_for_timeout(300)

                # Toggle 元件
                toggle = page.query_selector(".lori-toggle")
                check("排序方式 Toggle 存在", toggle is not None)

                # 確認頻率下拉
                freq_select = page.evaluate("""() => {
                    const selects = document.querySelectorAll('select.lori-input');
                    for (const s of selects) {
                        const opts = Array.from(s.options).map(o => o.value);
                        if (opts.includes('每日')) return true;
                    }
                    return false;
                }""")
                check("頻率下拉含每日選項", freq_select)

                # 設定總量
                stepper_btns = page.query_selector_all(".lori-number-stepper__btn")
                # 找總量的 stepper（第一個 NumberStepper 的加號）
                if len(stepper_btns) >= 2:
                    # 點 5 次加號增加總量到 5
                    for _ in range(5):
                        stepper_btns[1].click()
                        page.wait_for_timeout(100)

                total_val = page.evaluate("""() => {
                    const nums = document.querySelectorAll('.lori-number-stepper__num');
                    return nums.length > 0 ? nums[0].textContent : '?';
                }""")
                check("總量設為 5", total_val == "5", total_val)

                # 存檔 Quest
                save_quest_btn = page.query_selector(".header-bar__action")
                if save_quest_btn:
                    save_quest_btn.click()
                    page.wait_for_timeout(1000)

                current_hash = page.evaluate("() => location.hash")
                check("Quest 存檔後回到技能明細", "/learning/skills/" in current_hash and "/quests/" not in current_hash,
                      current_hash)

                # 確認 Quest 列表有新 Quest
                quest_row = page.query_selector(".lori-skill-detail__quest-row")
                check("技能明細有 Quest 列表行", quest_row is not None)

        # ===== 7. 認領流程 =====
        print("\n--- 認領流程 ---")
        page.goto(f"{BASE}/#/learning/claim")
        page.wait_for_timeout(1500)

        # 確認 HeaderBar
        header_title = page.evaluate("""() => {
            const t = document.querySelector('.header-bar__title');
            return t ? t.textContent : '';
        }""")
        check("認領頁標題正確", "認領" in header_title, header_title)

        # 確認推薦區
        rec_label = page.query_selector(".lori-quest-claim__rec-label")
        check("推薦區標籤存在", rec_label is not None)

        # 確認 QuestPick 元件
        quest_picks = page.query_selector_all(".lori-quest-pick")
        check("有 QuestPick 項目", len(quest_picks) > 0, str(len(quest_picks)))

        # 確認推薦項已勾選
        if quest_picks:
            first_checked = page.evaluate("""() => {
                const pick = document.querySelector('.lori-quest-pick');
                return pick ? pick.getAttribute('aria-checked') : '';
            }""")
            check("推薦項預設勾選", first_checked == "true", first_checked)

        # 確認底部按鈕
        confirm_btn = page.query_selector(".lori-quest-claim__confirm-btn")
        check("確認認領按鈕存在", confirm_btn is not None)
        if confirm_btn:
            btn_text = confirm_btn.text_content()
            check("確認按鈕顯示數量", "1" in btn_text or "Quest" in btn_text, btn_text)

        # 點確認認領
        if confirm_btn:
            confirm_btn.click()
            page.wait_for_timeout(1500)

            current_hash = page.evaluate("() => location.hash")
            check("確認後回到學習主頁", current_hash == "#/learning", current_hash)

        # ===== 8. 回主頁確認有 QuestPreviewCard =====
        print("\n--- 學習主頁（認領後）---")
        page.wait_for_timeout(500)

        preview_card = page.query_selector(".lori-quest-preview")
        check("主頁有 QuestPreviewCard", preview_card is not None)

        if preview_card:
            skill_label = page.query_selector(".lori-quest-preview__skill")
            check("QuestPreviewCard 有技能名", skill_label is not None and len(skill_label.text_content()) > 0,
                  skill_label.text_content() if skill_label else "null")

            quest_name_el = page.query_selector(".lori-quest-preview__name")
            check("QuestPreviewCard 有 Quest 名", quest_name_el is not None and len(quest_name_el.text_content()) > 0,
                  quest_name_el.text_content() if quest_name_el else "null")

            count_label = page.query_selector(".lori-quest-preview__count")
            check("QuestPreviewCard 有數量顯示", count_label is not None,
                  count_label.text_content() if count_label else "null")

            complete_btn = page.query_selector(".lori-quest-preview__complete-btn")
            check("QuestPreviewCard 有完成按鈕", complete_btn is not None)

            # 確認今日認領計數更新
            claim_label = page.evaluate("""() => {
                const els = document.querySelectorAll('.lori-learning-home__section-label');
                for (const el of els) { if (el.textContent.includes('今日認領')) return el.textContent; }
                return '';
            }""")
            check("今日認領計數更新為 1", "1" in claim_label, claim_label)

        # ===== 9. 取得完成前積分 =====
        print("\n--- 完成 Quest → 積分 ---")
        carrots_before = page.evaluate("""() => new Promise((resolve) => {
            const req = indexedDB.open('lori_diary_db');
            req.onsuccess = () => {
                const db = req.result;
                const tx = db.transaction('stats', 'readonly');
                const getReq = tx.objectStore('stats').get('carrots');
                getReq.onsuccess = () => { db.close(); resolve(getReq.result?.value || 0); };
                getReq.onerror = () => { db.close(); resolve(0); };
            };
            req.onerror = () => resolve(0);
        })""")
        check("完成前積分記錄", True, f"carrots={carrots_before}")

        # ===== 10. 點完成按鈕 =====
        complete_btn = page.query_selector(".lori-quest-preview__complete-btn")
        if complete_btn:
            complete_btn.click()
            page.wait_for_timeout(2000)

            # toast 應出現
            toast = page.query_selector(".encouragement-toast")
            check("完成後有 toast 提示", toast is not None)

            # 確認積分增加
            page.wait_for_timeout(1500)
            carrots_after = page.evaluate("""() => new Promise((resolve) => {
                const req = indexedDB.open('lori_diary_db');
                req.onsuccess = () => {
                    const db = req.result;
                    const tx = db.transaction('stats', 'readonly');
                    const getReq = tx.objectStore('stats').get('carrots');
                    getReq.onsuccess = () => { db.close(); resolve(getReq.result?.value || 0); };
                    getReq.onerror = () => { db.close(); resolve(0); };
                };
                req.onerror = () => resolve(0);
            })""")
            check("完成後積分增加", carrots_after > carrots_before,
                  f"before={carrots_before}, after={carrots_after}")

            # 確認 claim 的 c_actual 更新
            claim_updated = page.evaluate("""() => new Promise((resolve) => {
                const req = indexedDB.open('lori_diary_db');
                req.onsuccess = () => {
                    const db = req.result;
                    const tx = db.transaction('claims', 'readonly');
                    const getReq = tx.objectStore('claims').getAll();
                    getReq.onsuccess = () => {
                        db.close();
                        const claims = getReq.result;
                        const done = claims.filter(c => c.c_actual >= c.c_target);
                        resolve(done.length);
                    };
                    getReq.onerror = () => { db.close(); resolve(-1); };
                };
                req.onerror = () => resolve(-1);
            })""")
            check("Claim 的 c_actual 已更新為完成", claim_updated > 0, f"completed={claim_updated}")

        # ===== 11. 回顧頁 =====
        print("\n--- 學習回顧 ---")
        page.goto(f"{BASE}/#/learning/history")
        page.wait_for_timeout(1500)

        history_header = page.evaluate("""() => {
            const t = document.querySelector('.header-bar__title');
            return t ? t.textContent : '';
        }""")
        check("回顧頁標題正確", "回顧" in history_header, history_header)

        history_list = page.query_selector(".lori-learning-history__list")
        check("回顧頁列表容器存在", history_list is not None)

        # 確認有至少一個 DateStackRow（今日）
        date_rows = page.query_selector_all(".lori-date-stack-row")
        check("回顧頁有今日紀錄", len(date_rows) >= 1, str(len(date_rows)))

        if date_rows:
            # 檢查今日行的 sub 文字
            today_label = date_rows[0].query_selector(".lori-date-stack-row__label")
            check("今日行有日期標籤", today_label is not None and "今日" in today_label.text_content(),
                  today_label.text_content() if today_label else "null")

            today_sub = date_rows[0].query_selector(".lori-date-stack-row__sub")
            check("今日行有完成摘要", today_sub is not None and len(today_sub.text_content()) > 0,
                  today_sub.text_content() if today_sub else "null")

        # 有 TabBar
        tab_bar = page.query_selector(".tab-bar")
        check("回顧頁有 TabBar", tab_bar is not None)

        # ===== 12. 熱度顯示 =====
        print("\n--- 學習主頁熱度 ---")
        page.goto(f"{BASE}/#/learning")
        page.wait_for_timeout(1500)

        heat_rows = page.query_selector_all(".lori-learning-home__heat-row")
        check("熱度區有技能行", len(heat_rows) > 0, str(len(heat_rows)))

        if heat_rows:
            heat_name = heat_rows[0].query_selector(".lori-learning-home__heat-name")
            check("熱度行有技能名", heat_name is not None and len(heat_name.text_content()) > 0,
                  heat_name.text_content() if heat_name else "null")

            heat_dots = heat_rows[0].query_selector_all(".lori-learning-home__heat-dot")
            check("熱度行有 7 個小方塊", len(heat_dots) == 7, str(len(heat_dots)))

        browser.close()

    # 總結
    passed = sum(1 for s, _ in RESULTS if s == "PASS")
    failed = sum(1 for s, _ in RESULTS if s == "FAIL")
    print(f"\n=============================")
    print(f"Phase 5 UAT: {passed} passed, {failed} failed, {passed + failed} total")
    print(f"=============================")

    if failed > 0:
        print("\nFailed tests:")
        for s, name in RESULTS:
            if s == "FAIL":
                print(f"  - {name}")
        sys.exit(1)


if __name__ == "__main__":
    run()
