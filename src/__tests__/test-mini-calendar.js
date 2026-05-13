// 小蘿日誌 — MiniCalendar 元件測試

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('MiniCalendar — 模組匯出');

test('mini-calendar.js 可被匯入', async () => {
  try {
    const mod = await import('../components/mini-calendar.js');
    assert(typeof mod.createMiniCalendar === 'function', 'createMiniCalendar 應為函式');
    assert(typeof mod.calendarDayColor === 'function', 'calendarDayColor 應為函式');
    assert(typeof mod.daysInMonth === 'function', 'daysInMonth 應為函式');
    assert(typeof mod.firstDayOfWeek === 'function', 'firstDayOfWeek 應為函式');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，建構測試跳過)');
    } else {
      throw e;
    }
  }
});

suite('MiniCalendar — 輔助函式');

test('daysInMonth 回傳正確天數', async () => {
  const { daysInMonth } = await import('../components/mini-calendar.js');
  // 2026 年各月天數
  assertEqual(daysInMonth(2026, 0), 31, '一月 31 天');
  assertEqual(daysInMonth(2026, 1), 28, '二月 28 天（非閏年）');
  assertEqual(daysInMonth(2026, 3), 30, '四月 30 天');
  assertEqual(daysInMonth(2024, 1), 29, '2024 二月 29 天（閏年）');
  assertEqual(daysInMonth(2026, 11), 31, '十二月 31 天');
});

test('firstDayOfWeek 回傳 0~6', async () => {
  const { firstDayOfWeek } = await import('../components/mini-calendar.js');
  const wd = firstDayOfWeek(2026, 4); // 2026 年 5 月
  assert(wd >= 0 && wd <= 6, `星期幾應在 0~6，得到 ${wd}`);
  // 2026-05-01 是星期五 = 5
  assertEqual(wd, 5, '2026-05-01 應為星期五');
});

test('calendarDayColor 完成度 0 回傳 transparent', async () => {
  const { calendarDayColor } = await import('../components/mini-calendar.js');
  assertEqual(calendarDayColor(1, 0), 'transparent', '0% 應為 transparent');
  assertEqual(calendarDayColor(5, -5), 'transparent', '負值應為 transparent');
});

test('calendarDayColor 有完成度時回傳色碼', async () => {
  const { calendarDayColor } = await import('../components/mini-calendar.js');
  const c = calendarDayColor(10, 50);
  assert(c.startsWith('#'), '50% 完成度應回傳色碼');
  assert(c !== 'transparent', '50% 不應為 transparent');
});

test('calendarDayColor 同參數同結果', async () => {
  const { calendarDayColor } = await import('../components/mini-calendar.js');
  assertEqual(calendarDayColor(3, 80), calendarDayColor(3, 80), '同參數應一致');
});

suite('MiniCalendar — DOM 結構');

test('createMiniCalendar 回傳有效 DOM', async () => {
  try {
    const { createMiniCalendar } = await import('../components/mini-calendar.js');
    const el = createMiniCalendar();
    assert(el instanceof HTMLElement, '應回傳 HTMLElement');
    assert(el.classList.contains('lori-mini-calendar'), '應有 lori-mini-calendar class');
    assert(el.classList.contains('lori-card'), '應有 lori-card class');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createMiniCalendar 有 7 個星期標頭', async () => {
  try {
    const { createMiniCalendar } = await import('../components/mini-calendar.js');
    const el = createMiniCalendar();
    const weekLabels = el.querySelectorAll('.lori-mini-calendar__week-label');
    assertEqual(weekLabels.length, 7, '應有 7 個星期標頭');
    // 確認中文
    const texts = Array.from(weekLabels).map(l => l.textContent);
    assert(texts.includes('日'), '應包含「日」');
    assert(texts.includes('六'), '應包含「六」');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createMiniCalendar 當日有 today class', async () => {
  try {
    const { createMiniCalendar } = await import('../components/mini-calendar.js');
    const el = createMiniCalendar();
    const todayEl = el.querySelector('.lori-mini-calendar__day--today');
    assert(todayEl !== null, '當月月曆應有 today 高亮');
    const today = new Date();
    assertEqual(todayEl.textContent, String(today.getDate()), 'today 應對應今天日期');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createMiniCalendar 有左右切月按鈕', async () => {
  try {
    const { createMiniCalendar } = await import('../components/mini-calendar.js');
    const el = createMiniCalendar();
    const navBtns = el.querySelectorAll('.lori-mini-calendar__nav-btn');
    assertEqual(navBtns.length, 2, '應有 2 個導航按鈕（上月/下月）');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createMiniCalendar 切月後標題更新', async () => {
  try {
    const { createMiniCalendar } = await import('../components/mini-calendar.js');
    const el = createMiniCalendar();
    const titleBefore = el.querySelector('.lori-mini-calendar__title').textContent;
    // 點下個月
    const nextBtn = el.querySelectorAll('.lori-mini-calendar__nav-btn')[1];
    nextBtn.click();
    const titleAfter = el.querySelector('.lori-mini-calendar__title').textContent;
    assert(titleBefore !== titleAfter, '切月後標題應改變');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createMiniCalendar onSelect 回呼有效', async () => {
  try {
    const { createMiniCalendar } = await import('../components/mini-calendar.js');
    let selectedDate = null;
    const el = createMiniCalendar({
      onSelect: (date) => { selectedDate = date; },
    });
    const days = el.querySelectorAll('.lori-mini-calendar__day');
    assert(days.length > 0, '應有日期格子');
    days[0].click();
    assert(selectedDate !== null, 'onSelect 應被觸發');
    assert(/^\d{4}-\d{2}-\d{2}$/.test(selectedDate), `日期格式應為 YYYY-MM-DD，得到 ${selectedDate}`);
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});

test('createMiniCalendar 有紀錄的日期有背景色', async () => {
  try {
    const { createMiniCalendar } = await import('../components/mini-calendar.js');
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const dateStr = `${y}-${m}-05`;
    const el = createMiniCalendar({
      records: [{ date: dateStr, percent: 80 }],
    });
    const dayCells = el.querySelectorAll('.lori-mini-calendar__day');
    // 找到 5 號那個格子
    let found = false;
    dayCells.forEach(cell => {
      if (cell.dataset.date === dateStr) {
        assert(cell.style.background !== 'transparent', '有紀錄的日期應有背景色');
        found = true;
      }
    });
    assert(found, '應找到目標日期的格子');
  } catch (e) {
    if (e.message && e.message.includes('document is not defined')) {
      console.log('    (Node 環境無 DOM，跳過)');
    } else {
      throw e;
    }
  }
});
