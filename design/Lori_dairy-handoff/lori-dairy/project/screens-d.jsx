/* global React, Phone, TabBar, HeaderBar, Body, Ico, btnIcon */

// ════════════════════════════════════════════════════════════
// 1500 設定
// ════════════════════════════════════════════════════════════
function SettingRow({ icon: Ic, name, sub, right, accent = "var(--ink)", last }) {
  return (
    <div className="row" style={{ display: "flex", alignItems: "center", gap: 14,
      padding: "14px 16px",
      borderBottom: last ? "none" : "1px solid var(--hairline)" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(168,216,190,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
        <Ic width="20" height="20"/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{name}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>{sub}</div>}
      </div>
      {right || <Ico.Chev width="16" height="16" stroke="var(--gray)"/>}
    </div>
  );
}
function ToggleSwitch({ on = true }) {
  return (
    <div style={{ width: 50, height: 30, borderRadius: 999,
      background: on ? "var(--mint)" : "#D9D5CC", padding: 3,
      display: "flex", alignItems: "center", justifyContent: on ? "flex-end" : "flex-start" }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}/>
    </div>
  );
}

function Screen1500() {
  return (
    <Phone>
      <HeaderBar title="設定"/>
      <Body padTop={106} padBottom={36}>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
              letterSpacing: 0.4, textTransform: "uppercase", padding: "0 6px 8px" }}>提示</div>
            <div className="lori-card" style={{ padding: 0, overflow: "hidden" }}>
              <SettingRow icon={Ico.Bell} name="通知" sub="每日早 8 點、晚 9 點"
                right={<ToggleSwitch on/>}/>
              <SettingRow icon={Ico.Speaker} name="提示音" sub="總開關 + 場景音量" last/>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
              letterSpacing: 0.4, textTransform: "uppercase", padding: "0 6px 8px" }}>提示音 · 場景</div>
            <div className="lori-card" style={{ padding: "14px 16px",
              display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { name: "總音量", val: 0.65 },
                { name: "Routine 倒數", val: 0.45 },
                { name: "完成打勾", val: 0.30 },
                { name: "鼓勵語 Toast", val: 0.60 },
              ].map(s => (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: 13, marginBottom: 6 }}>
                    <span>{s.name}</span>
                    <span className="tabnum" style={{ color: "var(--gray)", fontSize: 12 }}>{Math.round(s.val*100)}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "#EFEBE1", position: "relative" }}>
                    <div style={{ height: "100%", borderRadius: 2,
                      width: `${s.val*100}%`, background: "var(--violet)" }}/>
                    <div style={{ position: "absolute", left: `${s.val*100}%`, top: -5, marginLeft: -7,
                      width: 14, height: 14, borderRadius: "50%", background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
              letterSpacing: 0.4, textTransform: "uppercase", padding: "0 6px 8px" }}>個人化</div>
            <div className="lori-card" style={{ padding: 0, overflow: "hidden" }}>
              <SettingRow icon={Ico.Cloud} name="資料備份" sub="上次：今日 13:42"/>
              <SettingRow icon={Ico.Bunny} name="小蘿自訂" sub="ASCII 表情、暱稱、鼓勵語頻率"/>
              <SettingRow icon={Ico.Info} name="關於 · 給知晞" sub="v0.1 · 由懷安設計" last/>
            </div>
          </div>

          <div style={{ padding: "8px 16px 0", textAlign: "center",
            fontSize: 11, color: "var(--gray)", lineHeight: 1.7 }}>
            小蘿日誌 · Lori Diary<br/>
            設計：懷安（@huaian）· 給知晞 · 2026
          </div>
        </div>
      </Body>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════
// 1600 商店
// ════════════════════════════════════════════════════════════
function GachaTile({ level, name, price, color, hint }) {
  return (
    <button style={{
      border: "none", padding: 16, borderRadius: 14, textAlign: "left", cursor: "pointer",
      background: color, color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column", gap: 8, minHeight: 116,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6,
        textTransform: "uppercase", opacity: 0.8 }}>Lv. {level}</div>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 0.2 }}>{name}</div>
      <div style={{ fontSize: 11, opacity: 0.8, lineHeight: 1.4 }}>{hint}</div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 4,
        background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: 999,
        alignSelf: "flex-start", fontSize: 13, fontWeight: 700 }}>
        🥕 <span className="tabnum">{price}</span>
      </div>
    </button>
  );
}

function ShelfCard({ name, level, price, accent }) {
  return (
    <div className="lori-card" style={{ padding: 12, display: "flex", flexDirection: "column",
      gap: 8 }}>
      <div style={{ height: 76, borderRadius: 8, background: `linear-gradient(135deg, ${accent}25, ${accent}05)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: accent, letterSpacing: 0.4 }}>
        Lv.{level}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, minHeight: 36 }}>{name}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--carrot)" }}>🥕 {price}</div>
        <button style={{ fontSize: 11, padding: "5px 10px", border: "1px solid var(--violet)",
          background: "transparent", color: "var(--violet)", fontWeight: 600,
          borderRadius: 8, cursor: "pointer" }}>兌換</button>
      </div>
    </div>
  );
}

function Screen1600() {
  const shelves = [
    { name: "用不常走的路線去上班", level: 1, price: 8,  accent: "#A8D8BE" },
    { name: "買一杯沒喝過的飲料", level: 1, price: 6,  accent: "#A8D8BE" },
    { name: "搭捷運到一年沒去的站", level: 2, price: 22, accent: "#9B7DB8" },
    { name: "去一間沒去過的超市", level: 2, price: 18, accent: "#9B7DB8" },
    { name: "獨立書店待一小時", level: 3, price: 65, accent: "#F4845F" },
    { name: "週末早起去早市", level: 4, price: 150, accent: "#7B3B4C" },
  ];
  return (
    <Phone>
      <HeaderBar title="商店"/>
      <Body padTop={106} padBottom={100}>
        {/* 餘額 */}
        <div style={{ padding: "0 16px 18px", display: "flex", alignItems: "center",
          justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)",
              letterSpacing: 0.4, textTransform: "uppercase" }}>🥕 餘額</div>
            <div className="tabnum" style={{ fontSize: 38, fontWeight: 700, color: "var(--carrot)",
              lineHeight: 1.1 }}>137</div>
          </div>
          <button className="lori-btn lori-btn-ghost" style={{ height: 42, padding: "0 14px",
            fontSize: 13 }}>
            <Ico.List width="16" height="16"/> 已兌換
          </button>
        </div>

        {/* 抽獎區 */}
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8,
            fontSize: 11, fontWeight: 600, color: "var(--gray)",
            letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 10 }}>
            <Ico.Dice width="14" height="14"/> 抽獎 · 微冒險
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <GachaTile level={1} name="散步級" price={8}   color="#A8D8BE" hint="零成本 · 通勤就能做"/>
            <GachaTile level={2} name="探索級" price={20}  color="#9B7DB8" hint="半小時起 · 微踏出"/>
            <GachaTile level={3} name="遠征級" price={65}  color="#F4845F" hint="半天 · 幾百元"/>
            <GachaTile level={4} name="史詩級" price={150} color="#7B3B4C" hint="一日行程 · 千元內"/>
          </div>
        </div>

        {/* 貨架區 */}
        <div style={{ marginTop: 24, padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8,
            fontSize: 11, fontWeight: 600, color: "var(--gray)",
            letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 10 }}>
            <Ico.Shop width="14" height="14"/> 貨架 · 直接挑
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {shelves.map((s, i) => <ShelfCard key={i} {...s}/>)}
          </div>
        </div>

        <div style={{ marginTop: 22, padding: "0 24px", textAlign: "center",
          fontSize: 12, color: "var(--ink-65)", fontStyle: "italic", lineHeight: 1.7 }}>
          「獎勵不是為了讓妳做事，<br/>是這些事本身值得體驗。」
        </div>
      </Body>
    </Phone>
  );
}

Object.assign(window, {
  Screen1500, Screen1600, SettingRow, ToggleSwitch, GachaTile, ShelfCard,
});
