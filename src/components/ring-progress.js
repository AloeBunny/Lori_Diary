// 小蘿日誌 — 圓環進度圈元件
// SVG 圓環 + 中央 label，動畫 stroke-dashoffset 過渡

/**
 * 建立 SVG element 的工具函式（同 icons.js）
 */
function svgEl(tag, attrs = {}, children = []) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  children.forEach(c => el.appendChild(c));
  return el;
}

/**
 * 建立圓環進度圈
 * @param {object} opts
 * @param {number} opts.percent - 完成百分比 0~100
 * @param {string} opts.label - 中央文字（可為 HTML string 或純文字）
 * @param {number} opts.size - 圓環尺寸（px），預設 172
 * @param {number} opts.stroke - 線條寬度（px），預設 12
 * @param {string} opts.trackColor - 軌道色，預設 rgba(168,216,190,0.22)
 * @param {string} opts.color - 進度色，預設 var(--mint)
 * @returns {HTMLElement}
 */
export function createRingProgress({
  percent = 0,
  label = '',
  size = 172,
  stroke = 12,
  trackColor = 'rgba(168,216,190,0.22)',
  color = 'var(--mint)',
} = {}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dashLen = circumference * (clamped / 100);
  const halfSize = size / 2;

  // 軌道圓
  const trackCircle = svgEl('circle', {
    cx: String(halfSize),
    cy: String(halfSize),
    r: String(r),
    fill: 'none',
    stroke: trackColor,
    'stroke-width': String(stroke),
  });

  // 進度圓
  const progressCircle = svgEl('circle', {
    cx: String(halfSize),
    cy: String(halfSize),
    r: String(r),
    fill: 'none',
    stroke: color,
    'stroke-width': String(stroke),
    'stroke-dasharray': `${circumference} ${circumference}`,
    'stroke-dashoffset': String(circumference),  // 起始 = 全隱藏，動畫過渡到目標
    'stroke-linecap': 'round',
    transform: `rotate(-90 ${halfSize} ${halfSize})`,
  });

  const svg = svgEl('svg', {
    width: String(size),
    height: String(size),
    viewBox: `0 0 ${size} ${size}`,
    class: 'lori-ring-progress__svg',
  }, [trackCircle, progressCircle]);

  // 外層容器
  const container = document.createElement('div');
  container.className = 'lori-ring-progress';
  container.style.position = 'relative';
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.appendChild(svg);

  // 中央 label
  if (label) {
    const labelEl = document.createElement('div');
    labelEl.className = 'lori-ring-progress__label';
    labelEl.textContent = label;
    container.appendChild(labelEl);
  }

  // 動畫：下一幀開始過渡
  requestAnimationFrame(() => {
    const target = circumference - dashLen;
    progressCircle.style.transition = 'stroke-dashoffset 0.6s ease';
    progressCircle.setAttribute('stroke-dashoffset', String(target));
  });

  return container;
}

/**
 * 更新圓環進度
 * @param {HTMLElement} ringEl - createRingProgress 回傳的元素
 * @param {number} percent - 新百分比 0~100
 */
export function updateRingProgress(ringEl, percent) {
  const svg = ringEl.querySelector('.lori-ring-progress__svg');
  if (!svg) return;
  const progressCircle = svg.querySelectorAll('circle')[1];
  if (!progressCircle) return;

  const clamped = Math.max(0, Math.min(100, percent));
  const size = parseInt(svg.getAttribute('width'), 10);
  const strokeWidth = parseInt(progressCircle.getAttribute('stroke-width'), 10);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const target = circumference - circumference * (clamped / 100);

  progressCircle.style.transition = 'stroke-dashoffset 0.4s ease';
  progressCircle.setAttribute('stroke-dashoffset', String(target));
}
