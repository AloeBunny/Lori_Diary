// 小蘿日誌 — 工具函式

/**
 * 靜默捕獲錯誤，以 debug 等級記錄
 * @param {*} err - 捕獲到的錯誤
 * @param {string} context - 描述發生位置的字串
 */
export function silentCatch(err, context = '') {
  if (typeof console !== 'undefined' && console.debug) {
    console.debug(`[silentCatch${context ? ': ' + context : ''}]`, err);
  }
}

/**
 * 取得今日日期字串 YYYY-MM-DD
 */
export function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 格式化秒數為 MM:SS
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * 偽隨機函式（seed 固定 → 每次 reload 一樣）
 * 用於熱力圖色彩
 */
export function pseudo(i) {
  const x = Math.sin(i * 9.123 + 1.7) * 10000;
  return x - Math.floor(x);
}

/**
 * 熱力圖色相（9 色 x 5 階）
 */
export const HEAT_HUES = [
  ['#F2F0ED', '#D4F0E3', '#A8E6CF', '#7DD4B0', '#4DC49A'],   // mint
  ['#F2F0ED', '#DDD0E8', '#C3AED6', '#9B7DD4', '#7E57C2'],   // lavender
  ['#F2F0ED', '#FADCDC', '#F4B8B8', '#EF9A9A', '#E57373'],   // coral
  ['#F2F0ED', '#D9F0FD', '#B3E5FC', '#81D4FA', '#4FC3F7'],   // sky
  ['#F2F0ED', '#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F'],   // sun
  ['#F2F0ED', '#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D'],   // peach
  ['#F2F0ED', '#FCE4EC', '#F8BBD0', '#F48FB1', '#F06292'],   // rose
  ['#F2F0ED', '#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784'],   // sage
  ['#F2F0ED', '#C8D5E3', '#7FA6C9', '#4A7FAF', '#1B3A5C'],   // navy
];

/**
 * 取得熱力圖某格的顏色
 */
export function heatColor(i) {
  const hue = HEAT_HUES[Math.floor(pseudo(i) * HEAT_HUES.length)];
  const level = Math.floor(pseudo(i + 999) * 5);
  return hue[level];
}

/**
 * ASCII 小蘿表情池（隨機）
 */
export const LORI_FACES = [
  ' (\\(\\\n( -ω-) ♡\no_(")(")' ,
  ' (\\(\\\n( >ω<) ✧\no_(")(")' ,
  ' (\\(\\\n( ´ω`) ~\no_(")(")' ,
  ' (\\(\\\n( ・×・) ?\no_(")(")' ,
  ' (\\(\\\n( òωó) ♫\no_(")(")' ,
];

/**
 * 隨機取一個小蘿表情
 */
export function randomLoriFace() {
  return LORI_FACES[Math.floor(Math.random() * LORI_FACES.length)];
}

/**
 * 鼓勵語系統
 */
let _encouragements = null;

export async function getEncouragement(category) {
  if (!_encouragements) {
    try {
      const res = await fetch('encouragements.json');
      _encouragements = await res.json();
    } catch(e) {
      silentCatch(e, 'encouragement fetch');
      return '做得好！繼續加油！';
    }
  }
  const pool = _encouragements[category] || _encouragements.daily || ['做得好！'];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 計算打卡統計（從今天往回算）
 * @param {Array<{date: string, pct: number}>} records - 從舊到新排列
 * @returns {{total: number, current: number, gaps: number}}
 *   total   — 過去 N 天中有打卡的天數
 *   current — 從最後一天往回算的連續打卡天數（遇到 gap 就停）
 *   gaps    — 裂口數（中間斷掉的天數）
 */
export function calcStreak(records) {
  let current = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].pct > 0) {
      current++;
    } else {
      break;
    }
  }

  let total = 0;
  let gaps = 0;
  for (let i = 0; i < records.length; i++) {
    if (records[i].pct > 0) {
      total++;
    } else {
      gaps++;
    }
  }

  return { total, current, gaps };
}

/**
 * 格式化日期為中文顯示
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string} 例如 "2026 · 5月 12日 · 星期二"
 */
export function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = weekDays[d.getDay()];
  return `${y} · ${m}月 ${day}日 · 星期${w}`;
}

/**
 * Toast 通知
 */
export function showToast(text) {
  const toast = document.createElement('div');
  toast.className = 'encouragement-toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== 日期工具 =====

/**
 * 將 Date 物件轉為 YYYY-MM-DD 本地日期字串
 * @param {Date} d
 * @returns {string}
 */
export function toLocalDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 取得前一天日期字串
 * @param {string} dateStr YYYY-MM-DD
 * @returns {string}
 */
export function prevDateStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return toLocalDateStr(d);
}

/**
 * 取得後一天日期字串
 * @param {string} dateStr YYYY-MM-DD
 * @returns {string}
 */
export function nextDateStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return toLocalDateStr(d);
}

/**
 * 將 YYYY-MM-DD 轉為 Date 物件
 * @param {string} dateStr YYYY-MM-DD
 * @returns {Date}
 */
export function parseDate(dateStr) {
  return new Date(dateStr + 'T00:00:00');
}
