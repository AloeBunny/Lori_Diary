// 小蘿日誌 — Hash Router
// 支援 21 個畫面 + 巢狀路由（如 #/routine/1301）

/**
 * 路由表結構：
 * { pattern: string, handler: (params) => Element|void }
 * pattern 支援：
 *   - 靜態：'#/dashboard'
 *   - 參數：'#/routine/:id'
 */

const routes = [];
let _rootEl = null;
let _currentCleanup = null;
let _notFoundHandler = null;

/**
 * 註冊路由
 * @param {string} pattern - 路由 pattern，如 '#/dashboard' 或 '#/routine/:id'
 * @param {function} handler - (params) => void，負責渲染畫面到 rootEl
 */
function route(pattern, handler) {
  // 將 pattern 轉為正則
  const paramNames = [];
  const regexStr = pattern
    .replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    })
    .replace(/\//g, '\\/');
  const regex = new RegExp(`^${regexStr}$`);
  routes.push({ pattern, regex, paramNames, handler });
}

/**
 * 設定 404 handler
 */
function onNotFound(handler) {
  _notFoundHandler = handler;
}

/**
 * 清空容器內所有子節點（安全方式，不用 innerHTML）
 */
function clearEl(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/**
 * 解析當前 hash 並匹配路由
 */
function resolve() {
  const hash = location.hash || '#/cover';

  for (const r of routes) {
    const match = hash.match(r.regex);
    if (match) {
      const params = {};
      r.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      // 清理上一個畫面
      if (_currentCleanup && typeof _currentCleanup === 'function') {
        _currentCleanup();
      }

      // 清空 root
      if (_rootEl) {
        clearEl(_rootEl);
      }

      // 執行 handler，可能回傳 cleanup 函式
      _currentCleanup = r.handler(params) || null;
      return;
    }
  }

  // 404
  if (_notFoundHandler) {
    if (_rootEl) clearEl(_rootEl);
    _notFoundHandler();
  }
}

/**
 * 程式導航
 * @param {string} hash - 目標 hash，如 '#/dashboard'
 */
function navigate(hash) {
  location.hash = hash;
}

/**
 * 返回上一頁
 */
function goBack() {
  history.back();
}

/**
 * 初始化路由
 * @param {HTMLElement} rootEl - 渲染目標容器
 */
function initRouter(rootEl) {
  _rootEl = rootEl;
  window.addEventListener('hashchange', resolve);
  // 初始解析
  resolve();
}

/**
 * 取得目前路由的 root element
 */
function getRootEl() {
  return _rootEl;
}

/**
 * 取得目前 hash
 */
function currentHash() {
  return location.hash || '#/cover';
}

export {
  route,
  onNotFound,
  navigate,
  goBack,
  initRouter,
  getRootEl,
  currentHash,
  resolve,
};
