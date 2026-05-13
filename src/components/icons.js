// 小蘿日誌 — SVG Icon 系統
// 從 lori-components.jsx Ico 物件提取，vanilla JS 版
// 每個函式回傳 SVG DOM Element

/**
 * 建立 SVG element 的工具函式
 * @param {string} tag - SVG 標籤名
 * @param {object} attrs - 屬性
 * @param {Element[]} children - 子元素
 * @returns {SVGElement}
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
 * 建立基底 SVG 容器
 */
function baseSvg(size, content, extraAttrs = {}) {
  const svg = svgEl('svg', {
    viewBox: '0 0 24 24',
    width: String(size),
    height: String(size),
    class: 'icon',
    ...extraAttrs,
  });
  content.forEach(c => svg.appendChild(c));
  return svg;
}

// ===== Icon 函式 =====

export function iconGear(size = 24) {
  return baseSvg(size, [
    svgEl('circle', { cx: '12', cy: '12', r: '3' }),
    svgEl('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' }),
  ]);
}

export function iconShop(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M3 9h18l-1.5 11a2 2 0 0 1-2 1.7h-11A2 2 0 0 1 4.5 20z' }),
    svgEl('path', { d: 'M8 9V6a4 4 0 0 1 8 0v3' }),
  ]);
}

export function iconPlus(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M12 5v14M5 12h14' }),
  ]);
}

export function iconCheck(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M4 12l5 5L20 6' }),
  ]);
}

export function iconChev(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M9 6l6 6-6 6' }),
  ]);
}

export function iconChevL(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M15 6l-6 6 6 6' }),
  ]);
}

export function iconSkip(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M5 4l10 8-10 8z' }),
    svgEl('path', { d: 'M19 5v14' }),
  ]);
}

export function iconPlay(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M7 4v16l14-8z' }),
  ], { fill: 'currentColor', stroke: 'none' });
}

export function iconList(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M4 6h16M4 12h16M4 18h11' }),
  ]);
}

export function iconClose(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M6 6l12 12M18 6L6 18' }),
  ]);
}

export function iconDash(size = 24) {
  return baseSvg(size, [
    svgEl('rect', { x: '3', y: '3', width: '8', height: '8', rx: '2' }),
    svgEl('rect', { x: '13', y: '3', width: '8', height: '5', rx: '2' }),
    svgEl('rect', { x: '3', y: '13', width: '5', height: '8', rx: '2' }),
    svgEl('rect', { x: '10', y: '11', width: '11', height: '10', rx: '2' }),
  ]);
}

export function iconToday(size = 24) {
  return baseSvg(size, [
    svgEl('rect', { x: '3', y: '5', width: '18', height: '16', rx: '2' }),
    svgEl('path', { d: 'M8 3v4M16 3v4M3 10h18' }),
  ]);
}

export function iconTimer(size = 24) {
  return baseSvg(size, [
    svgEl('circle', { cx: '12', cy: '13', r: '8' }),
    svgEl('path', { d: 'M12 9v4l3 2M9 3h6' }),
  ]);
}

export function iconBook(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M4 4h12a4 4 0 0 1 4 4v13H8a4 4 0 0 1-4-4z' }),
    svgEl('path', { d: 'M4 17a4 4 0 0 1 4-4h12' }),
  ]);
}

export function iconBell(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M6 9a6 6 0 1 1 12 0v4l1.5 3h-15L6 13z' }),
    svgEl('path', { d: 'M10 20a2 2 0 0 0 4 0' }),
  ]);
}

export function iconCloud(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M7 18h10a4 4 0 0 0 1-7.9A6 6 0 0 0 6 9.4 4 4 0 0 0 7 18z' }),
  ]);
}

export function iconSpeaker(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M5 9h4l5-4v14l-5-4H5z' }),
    svgEl('path', { d: 'M17 8a5 5 0 0 1 0 8' }),
  ]);
}

export function iconInfo(size = 24) {
  return baseSvg(size, [
    svgEl('circle', { cx: '12', cy: '12', r: '9' }),
    svgEl('path', { d: 'M12 11v5M12 8v.5' }),
  ]);
}

export function iconBunny(size = 24) {
  const c1 = svgEl('circle', { cx: '10', cy: '14', r: '0.6', fill: 'currentColor' });
  const c2 = svgEl('circle', { cx: '14', cy: '14', r: '0.6', fill: 'currentColor' });
  return baseSvg(size, [
    svgEl('path', { d: 'M7 12a5 5 0 0 1 10 0v8H7zM8 12L6 4l3 3M16 12l2-8-3 3' }),
    c1,
    c2,
  ]);
}

export function iconDice(size = 24) {
  const c1 = svgEl('circle', { cx: '8', cy: '8', r: '0.8', fill: 'currentColor' });
  const c2 = svgEl('circle', { cx: '16', cy: '16', r: '0.8', fill: 'currentColor' });
  const c3 = svgEl('circle', { cx: '12', cy: '12', r: '0.8', fill: 'currentColor' });
  return baseSvg(size, [
    svgEl('rect', { x: '3', y: '3', width: '18', height: '18', rx: '3' }),
    c1, c2, c3,
  ]);
}

export function iconTrash(size = 24) {
  return baseSvg(size, [
    svgEl('path', { d: 'M5 7h14M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12' }),
  ]);
}

// ===== 狀態列專用 icon =====

export function iconSignal(color = '#000') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '17');
  svg.setAttribute('height', '11');
  svg.setAttribute('viewBox', '0 0 17 11');
  const bars = [
    { x: 0, y: 6.5, w: 3, h: 4.5 },
    { x: 4.5, y: 4.5, w: 3, h: 6.5 },
    { x: 9, y: 2, w: 3, h: 9 },
    { x: 13.5, y: 0, w: 3, h: 11 },
  ];
  bars.forEach(b => {
    const rect = svgEl('rect', {
      x: String(b.x), y: String(b.y),
      width: String(b.w), height: String(b.h),
      rx: '0.6', fill: color,
    });
    svg.appendChild(rect);
  });
  return svg;
}

export function iconBattery(color = '#000') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '25');
  svg.setAttribute('height', '12');
  svg.setAttribute('viewBox', '0 0 25 12');
  // 外框
  const outline = svgEl('rect', {
    x: '0.5', y: '0.5', width: '21', height: '11', rx: '3',
    stroke: color, 'stroke-opacity': '0.35', fill: 'none',
  });
  // 填充
  const fill = svgEl('rect', {
    x: '2', y: '2', width: '16', height: '8', rx: '1.5', fill: color,
  });
  // 突起
  const cap = svgEl('path', {
    d: 'M23 4v4c0.6-0.2 1-0.9 1-2s-0.4-1.8-1-2z',
    fill: color, 'fill-opacity': '0.4',
  });
  svg.appendChild(outline);
  svg.appendChild(fill);
  svg.appendChild(cap);
  return svg;
}
