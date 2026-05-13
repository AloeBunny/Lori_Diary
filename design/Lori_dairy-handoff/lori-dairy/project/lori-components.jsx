/* global React */
// 小蘿日誌 — 共用元件

// ───────── 圖示（線條式，16px / 20px / 24px） ─────────
const Ico = {
  Gear: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Shop: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M3 9h18l-1.5 11a2 2 0 0 1-2 1.7h-11A2 2 0 0 1 4.5 20zM8 9V6a4 4 0 0 1 8 0v3"/></svg>,
  Plus: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  Check: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M4 12l5 5L20 6"/></svg>,
  Chev: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M9 6l6 6-6 6"/></svg>,
  ChevL: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M15 6l-6 6 6 6"/></svg>,
  Skip: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M5 4l10 8-10 8zM19 5v14"/></svg>,
  Play: (p) => <svg viewBox="0 0 24 24" className="icon" {...p} fill="currentColor" stroke="none"><path d="M7 4v16l14-8z"/></svg>,
  List: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M4 6h16M4 12h16M4 18h11"/></svg>,
  Close: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  Dash: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="3" y="13" width="5" height="8" rx="2"/><rect x="10" y="11" width="11" height="10" rx="2"/></svg>,
  Today: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>,
  Timer: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 3h6"/></svg>,
  Book: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M4 4h12a4 4 0 0 1 4 4v13H8a4 4 0 0 1-4-4z"/><path d="M4 17a4 4 0 0 1 4-4h12"/></svg>,
  Bell: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M6 9a6 6 0 1 1 12 0v4l1.5 3h-15L6 13z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>,
  Cloud: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M7 18h10a4 4 0 0 0 1-7.9A6 6 0 0 0 6 9.4 4 4 0 0 0 7 18z"/></svg>,
  Speaker: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M5 9h4l5-4v14l-5-4H5z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg>,
  Info: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/></svg>,
  Bunny: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M7 12a5 5 0 0 1 10 0v8H7zM8 12L6 4l3 3M16 12l2-8-3 3"/><circle cx="10" cy="14" r="0.6" fill="currentColor"/><circle cx="14" cy="14" r="0.6" fill="currentColor"/></svg>,
  Dice: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="0.8" fill="currentColor"/><circle cx="16" cy="16" r="0.8" fill="currentColor"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/></svg>,
  Trash: (p) => <svg viewBox="0 0 24 24" className="icon" {...p}><path d="M5 7h14M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12"/></svg>,
};

// ───────── 狀態列 ─────────
function StatusBar({ dark = false, time = "9:41" }) {
  const c = dark ? "#fff" : "#000";
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex",
      alignItems: "center", justifyContent: "space-between", padding: "18px 30px 0", height: 54 }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: c, letterSpacing: 0 }}>{time}</span>
      <div style={{ position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)",
        width: 112, height: 32, borderRadius: 20, background: "#000" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="6.5" width="3" height="4.5" rx="0.6" fill={c}/><rect x="4.5" y="4.5" width="3" height="6.5" rx="0.6" fill={c}/><rect x="9" y="2" width="3" height="9" rx="0.6" fill={c}/><rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={c}/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={c} strokeOpacity="0.35" fill="none"/><rect x="2" y="2" width="16" height="8" rx="1.5" fill={c}/><path d="M23 4v4c0.6-0.2 1-0.9 1-2s-0.4-1.8-1-2z" fill={c} fillOpacity="0.4"/></svg>
      </div>
    </div>
  );
}

// ───────── Home Indicator ─────────
function Home({ dark = false }) {
  return <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex",
    justifyContent: "center", pointerEvents: "none", zIndex: 60 }}>
    <div style={{ width: 132, height: 5, borderRadius: 100,
      background: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.25)" }}/>
  </div>;
}

// ───────── 裝置外殼（不依賴 IOSDevice，自己畫一個對齊 spec） ─────────
function Phone({ children, dark = false, style = {} }) {
  return <div style={{
    width: "100%", height: "100%", borderRadius: 0, overflow: "hidden",
    position: "relative", background: dark ? "#3A3F47" : "var(--bg)",
    ...style,
  }} className="lori">
    <StatusBar dark={dark} />
    {children}
    <Home dark={dark}/>
  </div>;
}

// ───────── 底部 Tab Bar ─────────
function TabBar({ active = "dash" }) {
  const tabs = [
    { k: "dash",  label: "儀表板",  Ic: Ico.Dash  },
    { k: "todo",  label: "一般",    Ic: Ico.Today },
    { k: "rt",    label: "Routine", Ic: Ico.Timer },
    { k: "lrn",   label: "學習",    Ic: Ico.Book  },
  ];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 84,
      background: "rgba(250,248,243,0.94)", backdropFilter: "blur(14px)",
      borderTop: "1px solid var(--hairline)",
      paddingTop: 10, paddingBottom: 30, zIndex: 40,
      display: "flex", justifyContent: "space-around", alignItems: "flex-start" }}>
      {tabs.map(t => {
        const on = t.k === active;
        return (
          <div key={t.k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            color: on ? "var(--ink)" : "var(--gray)", minWidth: 60 }}>
            <t.Ic width="24" height="24" style={{ strokeWidth: on ? 1.9 : 1.5 }}/>
            <div style={{ fontSize: 11, fontWeight: on ? 600 : 500, letterSpacing: 0.04 }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ───────── DateBar（1200/1300/1400 共用） ─────────
function DateBar({ date = "今日 · 5月 12", progress = 0.62, isToday = true, onList }) {
  return (
    <div style={{ margin: "0 16px", marginTop: 4, position: "relative", height: 56,
      borderRadius: 12, background: "rgba(168,216,190,0.18)", overflow: "hidden",
      border: "1px solid rgba(168,216,190,0.4)" }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0,
        width: `${progress * 100}%`, background: "rgba(168,216,190,0.55)" }}/>
      <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center",
        padding: "0 14px", justifyContent: "space-between" }}>
        <button aria-label="prev" style={btnIcon}><Ico.ChevL width="18" height="18"/></button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{date}</div>
          <div style={{ fontSize: 11, color: "var(--ink-65)", marginTop: 2, fontWeight: 500 }}>
            完成度 {Math.round(progress * 100)}%
          </div>
        </div>
        <button aria-label={isToday ? "list" : "next"} style={btnIcon}>
          {isToday ? <Ico.List width="18" height="18"/> : <Ico.Chev width="18" height="18"/>}
        </button>
      </div>
    </div>
  );
}
const btnIcon = { width: 36, height: 36, border: "none", background: "transparent",
  color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0 };

// ───────── 圓形 checkbox ─────────
function CheckCircle({ done = false, color = "var(--mint)" }) {
  return (
    <div style={{ width: 24, height: 24, borderRadius: 999,
      border: done ? "none" : "1.5px solid var(--gray)",
      background: done ? color : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, transition: "all 0.2s" }}>
      {done && <svg width="14" height="14" viewBox="0 0 24 24" className="icon" stroke="#2a4a3a" strokeWidth="3"><path d="M4 12l5 5L20 6"/></svg>}
    </div>
  );
}

// ───────── 通用 +新增 浮動按鈕 ─────────
function AddBar({ label = "新增", color = "var(--violet)" }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 84, padding: "10px 16px 14px",
      background: "linear-gradient(to top, var(--bg) 70%, transparent)", zIndex: 30 }}>
      <button className="lori-btn" style={{ width: "100%", background: color, color: "#fff",
        borderColor: "transparent", height: 52, fontSize: 15, fontWeight: 600 }}>
        <Ico.Plus width="18" height="18"/> {label}
      </button>
    </div>
  );
}

// ───────── 頁面標題列（含返回 / 存檔） ─────────
function HeaderBar({ title, onBack = true, onSave = false, rightLabel = "存檔" }) {
  return (
    <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 8px", marginTop: 54 }}>
      <div style={{ width: 60 }}>
        {onBack && <button style={{ ...btnIcon, width: 48, height: 44, color: "var(--ink)" }}>
          <Ico.ChevL width="22" height="22"/></button>}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: 0.02 }}>{title}</div>
      <div style={{ width: 60, textAlign: "right", paddingRight: 8 }}>
        {onSave && <button style={{ border: "none", background: "transparent", color: "var(--violet)",
          fontSize: 15, fontWeight: 600, cursor: "pointer" }}>{rightLabel}</button>}
      </div>
    </div>
  );
}

// ───────── 內容滾動容器（避開狀態列、避開 tab bar） ─────────
function Body({ children, padTop = 54, padBottom = 100, style = {} }) {
  return <div className="lori-scroll" style={{
    position: "absolute", inset: 0, paddingTop: padTop, paddingBottom: padBottom,
    overflowY: "auto", ...style,
  }}>{children}</div>;
}

// ───────── 圓環進度（SVG） ─────────
function RingProgress({ value = 0.72, size = 180, stroke = 14,
                       track = "rgba(168,216,190,0.22)", color = "var(--mint)",
                       label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * value;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${c}`} strokeDashoffset="0" strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      {label && (
        <foreignObject x="0" y="0" width={size} height={size}>
          <div style={{ width: size, height: size, display: "flex", alignItems: "center",
            justifyContent: "center", flexDirection: "column", color: "var(--ink)" }}>
            {label}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

// ───────── 膠囊進度條 ─────────
function PillBar({ value = 0.6, color = "var(--mint)", height = 10, bg = "#EAE6DC" }) {
  return (
    <div style={{ height, background: bg, borderRadius: height, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(1, value) * 100}%`, background: color,
        borderRadius: height, transition: "width 0.4s ease" }}/>
    </div>
  );
}

// ───────── 熱力圖色相工具 ─────────
const HEAT_HUES = [
  ["#F2F0ED","#D4F0E3","#A8E6CF","#7DD4B0","#4DC49A"],   // mint
  ["#F2F0ED","#DDD0E8","#C3AED6","#9B7DD4","#7E57C2"],   // lavender
  ["#F2F0ED","#FADCDC","#F4B8B8","#EF9A9A","#E57373"],   // coral
  ["#F2F0ED","#D9F0FD","#B3E5FC","#81D4FA","#4FC3F7"],   // sky
  ["#F2F0ED","#FFF8E1","#FFECB3","#FFE082","#FFD54F"],   // sun
  ["#F2F0ED","#FFF3E0","#FFE0B2","#FFCC80","#FFB74D"],   // peach
  ["#F2F0ED","#FCE4EC","#F8BBD0","#F48FB1","#F06292"],   // rose
  ["#F2F0ED","#E8F5E9","#C8E6C9","#A5D6A7","#81C784"],   // sage
  ["#F2F0ED","#C8D5E3","#7FA6C9","#4A7FAF","#1B3A5C"],   // navy
];
// 偽隨機，但 seed 固定 → 每次 reload 一樣
function pseudo(i){ const x = Math.sin(i * 9.123 + 1.7) * 10000; return x - Math.floor(x); }
function heatColor(i){
  const hue = HEAT_HUES[Math.floor(pseudo(i) * HEAT_HUES.length)];
  const level = Math.floor(pseudo(i + 999) * 5);          // 0..4
  return hue[level];
}

// ───────── ASCII 小蘿（隨機表情） ─────────
const LORI_FACES = [
  ` (\\(\\\n( -ω-) ♡\no_(")(")\n`,
  ` (\\(\\\n( >ω<) ✧\no_(")(")\n`,
  ` (\\(\\\n( ´ω\`) ~\no_(")(")\n`,
  ` (\\(\\\n( ・×・) ?\no_(")(")\n`,
];

Object.assign(window, {
  Ico, StatusBar, Home, Phone, TabBar, DateBar,
  CheckCircle, AddBar, HeaderBar, Body, RingProgress, PillBar,
  HEAT_HUES, heatColor, pseudo, LORI_FACES, btnIcon,
});
