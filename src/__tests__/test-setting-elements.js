// 小蘿日誌 — 設定元件測試（SettingRow + ToggleSwitch + Slider）

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('SettingRow — 模組匯出');

test('setting-elements.js 可被匯入', async () => {
  try {
    const mod = await import('../components/setting-elements.js');
    assert(typeof mod.createSettingRow === 'function', 'createSettingRow 應為函式');
    assert(typeof mod.createToggleSwitch === 'function', 'createToggleSwitch 應為函式');
    assert(typeof mod.setToggleSwitch === 'function', 'setToggleSwitch 應為函式');
    assert(typeof mod.createSlider === 'function', 'createSlider 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

// ===== SettingRow =====

suite('SettingRow — 建構與結構');

test('預設參數不報錯，回傳 HTMLElement', async () => {
  try {
    const { createSettingRow } = await import('../components/setting-elements.js');
    const el = createSettingRow();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-setting-row'), '應有 lori-setting-row class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('label 顯示正確', async () => {
  try {
    const { createSettingRow } = await import('../components/setting-elements.js');
    const el = createSettingRow({ label: '通知' });
    const name = el.querySelector('.lori-setting-row__name');
    assert(name, '應有 name 元素');
    assertEqual(name.textContent, '通知');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('sub 副標籤顯示', async () => {
  try {
    const { createSettingRow } = await import('../components/setting-elements.js');
    const el = createSettingRow({ label: '通知', sub: '每日早 8 點' });
    const sub = el.querySelector('.lori-setting-row__sub');
    assert(sub, '應有 sub 元素');
    assertEqual(sub.textContent, '每日早 8 點');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('無 sub 時不建立 sub 元素', async () => {
  try {
    const { createSettingRow } = await import('../components/setting-elements.js');
    const el = createSettingRow({ label: '通知' });
    const sub = el.querySelector('.lori-setting-row__sub');
    assert(!sub, '不應有 sub 元素');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('無 children 時顯示 chevron 箭頭', async () => {
  try {
    const { createSettingRow } = await import('../components/setting-elements.js');
    const el = createSettingRow({ label: '備份' });
    const chev = el.querySelector('.lori-setting-row__chev');
    assert(chev, '應有 chevron 元素');
    const svg = chev.querySelector('svg');
    assert(svg, 'chevron 內應有 SVG');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('有 children 時不顯示 chevron', async () => {
  try {
    const { createSettingRow } = await import('../components/setting-elements.js');
    const child = document.createElement('span');
    child.textContent = 'CTRL';
    const el = createSettingRow({ label: '通知', children: child });
    const chev = el.querySelector('.lori-setting-row__chev');
    assert(!chev, '不應有 chevron');
    assert(el.contains(child), 'children 應在 row 內');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('last=true 時加上 --last class', async () => {
  try {
    const { createSettingRow } = await import('../components/setting-elements.js');
    const el = createSettingRow({ label: '關於', last: true });
    assert(el.classList.contains('lori-setting-row--last'), '應有 --last class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('icon 工廠函式被呼叫', async () => {
  try {
    const { createSettingRow } = await import('../components/setting-elements.js');
    let called = false;
    const fakeIcon = (size) => {
      called = true;
      const el = document.createElement('span');
      el.textContent = 'ICON';
      return el;
    };
    createSettingRow({ label: '通知', icon: fakeIcon });
    assert(called, 'icon 工廠應被呼叫');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('onClick 點擊觸發回呼', async () => {
  try {
    const { createSettingRow } = await import('../components/setting-elements.js');
    let clicked = false;
    const el = createSettingRow({ label: '備份', onClick: () => { clicked = true; } });
    el.click();
    assert(clicked, 'onClick 應被觸發');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

// ===== ToggleSwitch =====

suite('ToggleSwitch — 建構與切換');

test('預設參數不報錯', async () => {
  try {
    const { createToggleSwitch } = await import('../components/setting-elements.js');
    const el = createToggleSwitch();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-toggle-switch'), '應有 lori-toggle-switch class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('checked=false 時有 --off class', async () => {
  try {
    const { createToggleSwitch } = await import('../components/setting-elements.js');
    const el = createToggleSwitch({ checked: false });
    assert(el.classList.contains('lori-toggle-switch--off'), '應有 --off');
    assert(!el.classList.contains('lori-toggle-switch--on'), '不應有 --on');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('checked=true 時有 --on class', async () => {
  try {
    const { createToggleSwitch } = await import('../components/setting-elements.js');
    const el = createToggleSwitch({ checked: true });
    assert(el.classList.contains('lori-toggle-switch--on'), '應有 --on');
    assert(!el.classList.contains('lori-toggle-switch--off'), '不應有 --off');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('role 和 aria-checked 正確', async () => {
  try {
    const { createToggleSwitch } = await import('../components/setting-elements.js');
    const el = createToggleSwitch({ checked: true });
    assertEqual(el.getAttribute('role'), 'switch');
    assertEqual(el.getAttribute('aria-checked'), 'true');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('點擊切換 checked 狀態', async () => {
  try {
    const { createToggleSwitch } = await import('../components/setting-elements.js');
    let changed = null;
    const el = createToggleSwitch({
      checked: false,
      onChange: (v) => { changed = v; },
    });
    el.click();
    assert(el._checked === true, '應切換為 true');
    assertEqual(changed, true, 'onChange 應收到 true');
    assertEqual(el.getAttribute('aria-checked'), 'true');
    // 再點一次
    el.click();
    assert(el._checked === false, '應切換回 false');
    assertEqual(changed, false, 'onChange 應收到 false');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('有 thumb 子元素', async () => {
  try {
    const { createToggleSwitch } = await import('../components/setting-elements.js');
    const el = createToggleSwitch();
    const thumb = el.querySelector('.lori-toggle-switch__thumb');
    assert(thumb, '應有 thumb 元素');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('setToggleSwitch 不觸發 callback', async () => {
  try {
    const { createToggleSwitch, setToggleSwitch } = await import('../components/setting-elements.js');
    let called = false;
    const el = createToggleSwitch({
      checked: false,
      onChange: () => { called = true; },
    });
    setToggleSwitch(el, true);
    assert(el._checked === true, '應變為 true');
    assert(!called, 'setToggleSwitch 不應觸發 onChange');
    assertEqual(el.getAttribute('aria-checked'), 'true');
    assert(el.classList.contains('lori-toggle-switch--on'), '應有 --on');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

// ===== Slider =====

suite('Slider — 建構與取值設值');

test('預設參數不報錯', async () => {
  try {
    const { createSlider } = await import('../components/setting-elements.js');
    const el = createSlider();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-slider'), '應有 lori-slider class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('初始值正確', async () => {
  try {
    const { createSlider } = await import('../components/setting-elements.js');
    const el = createSlider({ value: 75 });
    assertEqual(el.getValue(), 75);
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('標籤文字正確', async () => {
  try {
    const { createSlider } = await import('../components/setting-elements.js');
    const el = createSlider({ label: '總音量', value: 65 });
    const name = el.querySelector('.lori-slider__name');
    assertEqual(name.textContent, '總音量');
    const val = el.querySelector('.lori-slider__value');
    assertEqual(val.textContent, '65');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('setValue 更新值和顯示', async () => {
  try {
    const { createSlider } = await import('../components/setting-elements.js');
    const el = createSlider({ value: 50 });
    el.setValue(80);
    assertEqual(el.getValue(), 80);
    const val = el.querySelector('.lori-slider__value');
    assertEqual(val.textContent, '80');
    const fill = el.querySelector('.lori-slider__fill');
    assertEqual(fill.style.width, '80%');
    const thumb = el.querySelector('.lori-slider__thumb');
    assertEqual(thumb.style.left, '80%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('setValue 值限制在 0~100', async () => {
  try {
    const { createSlider } = await import('../components/setting-elements.js');
    const el = createSlider({ value: 50 });
    el.setValue(-10);
    assertEqual(el.getValue(), 0, '低於 0 應夾到 0');
    el.setValue(200);
    assertEqual(el.getValue(), 100, '超過 100 應夾到 100');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('有 track、fill、thumb 子元素', async () => {
  try {
    const { createSlider } = await import('../components/setting-elements.js');
    const el = createSlider();
    assert(el.querySelector('.lori-slider__track'), '應有 track');
    assert(el.querySelector('.lori-slider__fill'), '應有 fill');
    assert(el.querySelector('.lori-slider__thumb'), '應有 thumb');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('fill 和 thumb 初始位置正確', async () => {
  try {
    const { createSlider } = await import('../components/setting-elements.js');
    const el = createSlider({ value: 42 });
    const fill = el.querySelector('.lori-slider__fill');
    assertEqual(fill.style.width, '42%');
    const thumb = el.querySelector('.lori-slider__thumb');
    assertEqual(thumb.style.left, '42%');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
