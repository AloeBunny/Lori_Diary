// 小蘿日誌 — FormRow / TimePicker / NumberStepper 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

// ======================== FormRow ========================

suite('FormRow — 模組匯出');

test('form-elements.js 可被匯入', async () => {
  try {
    const mod = await import('../components/form-elements.js');
    assert(typeof mod.createFormRow === 'function', 'createFormRow 應為函式');
    assert(typeof mod.createTimePicker === 'function', 'createTimePicker 應為函式');
    assert(typeof mod.createNumberStepper === 'function', 'createNumberStepper 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('FormRow — 參數介面');

test('createFormRow 預設參數不報錯', async () => {
  try {
    const { createFormRow } = await import('../components/form-elements.js');
    const el = createFormRow();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-form-row'), '應有 lori-form-row class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createFormRow 顯示 label', async () => {
  try {
    const { createFormRow } = await import('../components/form-elements.js');
    const el = createFormRow({ label: 'Block 名稱' });
    const labelEl = el.querySelector('.lori-form-row__label');
    assert(labelEl !== null, '應有 label 元素');
    assertEqual(labelEl.textContent, 'Block 名稱');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createFormRow 顯示 hint', async () => {
  try {
    const { createFormRow } = await import('../components/form-elements.js');
    const el = createFormRow({ label: '欄位', hint: '這是提示' });
    const hintEl = el.querySelector('.lori-form-row__hint');
    assert(hintEl !== null, '應有 hint 元素');
    assertEqual(hintEl.textContent, '這是提示');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createFormRow 無 hint 時不建立 hint 元素', async () => {
  try {
    const { createFormRow } = await import('../components/form-elements.js');
    const el = createFormRow({ label: '欄位' });
    const hintEl = el.querySelector('.lori-form-row__hint');
    assertEqual(hintEl, null, '不應有 hint 元素');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createFormRow 接收 children（單個）', async () => {
  try {
    const { createFormRow } = await import('../components/form-elements.js');
    const input = document.createElement('input');
    input.className = 'lori-input';
    const el = createFormRow({ label: '名稱', children: input });
    const found = el.querySelector('.lori-input');
    assert(found !== null, '應包含傳入的 input 元素');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createFormRow 接收 children（陣列）', async () => {
  try {
    const { createFormRow } = await import('../components/form-elements.js');
    const a = document.createElement('div');
    a.className = 'child-a';
    const b = document.createElement('div');
    b.className = 'child-b';
    const el = createFormRow({ label: '名稱', children: [a, b] });
    assert(el.querySelector('.child-a') !== null, '應包含 child-a');
    assert(el.querySelector('.child-b') !== null, '應包含 child-b');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

// ======================== TimePicker ========================

suite('TimePicker — 參數介面');

test('createTimePicker 預設參數不報錯', async () => {
  try {
    const { createTimePicker } = await import('../components/form-elements.js');
    const el = createTimePicker();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-time-picker'), '應有 lori-time-picker class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTimePicker 顯示初始值', async () => {
  try {
    const { createTimePicker } = await import('../components/form-elements.js');
    const el = createTimePicker({ value: '13:00' });
    const display = el.querySelector('.lori-time-picker__display');
    assert(display !== null, '應有 display 元素');
    assertEqual(display.textContent, '13:00');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTimePicker 無值時顯示 placeholder', async () => {
  try {
    const { createTimePicker } = await import('../components/form-elements.js');
    const el = createTimePicker({ placeholder: '選擇時間' });
    const display = el.querySelector('.lori-time-picker__display');
    assertEqual(display.textContent, '選擇時間');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTimePicker 有 time input', async () => {
  try {
    const { createTimePicker } = await import('../components/form-elements.js');
    const el = createTimePicker({ value: '05:30' });
    const input = el.querySelector('input[type="time"]');
    assert(input !== null, '應有 time input');
    assertEqual(input.value, '05:30');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTimePicker getValue/setValue', async () => {
  try {
    const { createTimePicker } = await import('../components/form-elements.js');
    const el = createTimePicker({ value: '08:00' });
    assertEqual(el.getValue(), '08:00', 'getValue 應回傳 08:00');
    el.setValue('14:30');
    assertEqual(el.getValue(), '14:30', '設值後 getValue 應回傳 14:30');
    const display = el.querySelector('.lori-time-picker__display');
    assertEqual(display.textContent, '14:30', '顯示應更新');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createTimePicker 有 chevron 圖示', async () => {
  try {
    const { createTimePicker } = await import('../components/form-elements.js');
    const el = createTimePicker();
    const chev = el.querySelector('.lori-time-picker__chev');
    assert(chev !== null, '應有 chevron 區域');
    const svg = chev.querySelector('svg');
    assert(svg !== null, '應有 SVG 圖示');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

// ======================== NumberStepper ========================

suite('NumberStepper — 參數介面');

test('createNumberStepper 預設參數不報錯', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    const el = createNumberStepper();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-number-stepper'), '應有 lori-number-stepper class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createNumberStepper 顯示初始值', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    const el = createNumberStepper({ value: 60 });
    const numEl = el.querySelector('.lori-number-stepper__num');
    assert(numEl !== null, '應有數值元素');
    assertEqual(numEl.textContent, '60');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createNumberStepper 顯示單位', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    const el = createNumberStepper({ value: 10, unit: '分鐘' });
    const unitEl = el.querySelector('.lori-number-stepper__unit');
    assert(unitEl !== null, '應有單位元素');
    assert(unitEl.textContent.includes('分鐘'), '單位應為分鐘');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createNumberStepper 有加減按鈕', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    const el = createNumberStepper({ value: 10 });
    const btns = el.querySelectorAll('.lori-number-stepper__btn');
    assertEqual(btns.length, 2, '應有 2 個按鈕');
    assertEqual(btns[0].textContent, '－', '第一個應為減號');
    assertEqual(btns[1].textContent, '＋', '第二個應為加號');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createNumberStepper getValue/setValue', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    const el = createNumberStepper({ value: 30, min: 0, max: 100 });
    assertEqual(el.getValue(), 30, 'getValue 應回傳 30');
    el.setValue(75);
    assertEqual(el.getValue(), 75, '設值後 getValue 應回傳 75');
    const numEl = el.querySelector('.lori-number-stepper__num');
    assertEqual(numEl.textContent, '75', '顯示應更新');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createNumberStepper min 邊界保護', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    const el = createNumberStepper({ value: 0, min: 0, max: 100 });
    const minusBtn = el.querySelectorAll('.lori-number-stepper__btn')[0];
    assert(minusBtn.disabled === true, 'min 邊界時減號應 disabled');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createNumberStepper max 邊界保護', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    const el = createNumberStepper({ value: 100, min: 0, max: 100 });
    const plusBtn = el.querySelectorAll('.lori-number-stepper__btn')[1];
    assert(plusBtn.disabled === true, 'max 邊界時加號應 disabled');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createNumberStepper 點擊加號增值', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    let cbValue = null;
    const el = createNumberStepper({
      value: 10, min: 0, max: 100, step: 5,
      onChange: (v) => { cbValue = v; },
    });
    const plusBtn = el.querySelectorAll('.lori-number-stepper__btn')[1];
    plusBtn.click();
    assertEqual(el.getValue(), 15, '點一次加號應變 15');
    assertEqual(cbValue, 15, 'onChange 應收到 15');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createNumberStepper 點擊減號減值', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    const el = createNumberStepper({
      value: 20, min: 0, max: 100, step: 10,
    });
    const minusBtn = el.querySelectorAll('.lori-number-stepper__btn')[0];
    minusBtn.click();
    assertEqual(el.getValue(), 10, '點一次減號應變 10');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createNumberStepper 不會超出 min/max', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    const el = createNumberStepper({
      value: 2, min: 0, max: 5, step: 3,
    });
    // 加：2+3=5（剛好到 max）
    const plusBtn = el.querySelectorAll('.lori-number-stepper__btn')[1];
    plusBtn.click();
    assertEqual(el.getValue(), 5, '加到 5');
    // 再加：應該停在 5
    plusBtn.click();
    assertEqual(el.getValue(), 5, '不應超過 max');

    // 減：5-3=2
    const minusBtn = el.querySelectorAll('.lori-number-stepper__btn')[0];
    minusBtn.click();
    assertEqual(el.getValue(), 2, '減到 2');
    // 再減：2-3=-1 → clamp 到 0
    minusBtn.click();
    assertEqual(el.getValue(), 0, '不應低於 min');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createNumberStepper 初始值被 clamp', async () => {
  try {
    const { createNumberStepper } = await import('../components/form-elements.js');
    const el = createNumberStepper({ value: -10, min: 0, max: 100 });
    assertEqual(el.getValue(), 0, '負值應 clamp 到 min');
    const el2 = createNumberStepper({ value: 999, min: 0, max: 100 });
    assertEqual(el2.getValue(), 100, '超大值應 clamp 到 max');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
