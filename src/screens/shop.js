// 小蘿日誌 — 商店頁（Screen 1600）
// 紅蘿蔔餘額 + 抽獎區（2x2 GachaTile）+ 貨架區（2 欄 ShelfCard）+ 底部鼓勵語

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { iconDice, iconShop as iconShopIco, iconList } from '../components/icons.js';
import { createGachaTile, updateGachaTileState, createShelfCard, updateShelfCardState } from '../components/shop-elements.js';
import { navigate } from '../router.js';
import { getCarrots, addCarrots, dbAdd, dbGetAll } from '../db.js';
import { showToast } from '../utils/helpers.js';

// ===== 抽獎等級設定 =====
const GACHA_CONFIG = [
  { level: 1, key: 'lv1', name: '散步級', color: '#A8D8BE', hint: '零成本 · 通勤就能做' },
  { level: 2, key: 'lv2', name: '探索級', color: '#9B7DB8', hint: '半小時起 · 微踏出' },
  { level: 3, key: 'lv3', name: '遠征級', color: '#F4845F', hint: '半天 · 幾百元' },
  { level: 4, key: 'lv4', name: '史詩級', color: '#7B3B4C', hint: '一日行程 · 千元內' },
];

// 貨架強調色
const SHELF_ACCENTS = {
  1: '#A8D8BE',
  2: '#9B7DB8',
  3: '#F4845F',
  4: '#7B3B4C',
};

/**
 * 抽獎固定價格 = min + 2^lv
 */
export function gachaPrice(level, adventureData) {
  const key = `lv${level}`;
  const range = adventureData[key]?.cost || [5, 10];
  return range[0] + Math.pow(2, level);
}

/**
 * 貨架隨機價格 = min + dice(max - min)
 */
export function shelfPrice(level, adventureData) {
  const key = `lv${level}`;
  const range = adventureData[key]?.cost || [5, 10];
  const min = range[0];
  const max = range[1];
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * 從指定等級隨機抽一個微冒險
 */
export function drawAdventure(level, adventureData) {
  const key = `lv${level}`;
  const items = adventureData[key]?.items || [];
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * 產生貨架商品（每個等級隨機挑一些）
 */
function generateShelfItems(adventureData) {
  const items = [];
  // 每級各挑 1-2 個
  for (let lv = 1; lv <= 4; lv++) {
    const key = `lv${lv}`;
    const pool = adventureData[key]?.items || [];
    const count = lv <= 2 ? 2 : 1;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      items.push({
        name: shuffled[i],
        level: lv,
        cost: shelfPrice(lv, adventureData),
        accent: SHELF_ACCENTS[lv],
      });
    }
  }
  return items;
}

/**
 * 建立抽獎結果彈窗
 */
function showDrawResult(adventureName, cost, level, onReroll, onAccept) {
  const overlay = document.createElement('div');
  overlay.className = 'lori-shop-overlay';

  const sheet = document.createElement('div');
  sheet.className = 'lori-shop-sheet';

  const title = document.createElement('div');
  title.className = 'lori-shop-sheet__title';
  title.textContent = '🎲 抽到了！';
  sheet.appendChild(title);

  const levelLabel = document.createElement('div');
  levelLabel.className = 'lori-shop-sheet__level';
  levelLabel.textContent = `Lv.${level} · ${GACHA_CONFIG[level - 1]?.name || ''}`;
  sheet.appendChild(levelLabel);

  const resultText = document.createElement('div');
  resultText.className = 'lori-shop-sheet__result';
  resultText.textContent = adventureName;
  sheet.appendChild(resultText);

  const costLabel = document.createElement('div');
  costLabel.className = 'lori-shop-sheet__cost';
  costLabel.textContent = `已扣 🥕 ${cost}`;
  sheet.appendChild(costLabel);

  const btnRow = document.createElement('div');
  btnRow.className = 'lori-shop-sheet__btns';

  const rerollBtn = document.createElement('button');
  rerollBtn.className = 'lori-btn lori-btn-ghost';
  rerollBtn.style.flex = '1';
  rerollBtn.textContent = '🔄 換一個';
  rerollBtn.addEventListener('click', () => {
    overlay.remove();
    onReroll();
  });
  btnRow.appendChild(rerollBtn);

  const acceptBtn = document.createElement('button');
  acceptBtn.className = 'lori-btn lori-btn-primary';
  acceptBtn.style.flex = '1';
  acceptBtn.textContent = '接受';
  acceptBtn.addEventListener('click', () => {
    overlay.remove();
    onAccept();
  });
  btnRow.appendChild(acceptBtn);

  sheet.appendChild(btnRow);
  overlay.appendChild(sheet);

  return overlay;
}

/**
 * 渲染商店頁
 */
export function renderShop(root) {
  root.className = 'lori';
  let _adventureData = null;
  let _carrots = 0;
  let _rerollCount = 0;
  let _lastDrawLevel = 0;
  let _lastDrawCost = 0;
  const _gachaTiles = [];
  const _shelfCards = [];
  let _balanceNum = null;

  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  const header = createHeaderBar({
    title: '商店',
    showBack: true,
    onBack: () => navigate('#/dashboard'),
  });
  root.appendChild(header);

  // 可捲動主體
  const body = document.createElement('div');
  body.className = 'lori-scroll';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '36px';
  body.style.overflowY = 'auto';
  root.appendChild(body);

  // ===== 餘額區 =====
  const balanceSection = document.createElement('div');
  balanceSection.className = 'lori-shop__balance';

  const balanceLeft = document.createElement('div');

  const balanceLabel = document.createElement('div');
  balanceLabel.className = 'lori-shop__balance-label';
  balanceLabel.textContent = '🥕 餘額';
  balanceLeft.appendChild(balanceLabel);

  _balanceNum = document.createElement('div');
  _balanceNum.className = 'lori-shop__balance-num tabnum';
  _balanceNum.textContent = '0';
  balanceLeft.appendChild(_balanceNum);

  balanceSection.appendChild(balanceLeft);

  // 已兌換按鈕（預留）
  const historyBtn = document.createElement('button');
  historyBtn.className = 'lori-btn lori-btn-ghost';
  historyBtn.style.height = '42px';
  historyBtn.style.padding = '0 14px';
  historyBtn.style.fontSize = '13px';
  const listIcon = iconList(16);
  historyBtn.appendChild(listIcon);
  const historyLabel = document.createTextNode(' 已兌換');
  historyBtn.appendChild(historyLabel);
  historyBtn.addEventListener('click', () => {
    showToast('兌換紀錄開發中...');
  });
  balanceSection.appendChild(historyBtn);

  body.appendChild(balanceSection);

  // ===== 抽獎區 =====
  const gachaSection = document.createElement('div');
  gachaSection.className = 'lori-shop__section';

  const gachaHeader = document.createElement('div');
  gachaHeader.className = 'lori-shop__section-header';
  gachaHeader.appendChild(iconDice(14));
  const gachaTitle = document.createTextNode(' 抽獎 · 微冒險');
  gachaHeader.appendChild(gachaTitle);
  gachaSection.appendChild(gachaHeader);

  const gachaGrid = document.createElement('div');
  gachaGrid.className = 'lori-shop__gacha-grid';
  gachaSection.appendChild(gachaGrid);

  body.appendChild(gachaSection);

  // ===== 貨架區 =====
  const shelfSection = document.createElement('div');
  shelfSection.className = 'lori-shop__section';
  shelfSection.style.marginTop = '24px';

  const shelfHeader = document.createElement('div');
  shelfHeader.className = 'lori-shop__section-header';
  shelfHeader.appendChild(iconShopIco(14));
  const shelfTitle = document.createTextNode(' 貨架 · 直接挑');
  shelfHeader.appendChild(shelfTitle);
  shelfSection.appendChild(shelfHeader);

  const shelfGrid = document.createElement('div');
  shelfGrid.className = 'lori-shop__shelf-grid';
  shelfSection.appendChild(shelfGrid);

  body.appendChild(shelfSection);

  // ===== 底部鼓勵語 =====
  const encourageEl = document.createElement('div');
  encourageEl.className = 'lori-shop__encourage';
  encourageEl.textContent = '「獎勵不是為了讓妳做事，是這些事本身值得體驗。」';
  body.appendChild(encourageEl);

  // ===== 資料載入 =====
  async function loadData() {
    // 載入 adventures.json
    try {
      const res = await fetch('adventures.json');
      _adventureData = await res.json();
    } catch {
      _adventureData = { lv1: { items: [], cost: [5, 10] }, lv2: { items: [], cost: [15, 30] }, lv3: { items: [], cost: [50, 80] }, lv4: { items: [], cost: [100, 200] } };
    }

    // 載入紅蘿蔔
    _carrots = await getCarrots();
    _balanceNum.textContent = String(_carrots);

    // 建立抽獎格
    buildGachaTiles();

    // 建立貨架
    buildShelfCards();
  }

  function buildGachaTiles() {
    gachaGrid.textContent = '';
    _gachaTiles.length = 0;

    GACHA_CONFIG.forEach(cfg => {
      const price = gachaPrice(cfg.level, _adventureData);
      const tile = createGachaTile({
        level: cfg.level,
        name: cfg.name,
        cost: price,
        color: cfg.color,
        hint: cfg.hint,
        onDraw: () => handleDraw(cfg.level, price),
      });
      updateGachaTileState(tile, _carrots >= price);
      _gachaTiles.push({ tile, price, level: cfg.level });
      gachaGrid.appendChild(tile);
    });
  }

  function buildShelfCards() {
    shelfGrid.textContent = '';
    _shelfCards.length = 0;

    const items = generateShelfItems(_adventureData);
    items.forEach(item => {
      const card = createShelfCard({
        ...item,
        onRedeem: () => handleRedeem(item),
      });
      updateShelfCardState(card, _carrots >= item.cost);
      _shelfCards.push({ card, cost: item.cost });
      shelfGrid.appendChild(card);
    });
  }

  function refreshBalanceUI() {
    _balanceNum.textContent = String(_carrots);
    // 更新抽獎格可用性
    _gachaTiles.forEach(g => updateGachaTileState(g.tile, _carrots >= g.price));
    // 更新貨架可用性
    _shelfCards.forEach(s => updateShelfCardState(s.card, _carrots >= s.cost));
  }

  // ===== 抽獎邏輯 =====
  async function handleDraw(level, price) {
    if (_carrots < price) {
      showToast('紅蘿蔔不夠！再努力一下 🥕');
      return;
    }

    // 扣紅蘿蔔
    await addCarrots(-price);
    _carrots -= price;
    refreshBalanceUI();

    // 隨機抽一個
    const adventure = drawAdventure(level, _adventureData);
    if (!adventure) {
      showToast('此等級暫無冒險可抽');
      return;
    }

    _rerollCount = 0;
    _lastDrawLevel = level;
    _lastDrawCost = price;

    // 顯示結果彈窗
    showResult(adventure, price, level);
  }

  function showResult(adventure, cost, level) {
    const overlay = showDrawResult(adventure, cost, level,
      // 重抽
      async () => {
        const rerollCost = _rerollCount >= (_adventureData.free_rerolls || 1)
          ? (_adventureData.reroll_cost || 2)
          : 0;

        if (rerollCost > 0 && _carrots < rerollCost) {
          showToast('紅蘿蔔不夠重抽！');
          // 直接接受
          await acceptAdventure(adventure, cost, level);
          return;
        }

        if (rerollCost > 0) {
          await addCarrots(-rerollCost);
          _carrots -= rerollCost;
          refreshBalanceUI();
        }

        _rerollCount++;

        const newAdventure = drawAdventure(level, _adventureData);
        if (!newAdventure) {
          showToast('沒有其他冒險了');
          await acceptAdventure(adventure, cost, level);
          return;
        }
        showResult(newAdventure, cost + rerollCost, level);
      },
      // 接受
      async () => {
        await acceptAdventure(adventure, cost, level);
      },
    );
    root.appendChild(overlay);
  }

  async function acceptAdventure(adventure, totalCost, level) {
    // 寫入 shop_history
    await dbAdd('shop_history', {
      type: 'gacha',
      level,
      name: adventure,
      cost: totalCost,
      status: 'active',
      date: new Date().toISOString(),
    });
    showToast(`已獲得微冒險：${adventure}`);
  }

  // ===== 貨架兌換 =====
  async function handleRedeem(item) {
    if (_carrots < item.cost) {
      showToast('紅蘿蔔不夠！再努力一下 🥕');
      return;
    }

    // 扣紅蘿蔔
    await addCarrots(-item.cost);
    _carrots -= item.cost;
    refreshBalanceUI();

    // 寫入 shop_history
    await dbAdd('shop_history', {
      type: 'shelf',
      level: item.level,
      name: item.name,
      cost: item.cost,
      status: 'active',
      date: new Date().toISOString(),
    });
    showToast(`已兌換：${item.name}`);
  }

  loadData();

  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    root.className = '';
  };
}
