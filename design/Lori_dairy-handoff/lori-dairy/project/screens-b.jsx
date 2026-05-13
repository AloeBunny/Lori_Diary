/* global React, Phone, TabBar, DateBar, CheckCircle, AddBar, HeaderBar, Body,
   PillBar, Ico, btnIcon, DateStackRow */

// ════════════════════════════════════════════════════════════
// 1300 Routine 主頁
// ════════════════════════════════════════════════════════════
function Screen1300() {
  return (
    <Phone>
      <Body padTop={54} padBottom={100}>
        <div style={{ padding: "10px 16px 14px" }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}>Routine</div>
        </div>
        <DateBar date="今日 · 5月 12 (二)" progress={0.5} isToday/>

        {/* AM/PM hint */}
        <div style={{ marginTop: 22, padding: "0 16px", textAlign: "center",
          fontSize: 12, color: "var(--gray)", fontWeight: 500, letterSpacing: 0.3 }}>
          下午時段 · 自動載入「午後復元」
        </div>

        {/* 中央大圓 */}
        <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
          <div style={{ width: 248, height: 248, borderRadius: "50%",
            border: "1.5px solid var(--hairline)", background: "#fff",
            position: "relative", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 11, color: "var(--gray)", fontWeight: 600,
              letterSpacing: 0.4, textTransform: "uppercase" }}>當前 Block</div>
            <div style={{ fontSize: 16, color: "var(--ink-65)", fontWeight: 500, marginTop: 4 }}>午後復元</div>
            <div className="tabnum" style={{ marginTop: 8, fontSize: 56, fontWeight: 600,
              color: "var(--ink)", letterSpacing: -1 }}>28:00</div>
            <div style={{ fontSize: 11, color: "var(--gray)", fontWeight: 500, marginTop: -2 }}>共 11 個 step</div>
            <button style={{ marginTop: 16, width: 64, height: 64, borderRadius: "50%",
              border: "none", background: "var(--violet)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 16px rgba(155,125,184,0.4)",
              cursor: "pointer" }}>
              <Ico.Play width="28" height="28"/>
            </button>
          </div>
        </div>

        {/* 兩個 button */}
        <div style={{ marginTop: 36, padding: "0 16px", display: "flex", gap: 10 }}>
          <button className="lori-btn lori-btn-ghost" style={{ flex: 1, height: 52 }}>回顧</button>
          <button className="lori-btn lori-btn-ghost" style={{ flex: 1, height: 52,
            background: "var(--mint)", borderColor: "transparent", color: "#2a4a3a", fontWeight: 600 }}>
            Routine 選擇
          </button>
        </div>

        {/* 今日預覽 */}
        <div style={{ marginTop: 22, padding: "0 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
            letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 8 }}>今日已完成</div>
          <div className="lori-card" style={{ padding: 14, display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>晨起序列</div>
              <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>06:40 · 9 step · 全勾</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", color: "var(--green)",
              fontSize: 13, fontWeight: 600 }}>✓ 100%</div>
          </div>
        </div>
      </Body>
      <TabBar active="rt"/>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1301 計時進行
// ════════════════════════════════════════════════════════════
function Screen1301() {
  // 模擬「最後 5 秒」溫和漸強：用淡桃色光暈鋪底
  return (
    <Phone>
      <div style={{ position: "absolute", inset: 0,
        background: "radial-gradient(circle at 50% 38%, rgba(244,132,95,0.10), rgba(250,248,243,0) 70%)"
      }}/>

      {/* 頂部 step 進度 */}
      <div style={{ position: "absolute", top: 64, left: 16, right: 16, zIndex: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: 11, color: "var(--gray)", fontWeight: 600,
          letterSpacing: 0.4, textTransform: "uppercase" }}>
          <span>Step 4 / 11</span>
          <span>午後復元</span>
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 3 }}>
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
              background: i < 3 ? "var(--mint)" : i === 3 ? "var(--violet)" : "var(--hairline)" }}/>
          ))}
        </div>
      </div>

      {/* 主內容 */}
      <div style={{ position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 24px" }}>
        <div style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600,
          letterSpacing: 0.5, textTransform: "uppercase" }}>當前 step</div>
        <div style={{ marginTop: 10, fontSize: 22, fontWeight: 600, color: "var(--ink)",
          textAlign: "center", letterSpacing: 0.3 }}>四式伸展 · 髖部開展</div>

        <div className="tabnum" style={{ marginTop: 30, fontSize: 128, fontWeight: 700,
          color: "var(--navy)", letterSpacing: -4, lineHeight: 1 }}>00:04</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--carrot)", fontWeight: 600,
          letterSpacing: 0.3 }}>● 最後 5 秒</div>

        <div style={{ marginTop: 8, fontSize: 13, color: "var(--gray)", fontWeight: 500 }}>
          下一 step：靜止 · 呼吸調節（10s）
        </div>
      </div>

      {/* 底部 controls */}
      <div style={{ position: "absolute", left: 24, right: 24, bottom: 56,
        display: "flex", gap: 12 }}>
        <button className="lori-btn" style={{ flex: 1, height: 60, fontSize: 16,
          background: "#EFEAE0", color: "var(--gray)", borderColor: "transparent", fontWeight: 600 }}>
          <Ico.Skip width="20" height="20"/> 跳過
        </button>
        <button className="lori-btn lori-btn-primary" style={{ flex: 1, height: 60, fontSize: 16, fontWeight: 700 }}>
          <Ico.Check width="22" height="22" stroke="#2a4a3a" strokeWidth="2.4"/> 完成
        </button>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1302 完成摘要
// ════════════════════════════════════════════════════════════
function Screen1302() {
  const skipped = [
    { name: "靜止 · 呼吸調節", time: "10s" },
    { name: "頸部側屈", time: "20s" },
    { name: "嬰兒式收尾", time: "30s" },
  ];
  return (
    <Phone>
      <HeaderBar title="完成摘要"/>
      <Body padTop={106} padBottom={120}>
        <div style={{ padding: "10px 16px 0", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
            letterSpacing: 0.4, textTransform: "uppercase" }}>午後復元 · 完成</div>
          <div className="tabnum" style={{ marginTop: 14, fontSize: 92, fontWeight: 700,
            color: "var(--mint)", letterSpacing: -3, lineHeight: 1 }}>
            73<span style={{ fontSize: 40, color: "var(--ink-65)", marginLeft: 4 }}>%</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 14, color: "var(--ink-65)" }}>8 / 11 step</div>

          <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 18px", background: "rgba(244,132,95,0.10)", borderRadius: 999,
            color: "var(--carrot)", fontSize: 15, fontWeight: 700 }}>
            🥕 +18
          </div>
        </div>

        {/* skipped list */}
        <div style={{ marginTop: 28, padding: "0 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
            letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 10 }}>
            跳過的 step ({skipped.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {skipped.map((s, i) => (
              <div key={i} className="lori-card" style={{ padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>{s.time}</div>
                </div>
                <button style={{ width: 36, height: 36, borderRadius: 10,
                  background: "var(--violet)", color: "#fff", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer" }}>
                  <Ico.Play width="16" height="16"/>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, padding: "0 24px", textAlign: "center",
          fontSize: 13, color: "var(--ink-65)", fontStyle: "italic", lineHeight: 1.7 }}>
          「做到了。<br/>不是因為容易才做的。」
        </div>
      </Body>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px 30px",
        background: "linear-gradient(to top, var(--bg) 60%, transparent)" }}>
        <button className="lori-btn lori-btn-primary" style={{ width: "100%", height: 52,
          fontSize: 15, fontWeight: 700 }}>確認 · 收下 🥕</button>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1310 Block 列表
// ════════════════════════════════════════════════════════════
function BlockCard({ name, time, steps, progress, color, active }) {
  return (
    <div className="lori-card" style={{ padding: 0, overflow: "hidden",
      display: "flex", alignItems: "stretch",
      borderColor: active ? "var(--violet)" : "var(--hairline)",
      boxShadow: active ? "0 4px 12px rgba(155,125,184,0.18)" : "none" }}>
      <div style={{ width: 6, background: color }}/>
      <div style={{ flex: 1, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{name}</div>
          <div className="tabnum" style={{ fontSize: 13, fontWeight: 600,
            color: progress >= 1 ? "var(--green)" : "var(--ink-65)" }}>
            {Math.round(progress * 100)}%
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12,
          color: "var(--gray)", fontWeight: 500 }}>
          <span>⏱ {time}</span>
          <span>· {steps} step</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <PillBar value={progress} color={color} height={6} bg="#EFEBE1"/>
        </div>
      </div>
    </div>
  );
}

function Screen1310() {
  const blocks = [
    { name: "晨起序列",   time: "06:30 · 12 分", steps: 9,  progress: 1.00, color: "var(--hm-mint)" },
    { name: "午後復元",   time: "13:00 · 28 分", steps: 11, progress: 0.73, color: "var(--violet)", active: true },
    { name: "睡前整理",   time: "22:30 · 18 分", steps: 8,  progress: 0.00, color: "var(--hm-lavender)" },
    { name: "週末長式",   time: "週六 09:00 · 45 分", steps: 14, progress: 0.0, color: "var(--hm-sage)" },
    { name: "通勤路上",   time: "依出門時間 · 8 分", steps: 5,  progress: 0.4,  color: "var(--hm-sky)" },
  ];
  return (
    <Phone>
      <HeaderBar title="Routine 選擇"/>
      <Body padTop={106} padBottom={160}>
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {blocks.map((b, i) => <BlockCard key={i} {...b}/>)}
        </div>
      </Body>
      <AddBar label="新增 Block"/>
      <TabBar active="rt"/>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 131A Block 編輯
// ════════════════════════════════════════════════════════════
function FormRow({ label, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray)",
        letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: "var(--gray)" }}>{hint}</div>}
    </div>
  );
}

function TimePicker({ value }) {
  return (
    <div className="lori-input tabnum" style={{ display: "flex", alignItems: "center",
      justifyContent: "space-between", fontSize: 17, fontWeight: 600 }}>
      <span>{value}</span>
      <Ico.Chev width="16" height="16" stroke="var(--gray)"/>
    </div>
  );
}

function Screen131A() {
  return (
    <Phone>
      <HeaderBar title="編輯 Block" onSave/>
      <Body padTop={106} padBottom={120}>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 18 }}>
          <FormRow label="Block 名稱">
            <input className="lori-input" defaultValue="午後復元" placeholder="輸入名稱"/>
          </FormRow>
          <FormRow label="block-rise（最早啟動）" hint="到時間自動開機提示">
            <TimePicker value="13:00"/>
          </FormRow>
          <FormRow label="block-set（最晚啟動）" hint="超過此時間不再提醒">
            <TimePicker value="15:30"/>
          </FormRow>

          <div className="lori-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>立即開始</div>
              <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>跳到 1301 計時進行</div>
            </div>
            <button style={{ width: 52, height: 52, borderRadius: "50%",
              background: "var(--violet)", color: "#fff", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(155,125,184,0.35)", cursor: "pointer" }}>
              <Ico.Play width="22" height="22"/>
            </button>
          </div>

          {/* STEP BAR */}
          <button className="lori-card" style={{ height: 64, border: "none", background: "var(--card)",
            display: "flex", alignItems: "center", padding: "0 18px", cursor: "pointer",
            justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Ico.List width="22" height="22"/>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>編輯 Step 列表</div>
                <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>11 step · 28:00</div>
              </div>
            </div>
            <Ico.Chev width="18" height="18" stroke="var(--gray)"/>
          </button>

          <FormRow label="提示音">
            <div className="lori-input" style={{ display: "flex", alignItems: "center",
              justifyContent: "space-between", fontSize: 15 }}>
              <span>溫和木魚</span>
              <Ico.Chev width="16" height="16" stroke="var(--gray)"/>
            </div>
          </FormRow>
        </div>
      </Body>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1311 Step 列表
// ════════════════════════════════════════════════════════════
function StepRow({ idx, name, time, pre, active }) {
  return (
    <div className="lori-card" style={{ display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px",
      borderColor: active ? "var(--violet)" : "var(--hairline)" }}>
      <div className="tabnum" style={{ width: 22, fontSize: 13, color: "var(--gray)",
        fontWeight: 600, textAlign: "center" }}>{idx}</div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{name}</div>
      <div className="tabnum" style={{ fontSize: 13, color: "var(--ink-65)", fontWeight: 600 }}>{time}</div>
      <div style={{ width: 1, height: 22, background: "var(--hairline)" }}/>
      <div className="tabnum" style={{ fontSize: 11, color: "var(--gray)", fontWeight: 500,
        minWidth: 42, textAlign: "right" }}>+{pre}s</div>
    </div>
  );
}

function Screen1311() {
  const steps = [
    { idx: 1, name: "四式伸展 · 髖部開展", time: "1:30", pre: 10 },
    { idx: 2, name: "靜止 · 呼吸調節",     time: "0:10", pre: 5  },
    { idx: 3, name: "頸部側屈",            time: "0:20", pre: 10 },
    { idx: 4, name: "貓牛式",              time: "1:00", pre: 10, active: true },
    { idx: 5, name: "下犬式",              time: "1:30", pre: 10 },
    { idx: 6, name: "戰士二式（左）",       time: "1:00", pre: 10 },
    { idx: 7, name: "戰士二式（右）",       time: "1:00", pre: 10 },
    { idx: 8, name: "鴿子式（左）",         time: "2:00", pre: 15 },
    { idx: 9, name: "鴿子式（右）",         time: "2:00", pre: 15 },
    { idx:10, name: "嬰兒式",              time: "1:00", pre: 5  },
    { idx:11, name: "靜坐收尾",            time: "3:00", pre: 0  },
  ];
  return (
    <Phone>
      <HeaderBar title="Step · 午後復元" onSave rightLabel="完成"/>
      <Body padTop={106} padBottom={160}>
        {/* col headers */}
        <div style={{ padding: "0 30px 8px", display: "flex",
          fontSize: 11, color: "var(--gray)", fontWeight: 600,
          letterSpacing: 0.3, textTransform: "uppercase" }}>
          <div style={{ flex: 1 }}>名稱</div>
          <div style={{ width: 80, textAlign: "right" }}>時間</div>
          <div style={{ width: 60, textAlign: "right" }}>pre-buffer</div>
        </div>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {steps.map(s => <StepRow key={s.idx} {...s}/>)}
        </div>
      </Body>
      <AddBar label="新增 Step"/>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 131B Step 編輯
// ════════════════════════════════════════════════════════════
function NumberStepper({ value, suffix = "秒" }) {
  return (
    <div className="lori-input" style={{ display: "flex", alignItems: "center", padding: 0 }}>
      <button style={{ ...btnIcon, width: 46, height: 46, fontSize: 22, color: "var(--ink)" }}>－</button>
      <div className="tabnum" style={{ flex: 1, textAlign: "center", fontSize: 22, fontWeight: 600 }}>
        {value} <span style={{ fontSize: 13, color: "var(--gray)", fontWeight: 500 }}>{suffix}</span>
      </div>
      <button style={{ ...btnIcon, width: 46, height: 46, fontSize: 22, color: "var(--ink)" }}>＋</button>
    </div>
  );
}

function Screen131B() {
  return (
    <Phone>
      <HeaderBar title="編輯 Step" onSave/>
      <Body padTop={106} padBottom={36}>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 22 }}>
          <FormRow label="Step 名稱">
            <input className="lori-input" defaultValue="貓牛式"/>
          </FormRow>
          <FormRow label="花費秒數" hint="主要動作的執行時間">
            <NumberStepper value={60}/>
          </FormRow>
          <FormRow label="pre-buffer 秒數" hint="動作開始前的緩衝（預設 10）">
            <NumberStepper value={10}/>
          </FormRow>
          <FormRow label="備註">
            <input className="lori-input" placeholder="（選填）對自己說的話" style={{ height: 64 }}/>
          </FormRow>

          <div style={{ marginTop: 8, padding: 14, background: "rgba(155,125,184,0.08)",
            borderRadius: 12, fontSize: 12, color: "var(--ink-65)", lineHeight: 1.6 }}>
            預覽：<span style={{ color: "var(--violet)", fontWeight: 600 }}>+10s</span> 緩衝 →
            <span className="tabnum" style={{ color: "var(--navy)", fontWeight: 600 }}> 1:00</span> 倒數。
            總計 <span className="tabnum" style={{ fontWeight: 600 }}>1:10</span>。
          </div>
        </div>
      </Body>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1320 Routine 日期列表
// ════════════════════════════════════════════════════════════
function Screen1320() {
  const days = [
    { label: "今日 · 5月 12 (二)", sub: "午後復元 · 進行中",  progress: 0.73, today: true,  color: "var(--mint)" },
    { label: "5月 11 (一)",        sub: "晨 + 午 + 睡前 · 3 block", progress: 0.92, color: "rgba(155,125,184,0.42)" },
    { label: "5月 10 (日)",        sub: "週末長式 · 1 block",  progress: 1.00, color: "rgba(155,125,184,0.32)" },
    { label: "5月 9 (六)",         sub: "全跳過（生理期）",     progress: 0.0,  color: "rgba(176,173,166,0.20)" },
    { label: "5月 8 (五)",         sub: "晨起序列 only",       progress: 0.45, color: "rgba(155,125,184,0.18)" },
    { label: "5月 7 (四)",         sub: "晨 + 午 · 2 block",   progress: 0.78, color: "rgba(155,125,184,0.14)" },
  ];
  return (
    <Phone>
      <HeaderBar title="Routine 回顧"/>
      <Body padTop={106} padBottom={100}>
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {days.map((d, i) => <DateStackRow key={i} {...d}/>)}
        </div>
      </Body>
      <TabBar active="rt"/>
    </Phone>
  );
}

Object.assign(window, {
  Screen1300, Screen1301, Screen1302, Screen1310, Screen131A,
  Screen1311, Screen131B, Screen1320,
  BlockCard, StepRow, FormRow, TimePicker, NumberStepper,
});
