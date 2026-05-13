// 小蘿日誌 — 商店元件
// GachaTile（抽獎格）+ ShelfCard（貨架商品卡）

/**
 * 建立抽獎格（2x2 排列用）
 * @param {object} opts
 * @param {number} opts.level - 等級 1-4
 * @param {string} opts.name - 級別名稱（散步級/探索級/遠征級/史詩級）
 * @param {number} opts.cost - 固定抽獎價格
 * @param {string} opts.color - 背景色
 * @param {string} opts.hint - 提示文字
 * @param {function|null} opts.onDraw - 點擊抽獎回調
 * @returns {HTMLElement}
 */
export function createGachaTile({
  level = 1,
  name = '',
  cost = 0,
  color = '#A8D8BE',
  hint = '',
  onDraw = null,
} = {}) {
  const tile = document.createElement('button');
  tile.className = 'lori-gacha-tile';
  tile.style.background = color;
  tile.dataset.level = String(level);

  // Lv 標籤
  const lvLabel = document.createElement('div');
  lvLabel.className = 'lori-gacha-tile__level';
  lvLabel.textContent = `Lv. ${level}`;
  tile.appendChild(lvLabel);

  // 名稱
  const nameEl = document.createElement('div');
  nameEl.className = 'lori-gacha-tile__name';
  nameEl.textContent = name;
  tile.appendChild(nameEl);

  // 提示
  const hintEl = document.createElement('div');
  hintEl.className = 'lori-gacha-tile__hint';
  hintEl.textContent = hint;
  tile.appendChild(hintEl);

  // 價格膠囊
  const pricePill = document.createElement('div');
  pricePill.className = 'lori-gacha-tile__price';

  const carrotEmoji = document.createTextNode('🥕 ');
  pricePill.appendChild(carrotEmoji);

  const priceNum = document.createElement('span');
  priceNum.className = 'tabnum';
  priceNum.textContent = String(cost);
  pricePill.appendChild(priceNum);

  tile.appendChild(pricePill);

  if (onDraw) {
    tile.addEventListener('click', () => onDraw(level));
  }

  return tile;
}

/**
 * 更新 GachaTile 的可用狀態
 * @param {HTMLElement} tile
 * @param {boolean} affordable - 是否買得起
 */
export function updateGachaTileState(tile, affordable) {
  if (affordable) {
    tile.style.opacity = '1';
    tile.disabled = false;
  } else {
    tile.style.opacity = '0.5';
    tile.disabled = true;
  }
}

/**
 * 建立貨架商品卡
 * @param {object} opts
 * @param {string} opts.name - 冒險名稱
 * @param {number} opts.level - 等級 1-4
 * @param {number} opts.cost - 隨機價格
 * @param {string} opts.accent - 強調色
 * @param {function|null} opts.onRedeem - 點擊兌換回調
 * @returns {HTMLElement}
 */
export function createShelfCard({
  name = '',
  level = 1,
  cost = 0,
  accent = '#A8D8BE',
  onRedeem = null,
} = {}) {
  const card = document.createElement('div');
  card.className = 'lori-shelf-card lori-card';
  card.dataset.level = String(level);

  // 等級色塊
  const lvBlock = document.createElement('div');
  lvBlock.className = 'lori-shelf-card__level';
  lvBlock.style.background = `linear-gradient(135deg, ${accent}25, ${accent}05)`;
  lvBlock.style.color = accent;
  lvBlock.textContent = `Lv.${level}`;
  card.appendChild(lvBlock);

  // 名稱
  const nameEl = document.createElement('div');
  nameEl.className = 'lori-shelf-card__name';
  nameEl.textContent = name;
  card.appendChild(nameEl);

  // 底部：價格 + 兌換按鈕
  const bottom = document.createElement('div');
  bottom.className = 'lori-shelf-card__bottom';

  const priceEl = document.createElement('div');
  priceEl.className = 'lori-shelf-card__price';
  priceEl.textContent = `🥕 ${cost}`;
  bottom.appendChild(priceEl);

  const redeemBtn = document.createElement('button');
  redeemBtn.className = 'lori-shelf-card__redeem';
  redeemBtn.textContent = '兌換';
  if (onRedeem) {
    redeemBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onRedeem({ name, level, cost });
    });
  }
  bottom.appendChild(redeemBtn);

  card.appendChild(bottom);

  return card;
}

/**
 * 更新 ShelfCard 的可用狀態
 * @param {HTMLElement} card
 * @param {boolean} affordable - 是否買得起
 */
export function updateShelfCardState(card, affordable) {
  const btn = card.querySelector('.lori-shelf-card__redeem');
  if (btn) {
    btn.disabled = !affordable;
    btn.style.opacity = affordable ? '1' : '0.4';
  }
}
