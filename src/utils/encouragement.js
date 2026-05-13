// 小蘿日誌 — 鼓勵語系統（獨立模組）
// 從 helpers.js 抽出，支援分類對應場景與連續打卡特殊語

/**
 * 鼓勵語資料快取
 * @type {object|null}
 */
let _encouragements = null;

/**
 * 載入鼓勵語 JSON
 * @returns {Promise<object>}
 */
async function _loadEncouragements() {
  if (_encouragements) return _encouragements;
  try {
    const res = await fetch('encouragements.json');
    _encouragements = await res.json();
  } catch {
    _encouragements = _defaultEncouragements();
  }
  return _encouragements;
}

/**
 * 當 fetch 失敗時的最小備用資料
 */
function _defaultEncouragements() {
  return {
    daily: ['做得好！繼續加油！'],
    exercise: ['辛苦了！'],
    english: ['每天進步一點點。'],
    cooking: ['好好吃飯。'],
  };
}

// ===== 場景 → 分類對應表 =====

/**
 * 場景對應的鼓勵語分類
 * - todo 完成 → daily 類
 * - routine 完成 → exercise 類
 * - 學習完成 → english 類
 * - 烹飪 → cooking 類
 * - 其他 → daily 類（fallback）
 */
const SCENE_CATEGORY_MAP = {
  todo: 'daily',
  routine: 'exercise',
  learning: 'english',
  cooking: 'cooking',
};

// ===== 連續打卡特殊語 =====

const STREAK_MESSAGES = {
  3: '連續三天了。習慣正在萌芽。',
  7: '連續七天。妳已經是不一樣的人了。',
  30: '三十天。一個月。妳做到了。',
  100: '一百天。知晞。一百天。',
  365: '一整年。三百六十五天。這不是奇蹟，是妳一天一天走出來的。',
};

/**
 * 所有特殊打卡天數門檻（由大到小排序，方便 fallback）
 */
const STREAK_THRESHOLDS = [365, 100, 30, 7, 3];

/**
 * 根據分類取得一條隨機鼓勵語
 * @param {string} [category='daily'] - 分類名（daily/exercise/english/cooking）或場景名（todo/routine/learning）
 * @returns {Promise<string>}
 */
export async function getEncouragement(category = 'daily') {
  const data = await _loadEncouragements();

  // 先嘗試場景映射，再直接查分類
  const resolvedCategory = SCENE_CATEGORY_MAP[category] || category;
  const pool = data[resolvedCategory] || data.daily || ['做得好！'];

  // 若 pool 是字串（如舊版 streak7），直接回傳
  if (typeof pool === 'string') return pool;

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 根據連續打卡天數取得特殊語
 * - 精確命中門檻（3/7/30/100/365）時回傳對應語句
 * - 未命中則回傳 null（呼叫端可 fallback 到一般鼓勵語）
 * @param {number} days - 連續打卡天數
 * @returns {string|null}
 */
export function getStreakMessage(days) {
  if (typeof days !== 'number' || days < 1) return null;

  // 精確門檻命中
  if (STREAK_MESSAGES[days]) {
    return STREAK_MESSAGES[days];
  }

  return null;
}

/**
 * 供測試用：重設快取
 */
export function _resetCache() {
  _encouragements = null;
}

/**
 * 供測試用：直接注入資料（跳過 fetch）
 * @param {object} data
 */
export function _injectData(data) {
  _encouragements = data;
}

export { SCENE_CATEGORY_MAP, STREAK_MESSAGES, STREAK_THRESHOLDS };
