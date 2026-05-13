/* global React, Phone, TabBar, DateBar, AddBar, HeaderBar, Body,
   PillBar, Ico, btnIcon, DateStackRow, FormRow, NumberStepper */

// ════════════════════════════════════════════════════════════
// 1400 學習主頁
// ════════════════════════════════════════════════════════════
function QuestPreviewCard({ skill, quest, target, actual, color }) {
  const p = actual / target;
  return (
    <div className="lori-card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
          letterSpacing: 0.3, textTransform: "uppercase" }}>{skill}</div>
        <div className="tabnum" style={{ fontSize: 12, color: "var(--ink-65)", fontWeight: 600 }}>
          {actual} / {target}
        </div>
      </div>
      <div style={{ marginTop: 6, fontSize: 17, fontWeight: 600 }}>{quest}</div>
      <div style={{ marginTop: 12 }}>
        <PillBar value={p} color={color} height={10} bg="#EFEBE1"/>
      </div>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between",
        alignItems: "baseline" }}>
        <div className="tabnum" style={{ fontSize: 13, fontWeight: 600, color }}>{Math.round(p*100)}%</div>
        <div style={{ fontSize: 11, color: "var(--gray)", fontWeight: 500 }}>距 IELTS 7.0 還有 17 天</div>
      </div>
    </div>
  );
}

function Screen1400() {
  return (
    <Phone>
      <Body padTop={54} padBottom={100}>
        <div style={{ padding: "10px 16px 14px" }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}>學習</div>
        </div>
        <DateBar date="今日 · 5月 12 (二)" progress={0.62} isToday/>

        <div style={{ marginTop: 18, padding: "0 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
            letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 8 }}>今日認領（2）</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <QuestPreviewCard skill="IELTS · 字彙" quest="背 Day Quest 50 個單字"
              target={50} actual={31} color="var(--hm-sun)"/>
            <QuestPreviewCard skill="SAP · 模組" quest="閱讀 FI 模組第 4 章"
              target={20} actual={20} color="var(--hm-mint)"/>
          </div>

          <button className="lori-btn" style={{ marginTop: 14, width: "100%", height: 52,
            background: "var(--violet)", color: "#fff", borderColor: "transparent", fontWeight: 600 }}>
            <Ico.Plus width="18" height="18"/> 認領今日 Quest
          </button>

          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button className="lori-btn lori-btn-ghost" style={{ flex: 1, height: 52 }}>技能列表</button>
            <button className="lori-btn lori-btn-ghost" style={{ flex: 1, height: 52 }}>回顧</button>
          </div>
        </div>

        <div style={{ marginTop: 24, padding: "0 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
            letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 8 }}>本週技能熱度</div>
          <div className="lori-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { name: "IELTS · 字彙",   h: 5, total: 7, color: "var(--hm-sun)"  },
              { name: "SAP · 模組",     h: 4, total: 7, color: "var(--hm-mint)" },
              { name: "荷蘭語 · 入門",   h: 2, total: 7, color: "var(--hm-lavender)" },
              { name: "煮飯 · 異國料理", h: 3, total: 7, color: "var(--carrot)" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, fontSize: 13 }}>{s.name}</div>
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: s.total }).map((_, j) => (
                    <div key={j} style={{ width: 12, height: 12, borderRadius: 3,
                      background: j < s.h ? s.color : "#EFEBE1" }}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Body>
      <TabBar active="lrn"/>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1401 認領列表
// ════════════════════════════════════════════════════════════
function QuestPick({ skill, quest, target, unit, checked, accent = "var(--violet)" }) {
  return (
    <div className="lori-card" style={{ display: "flex", alignItems: "center", gap: 14,
      padding: "12px 14px",
      borderColor: checked ? accent : "var(--hairline)",
      boxShadow: checked ? `0 0 0 1px ${accent}` : "none" }}>
      <div style={{ width: 22, height: 22, borderRadius: 6,
        background: checked ? accent : "transparent",
        border: checked ? "none" : "1.5px solid var(--gray)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {checked && <svg width="14" height="14" viewBox="0 0 24 24" className="icon" stroke="#fff" strokeWidth="3"><path d="M4 12l5 5L20 6"/></svg>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--gray)", fontWeight: 600,
          letterSpacing: 0.3, textTransform: "uppercase" }}>{skill}</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{quest}</div>
      </div>
      <div className="tabnum" style={{ fontSize: 12, color: "var(--ink-65)", fontWeight: 600,
        textAlign: "right" }}>
        {target}<br/><span style={{ fontSize: 10, color: "var(--gray)" }}>{unit}</span>
      </div>
    </div>
  );
}

function Screen1401() {
  return (
    <Phone>
      <HeaderBar title="認領 Quest" onSave rightLabel="確認 (3)"/>
      <Body padTop={106} padBottom={120}>
        {/* 推薦 */}
        <div style={{ padding: "0 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--violet)",
            letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 10 }}>
            ✦ 小蘿推薦
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <QuestPick skill="IELTS · 字彙" quest="背 Day Quest 50 個單字"
              target="50" unit="字" checked/>
            <QuestPick skill="SAP · 模組" quest="閱讀 FI 模組第 4 章"
              target="20" unit="頁" checked/>
          </div>
        </div>

        {/* divider */}
        <div style={{ margin: "22px 16px 14px", display: "flex", alignItems: "center", gap: 12,
          color: "var(--gray)", fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
          <div style={{ flex: 1, height: 1, background: "var(--hairline)" }}/>
          全部 Quest
          <div style={{ flex: 1, height: 1, background: "var(--hairline)" }}/>
        </div>

        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <QuestPick skill="荷蘭語 · 入門"  quest="Hallo & alstublieft 句型練習" target="15" unit="分鐘"/>
          <QuestPick skill="荷蘭語 · 入門"  quest="聽 NOS 新聞 5 分鐘" target="5" unit="分鐘"/>
          <QuestPick skill="煮飯 · 異國料理" quest="挑一道印尼菜，買齊食材" target="1" unit="次" checked/>
          <QuestPick skill="LinkedIn · 經營" quest="寫一篇 200 字短文" target="1" unit="篇"/>
          <QuestPick skill="運動 · 核心"    quest="平板支撐 3 組 × 60 秒" target="3" unit="組"/>
          <QuestPick skill="閱讀 · 文學"    quest="讀曹疏影《絲綢經蠕蟻》兩篇" target="2" unit="篇"/>
        </div>
      </Body>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px 30px",
        background: "linear-gradient(to top, var(--bg) 60%, transparent)" }}>
        <button className="lori-btn lori-btn-violet" style={{ width: "100%", height: 52,
          fontSize: 15, fontWeight: 600 }}>確認認領 · 3 個 Quest</button>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1410 技能列表
// ════════════════════════════════════════════════════════════
function SkillCard({ name, cat, progress, color, quests }) {
  return (
    <div className="lori-card" style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{name}</div>
          <div style={{ marginTop: 6, display: "inline-block", padding: "3px 10px",
            background: "rgba(58,63,71,0.06)", borderRadius: 999,
            fontSize: 11, fontWeight: 600, color: "var(--ink-65)", letterSpacing: 0.2 }}>
            {cat}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="tabnum" style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>
            {Math.round(progress * 100)}<span style={{ fontSize: 12, color: "var(--gray)" }}>%</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4, fontWeight: 500 }}>{quests} quest</div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <PillBar value={progress} color={color} height={6} bg="#EFEBE1"/>
      </div>
    </div>
  );
}

function Screen1410() {
  const skills = [
    { name: "IELTS · 字彙",      cat: "語言 · 出國",     progress: 0.62, color: "var(--hm-sun)",      quests: 12 },
    { name: "SAP · FI 模組",     cat: "職涯 · 認證",     progress: 0.41, color: "var(--hm-mint)",     quests: 8  },
    { name: "荷蘭語 · 入門",     cat: "語言 · 出國",     progress: 0.08, color: "var(--hm-lavender)", quests: 4  },
    { name: "煮飯 · 異國料理",   cat: "生活 · 樂趣",     progress: 0.55, color: "var(--carrot)",      quests: 9  },
    { name: "LinkedIn · 經營",   cat: "職涯 · 網絡",     progress: 0.30, color: "var(--hm-sky)",      quests: 6  },
    { name: "運動 · 核心",       cat: "身體 · 力量",     progress: 0.71, color: "var(--hm-coral)",    quests: 5  },
    { name: "閱讀 · 文學",       cat: "心智 · 靜默",     progress: 0.83, color: "var(--hm-sage)",     quests: 14 },
  ];
  return (
    <Phone>
      <HeaderBar title="技能列表"/>
      <Body padTop={106} padBottom={160}>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {skills.map((s, i) => <SkillCard key={i} {...s}/>)}
        </div>
      </Body>
      <AddBar label="新增技能"/>
      <TabBar active="lrn"/>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 141A Skill 明細
// ════════════════════════════════════════════════════════════
function Screen141A() {
  const quests = [
    { name: "背 Day Quest 50 個單字", target: "50 字 / 日",     checked: true,  active: true },
    { name: "聽 BBC 6-min English",   target: "1 集 / 日",      checked: true },
    { name: "Cambridge 模擬考 LR",    target: "1 套 / 週",      checked: false },
    { name: "字根詞綴系統梳理",        target: "1 章 / 週",      checked: false },
    { name: "寫作 Task 2 練習",       target: "2 篇 / 週",      checked: false },
  ];
  return (
    <Phone>
      <HeaderBar title="IELTS · 字彙" onSave/>
      <Body padTop={106} padBottom={160}>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* skill props */}
          <FormRow label="技能名稱">
            <input className="lori-input" defaultValue="IELTS · 字彙"/>
          </FormRow>
          <div style={{ display: "flex", gap: 10 }}>
            <FormRow label="分類">
              <div className="lori-input" style={{ display: "flex", alignItems: "center",
                justifyContent: "space-between", width: 168, fontSize: 15 }}>
                <span>語言 · 出國</span>
                <Ico.Chev width="14" height="14" stroke="var(--gray)"/>
              </div>
            </FormRow>
            <FormRow label="目標">
              <div className="lori-input" style={{ display: "flex", alignItems: "center",
                fontSize: 15 }}>
                <span className="tabnum" style={{ fontWeight: 600 }}>7.0</span>
                <span style={{ marginLeft: 6, color: "var(--gray)", fontSize: 12 }}>分</span>
              </div>
            </FormRow>
          </div>

          <div className="lori-card" style={{ padding: "14px 16px", background: "rgba(168,216,190,0.12)",
            borderColor: "rgba(168,216,190,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-65)" }}>整體進度</div>
              <div className="tabnum" style={{ fontSize: 18, fontWeight: 700, color: "var(--hm-sun)" }}>62%</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <PillBar value={0.62} color="var(--hm-sun)" height={8}/>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--gray)" }}>
              440 → 預估 6.0 · 距 7.0 還有 17 天可預備
            </div>
          </div>

          {/* quest list */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
                letterSpacing: 0.4, textTransform: "uppercase" }}>Quest（{quests.length}）</div>
              <div style={{ fontSize: 11, color: "var(--violet)", fontWeight: 600 }}>勾選 = 認領</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quests.map((q, i) => (
                <div key={i} className="lori-card" style={{ display: "flex", alignItems: "center",
                  padding: "12px 14px", gap: 12,
                  borderColor: q.active ? "var(--violet)" : "var(--hairline)" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5,
                    background: q.checked ? "var(--violet)" : "transparent",
                    border: q.checked ? "none" : "1.5px solid var(--gray)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {q.checked && <svg width="12" height="12" viewBox="0 0 24 24" className="icon"
                      stroke="#fff" strokeWidth="3"><path d="M4 12l5 5L20 6"/></svg>}
                  </div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{q.name}</div>
                  <div style={{ fontSize: 12, color: "var(--gray)", fontWeight: 500 }}>{q.target}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Body>
      <AddBar label="新增 Quest"/>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 141B Quest 編輯
// ════════════════════════════════════════════════════════════
function Toggle({ left = "有序", right = "無序", value = "right" }) {
  return (
    <div style={{ display: "flex", padding: 3, background: "#EFEBE1", borderRadius: 12,
      height: 48 }}>
      {[{ k: "left", l: left }, { k: "right", l: right }].map(t => {
        const on = t.k === value;
        return (
          <div key={t.k} style={{ flex: 1, display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: 9, fontSize: 14, fontWeight: 600,
            background: on ? "#fff" : "transparent",
            color: on ? "var(--ink)" : "var(--gray)",
            boxShadow: on ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>{t.l}</div>
        );
      })}
    </div>
  );
}

function Screen141B() {
  return (
    <Phone>
      <HeaderBar title="編輯 Quest" onSave/>
      <Body padTop={106} padBottom={36}>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 22 }}>
          <FormRow label="Quest 名稱">
            <input className="lori-input" defaultValue="背 Day Quest 50 個單字"/>
          </FormRow>
          <div style={{ display: "flex", gap: 10 }}>
            <FormRow label="單位">
              <div className="lori-input" style={{ display: "flex", alignItems: "center",
                justifyContent: "space-between", width: 170, fontSize: 15 }}>
                <span>字</span>
                <Ico.Chev width="14" height="14" stroke="var(--gray)"/>
              </div>
            </FormRow>
            <FormRow label="總量">
              <div className="lori-input tabnum" style={{ display: "flex", alignItems: "center",
                fontSize: 17, fontWeight: 600 }}>
                50
              </div>
            </FormRow>
          </div>

          <FormRow label="排序方式" hint="有序 = 必須按順序完成；無序 = 可任意打勾">
            <Toggle value="right"/>
          </FormRow>

          <FormRow label="頻率">
            <div className="lori-input" style={{ display: "flex", alignItems: "center",
              justifyContent: "space-between", fontSize: 15 }}>
              <span>每日</span>
              <Ico.Chev width="14" height="14" stroke="var(--gray)"/>
            </div>
          </FormRow>

          <FormRow label="🥕 完成獎勵">
            <NumberStepper value={12} suffix="🥕"/>
          </FormRow>
        </div>
      </Body>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1420 學習日期列表
// ════════════════════════════════════════════════════════════
function Screen1420() {
  const days = [
    { label: "今日 · 5月 12 (二)", sub: "字彙 31 / 50 · SAP 完成",  progress: 0.62, today: true,  color: "var(--mint)" },
    { label: "5月 11 (一)",        sub: "字彙 50 / 50 · SAP 完成", progress: 1.00, color: "rgba(255,213,79,0.55)" },
    { label: "5月 10 (日)",        sub: "字彙 42 / 50",            progress: 0.84, color: "rgba(255,213,79,0.42)" },
    { label: "5月 9 (六)",         sub: "未認領",                  progress: 0.0,  color: "rgba(176,173,166,0.20)" },
    { label: "5月 8 (五)",         sub: "字彙 30 / 50 · SAP 部分", progress: 0.55, color: "rgba(255,213,79,0.22)" },
    { label: "5月 7 (四)",         sub: "字彙 50 / 50 · 滿勾",     progress: 1.00, color: "rgba(255,213,79,0.16)" },
  ];
  return (
    <Phone>
      <HeaderBar title="學習回顧"/>
      <Body padTop={106} padBottom={100}>
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {days.map((d, i) => <DateStackRow key={i} {...d}/>)}
        </div>
      </Body>
      <TabBar active="lrn"/>
    </Phone>
  );
}

Object.assign(window, {
  Screen1400, Screen1401, Screen1410, Screen141A, Screen141B, Screen1420,
  QuestPreviewCard, QuestPick, SkillCard, Toggle,
});
