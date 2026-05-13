/* global React, Phone, StatusBar, Home, TabBar, DateBar, CheckCircle, AddBar, HeaderBar,
   Body, RingProgress, PillBar, heatColor, pseudo, LORI_FACES, Ico, btnIcon */

// ════════════════════════════════════════════════════════════
// 1000 封面
// ════════════════════════════════════════════════════════════
function Screen1000() {
  return (
    <Phone dark>
      <StatusBar dark/>
      <div style={{ position: "absolute", inset: 0, padding: "0 32px",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div className="ascii" style={{ color: "rgba(168,216,190,0.92)", fontSize: 22,
          lineHeight: 1.2, marginTop: -40 }}>{LORI_FACES[1]}</div>
        <div style={{ marginTop: 48, fontSize: 28, fontWeight: 600, color: "#F0ECE2",
          letterSpacing: 0.06 }}>🥕 小蘿日誌 🥕</div>
        <div style={{ marginTop: 8, fontSize: 13, color: "rgba(240,236,226,0.55)",
          letterSpacing: 0.3 }}>Lori Diary · 第 12 天</div>
      </div>
      <div style={{ position: "absolute", bottom: 80, left: 24, right: 24 }}>
        <button className="lori-btn lori-btn-primary" style={{ width: "100%", height: 56,
          fontSize: 16, fontWeight: 600, letterSpacing: 0.3 }}>
          START
        </button>
        <div style={{ marginTop: 14, textAlign: "center", fontSize: 12,
          color: "rgba(240,236,226,0.45)" }}>v0.1 · 給知晞</div>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1100 儀表板
// ════════════════════════════════════════════════════════════
function Heatmap({ cols = 16, rows = 7, cell = 14, gap = 3 }) {
  return (
    <div style={{ display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
      gridAutoRows: cell, gap, justifyContent: "center" }}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const isFuture = i > cols * rows - 6;
        const c = isFuture ? "#F2F0ED" : heatColor(i);
        return <div key={i} style={{ width: cell, height: cell, borderRadius: 3, background: c }}/>;
      })}
    </div>
  );
}

function MiniCalendar({ month = "五月", year = 2026, today = 12 }) {
  const days = ["日","一","二","三","四","五","六"];
  const startWd = 4;          // May 1 2026 = Fri (index 5) — 用 4 看起來像示意
  const total = 31;
  const cells = [];
  for (let i = 0; i < startWd; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  return (
    <div className="lori-card" style={{ margin: "0 16px", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{year} · {month}</div>
        <div style={{ display: "flex", gap: 4, color: "var(--gray)" }}>
          <button style={btnIcon}><Ico.ChevL width="16" height="16"/></button>
          <button style={btnIcon}><Ico.Chev width="16" height="16"/></button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4,
        fontSize: 11, color: "var(--gray)", marginBottom: 6 }}>
        {days.map(d => <div key={d} style={{ textAlign: "center", fontWeight: 500 }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} style={{ height: 32 }}/>;
          const seed = i + 10;
          const c = d <= today ? heatColor(seed) : "transparent";
          const isToday = d === today;
          return (
            <div key={i} style={{
              height: 32, borderRadius: 8, position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: c,
              border: isToday ? "1.5px solid var(--violet)" : "none",
              color: d <= today ? "var(--ink)" : "var(--gray)",
              fontSize: 12, fontWeight: isToday ? 700 : 500,
            }}>{d}</div>
          );
        })}
      </div>
    </div>
  );
}

function Screen1100() {
  return (
    <Phone>
      <Body padBottom={100}>
        {/* top-right icons */}
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 4,
          zIndex: 5 }}>
          <button style={{ ...btnIcon, width: 40, height: 40, color: "var(--ink)" }}>
            <Ico.Gear width="20" height="20"/></button>
          <button style={{ ...btnIcon, width: 40, height: 40, color: "var(--ink)" }}>
            <Ico.Shop width="20" height="20"/></button>
        </div>

        {/* 🥕 積分 + 圓環 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: 8 }}>
          <div style={{ fontSize: 13, color: "var(--gray)", fontWeight: 500, letterSpacing: 0.3 }}>
            🥕 累積積分
          </div>
          <div className="tabnum" style={{ fontSize: 56, fontWeight: 700, color: "var(--carrot)",
            lineHeight: 1.1, letterSpacing: -0.5 }}>137</div>
          <div style={{ marginTop: 12, position: "relative" }}>
            <RingProgress value={0.72} size={172} stroke={12}
              label={<div style={{ textAlign: "center" }}>
                <div className="tabnum" style={{ fontSize: 38, fontWeight: 600, color: "var(--ink)" }}>72<span style={{ fontSize: 18, color: "var(--gray)" }}>%</span></div>
                <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 2, letterSpacing: 0.2 }}>今日完成</div>
              </div>}/>
          </div>
        </div>

        {/* 熱力圖 */}
        <div style={{ marginTop: 28, padding: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-65)" }}>近 16 週</div>
            <div style={{ fontSize: 11, color: "var(--gray)" }}>連續打卡 12 天</div>
          </div>
          <div className="lori-card" style={{ padding: 14 }}>
            <Heatmap cols={16} rows={7} cell={14} gap={3}/>
          </div>
        </div>

        {/* 月曆 */}
        <div style={{ marginTop: 16 }}>
          <MiniCalendar />
        </div>

        <div style={{ height: 12 }}/>
      </Body>
      <TabBar active="dash"/>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1110 進度條明細
// ════════════════════════════════════════════════════════════
function Screen1110() {
  const cats = [
    { name: "待辦事項",     k: "todo",   value: 0.83, color: "var(--hm-sky)",     count: "5 / 6" },
    { name: "日常循環",     k: "rt",     value: 0.50, color: "var(--gray)",        count: "3 / 6" },
    { name: "學習進度",     k: "lrn",    value: 0.62, color: "var(--hm-sun)",     count: "Day Quest 62%" },
  ];
  return (
    <Phone>
      <HeaderBar title="進度明細"/>
      <Body padTop={106} padBottom={36}>
        {/* date + overall */}
        <div style={{ padding: "0 16px" }}>
          <div style={{ fontSize: 13, color: "var(--gray)", fontWeight: 500 }}>2026 · 5月 12日 · 星期二</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
            <div className="tabnum" style={{ fontSize: 44, fontWeight: 700, color: "var(--ink)" }}>72<span style={{ fontSize: 22, color: "var(--gray)", marginLeft: 2 }}>%</span></div>
            <div style={{ fontSize: 13, color: "var(--ink-65)", fontWeight: 500 }}>整體完成度</div>
          </div>
          <div style={{ marginTop: 14, height: 14, borderRadius: 999,
            background: "rgba(168,216,190,0.22)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "72%", background: "var(--mint)",
              borderRadius: 999 }}/>
          </div>
        </div>

        <div style={{ marginTop: 28, padding: "0 16px",
          fontSize: 11, fontWeight: 600, color: "var(--gray)", letterSpacing: 0.4,
          textTransform: "uppercase" }}>分類明細</div>

        <div style={{ marginTop: 10, padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {cats.map(c => (
            <div key={c.k} className="lori-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</div>
                <div className="tabnum" style={{ fontSize: 13, color: "var(--ink-65)", fontWeight: 600 }}>
                  {Math.round(c.value * 100)}%
                </div>
              </div>
              <PillBar value={c.value} color={c.color} height={10} bg="#EFEBE1"/>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--gray)", fontWeight: 500 }}>{c.count}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, padding: "20px 16px", textAlign: "center",
          fontSize: 13, color: "var(--ink-65)", fontStyle: "italic", lineHeight: 1.7 }}>
          「妳每多學一個英文字，<br/>就離台灣遠一點。這是好事。」
        </div>
      </Body>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1200 TODO 當日
// ════════════════════════════════════════════════════════════
function TodoRow({ done, name, carrots, urgent = 0, swipeOpen = false }) {
  return (
    <div style={{ position: "relative" }}>
      {swipeOpen && (
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 76,
          background: "var(--wine)", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          fontSize: 14, fontWeight: 600 }}>
          <Ico.Trash width="20" height="20" stroke="#fff"/>
        </div>
      )}
      <div className="lori-card row" style={{
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
        transform: swipeOpen ? "translateX(-84px)" : "none",
        background: done ? "#F6F4EE" : "#fff",
        opacity: done ? 0.65 : 1,
      }}>
        <CheckCircle done={done}/>
        <div style={{ flex: 1, fontSize: 15,
          textDecoration: done ? "line-through" : "none",
          color: done ? "var(--gray)" : "var(--ink)" }}>{name}</div>
        {urgent > 0 && (
          <div style={{ display: "flex", gap: 1, color: "var(--wine)", fontSize: 16, fontWeight: 700,
            letterSpacing: -1 }}>
            {"!".repeat(urgent)}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--carrot)",
          fontSize: 13, fontWeight: 600 }}>
          🥕 <span className="tabnum">{carrots}</span>
        </div>
      </div>
    </div>
  );
}

function Screen1200() {
  const list = [
    { name: "晨起 IELTS 單字 30 個",     done: true,  carrots: 5 },
    { name: "回信給荷蘭 SAP 招募",       done: false, carrots: 12, urgent: 2 },
    { name: "煮紫米栗子飯（試驗版）",     done: false, carrots: 8 },
    { name: "象山步道 30 分鐘",          done: false, carrots: 6, swipeOpen: true },
    { name: "寫今天的 LinkedIn 貼文",     done: false, carrots: 4 },
    { name: "確認房屋租約細節",          done: false, carrots: 3, urgent: 1 },
    { name: "睡前讀 30 分鐘", done: true,  carrots: 5 },
    { name: "喝水 2 公升",      done: true,  carrots: 3 },
  ];
  return (
    <Phone>
      <Body padTop={54} padBottom={160}>
        {/* page title */}
        <div style={{ padding: "10px 16px 14px" }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}>待辦</div>
        </div>
        <DateBar date="今日 · 5月 12 (二)" progress={0.5} isToday/>
        <div style={{ padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((t, i) => <TodoRow key={i} {...t}/>)}
        </div>
      </Body>
      <AddBar label="新增待辦"/>
      <TabBar active="todo"/>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1210 TODO 列表（日期堆疊）
// ════════════════════════════════════════════════════════════
function DateStackRow({ label, sub, progress, color, today = false }) {
  return (
    <div style={{
      borderRadius: 12, padding: "18px 18px", position: "relative", overflow: "hidden",
      background: color, color: today ? "#fff" : "var(--ink)",
      boxShadow: today ? "0 6px 16px rgba(168,216,190,0.35)" : "none",
    }}>
      {/* progress fill */}
      <div style={{ position: "absolute", inset: 0,
        background: `linear-gradient(to right, rgba(255,255,255,${today ? 0.2 : 0.4}) ${progress * 100}%, transparent ${progress * 100}%)`,
        pointerEvents: "none" }}/>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between",
        alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>{sub}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="tabnum" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{Math.round(progress * 100)}<span style={{ fontSize: 13, opacity: 0.7 }}>%</span></div>
        </div>
      </div>
    </div>
  );
}

function Screen1210() {
  const days = [
    { label: "今日 · 5月 12 (二)", sub: "5 / 8 完成", progress: 0.62, today: true,  color: "var(--mint)" },
    { label: "昨日 · 5月 11 (一)", sub: "7 / 7 完成 · 滿勾",  progress: 1.00, color: "rgba(168,216,190,0.55)" },
    { label: "5月 10 (日)",        sub: "4 / 6 完成",         progress: 0.66, color: "rgba(168,216,190,0.42)" },
    { label: "5月 9 (六)",         sub: "0 / 5 完成 · 全跳過", progress: 0.0,  color: "rgba(168,216,190,0.28)" },
    { label: "5月 8 (五)",         sub: "5 / 6 完成",         progress: 0.83, color: "rgba(168,216,190,0.22)" },
    { label: "5月 7 (四)",         sub: "3 / 4 完成",         progress: 0.75, color: "rgba(168,216,190,0.18)" },
    { label: "5月 6 (三)",         sub: "6 / 6 完成 · 滿勾",   progress: 1.00, color: "rgba(168,216,190,0.14)" },
  ];
  return (
    <Phone>
      <HeaderBar title="TODO 歷史"/>
      <Body padTop={106} padBottom={100}>
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {days.map((d, i) => <DateStackRow key={i} {...d}/>)}
        </div>
      </Body>
      <TabBar active="todo"/>
    </Phone>
  );
}

Object.assign(window, {
  Screen1000, Screen1100, Screen1110, Screen1200, Screen1210,
  Heatmap, MiniCalendar, TodoRow, DateStackRow,
});
