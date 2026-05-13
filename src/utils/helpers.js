// 小蘿日誌 — 工具函式

/**
 * 取得今日日期字串 YYYY-MM-DD
 */
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
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
    } catch {
      return '做得好！繼續加油！';
    }
  }
  const pool = _encouragements[category] || _encouragements.daily || ['做得好！'];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 計算連續打卡天數（從今天往回算，完成度 > 0 就算一天）
 * @param {Array<{date: string, pct: number}>} records - 從舊到新排列
 * @returns {number}
 */
export function calcStreak(records) {
  let streak = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].pct > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
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
