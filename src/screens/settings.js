// 小蘿日誌 — 設定頁（Screen 1500）
// HeaderBar「設定」→ 提示群組 → 提示音場景群組 → 個人化群組 → Footer

import { createStatusBar } from '../components/status-bar.js';
import { createHeaderBar } from '../components/header-bar.js';
import { createSettingRow, createToggleSwitch, createSlider } from '../components/setting-elements.js';
import { iconBell, iconSpeaker, iconCloud, iconBunny, iconInfo } from '../components/icons.js';
import { getSetting, setSetting } from '../db.js';
import { navigate } from '../router.js';
import { exportBackup } from '../utils/backup.js';
import { requestPermission } from '../utils/notification.js';

// ===== 預設值 =====
const DEFAULTS = {
  notify: true,
  sound: true,
  vol_master: 65,
  vol_routine: 45,
  vol_complete: 30,
  vol_encourage: 60,
};

/**
 * 渲染設定頁
 * @param {HTMLElement} root
 */
export async function renderSettings(root) {
  root.className = 'lori';

  const statusBar = createStatusBar();
  root.appendChild(statusBar);

  const header = createHeaderBar({
    title: '設定',
    showBack: true,
    onBack: () => navigate('#/dashboard'),
  });
  root.appendChild(header);

  // 滾動容器
  const body = document.createElement('div');
  body.className = 'lori-scroll';
  body.style.position = 'absolute';
  body.style.inset = '0';
  body.style.paddingTop = '106px';
  body.style.paddingBottom = '36px';
  body.style.overflowY = 'auto';

  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';

  // 讀取目前設定值
  const notify = await getSetting('notify', DEFAULTS.notify);
  const sound = await getSetting('sound', DEFAULTS.sound);
  const volMaster = await getSetting('vol_master', DEFAULTS.vol_master);
  const volRoutine = await getSetting('vol_routine', DEFAULTS.vol_routine);
  const volComplete = await getSetting('vol_complete', DEFAULTS.vol_complete);
  const volEncourage = await getSetting('vol_encourage', DEFAULTS.vol_encourage);

  // ===== 提示群組 =====
  const hintSection = _createSection('提示');

  const notifySwitch = createToggleSwitch({
    checked: notify,
    onChange: async (v) => {
      await setSetting('notify', v);
      if (v) {
        await requestPermission();
      }
    },
  });
  hintSection.card.appendChild(createSettingRow({
    icon: iconBell,
    label: '通知',
    sub: '每日早 8 點、晚 9 點',
    children: notifySwitch,
  }));

  const soundSwitch = createToggleSwitch({
    checked: sound,
    onChange: (v) => setSetting('sound', v),
  });
  hintSection.card.appendChild(createSettingRow({
    icon: iconSpeaker,
    label: '提示音',
    sub: '總開關 + 場景音量',
    last: true,
    children: soundSwitch,
  }));

  content.appendChild(hintSection.section);

  // ===== 提示音 · 場景群組 =====
  const soundSection = _createSection('提示音 · 場景');

  const sliderCard = document.createElement('div');
  sliderCard.className = 'lori-card lori-settings__slider-card';

  const sliderMaster = createSlider({
    value: volMaster,
    label: '總音量',
    onChange: (v) => setSetting('vol_master', v),
  });
  sliderCard.appendChild(sliderMaster);

  const sliderRoutine = createSlider({
    value: volRoutine,
    label: 'Routine 倒數',
    onChange: (v) => setSetting('vol_routine', v),
  });
  sliderCard.appendChild(sliderRoutine);

  const sliderComplete = createSlider({
    value: volComplete,
    label: '完成打勾',
    onChange: (v) => setSetting('vol_complete', v),
  });
  sliderCard.appendChild(sliderComplete);

  const sliderEncourage = createSlider({
    value: volEncourage,
    label: '鼓勵語 Toast',
    onChange: (v) => setSetting('vol_encourage', v),
  });
  sliderCard.appendChild(sliderEncourage);

  // 替換掉 section 預設的空 card
  soundSection.section.replaceChild(sliderCard, soundSection.card);

  content.appendChild(soundSection.section);

  // ===== 個人化群組 =====
  const personalSection = _createSection('個人化');

  personalSection.card.appendChild(createSettingRow({
    icon: iconCloud,
    label: '資料備份',
    sub: '匯出 IndexedDB → JSON',
    onClick: async () => {
      try {
        const filename = await exportBackup();
        const { showToast } = await import('../utils/helpers.js');
        showToast(`已匯出 ${filename}`);
      } catch (err) {
        console.error('備份匯出失敗:', err);
        const { showToast } = await import('../utils/helpers.js');
        showToast('匯出失敗，請再試一次');
      }
    },
  }));

  personalSection.card.appendChild(createSettingRow({
    icon: iconBunny,
    label: '小蘿自訂',
    sub: 'ASCII 表情、暱稱、鼓勵語頻率',
    onClick: () => {
      navigate('#/settings/lori');
    },
  }));

  personalSection.card.appendChild(createSettingRow({
    icon: iconInfo,
    label: '關於 · 給知晞',
    sub: 'v0.1 · 由懷安設計',
    last: true,
    onClick: () => {
      // Phase 7 實作
    },
  }));

  content.appendChild(personalSection.section);

  // ===== Footer =====
  const footer = document.createElement('div');
  footer.className = 'lori-settings__footer';
  footer.textContent = '小蘿日誌 · Lori Diary';
  const br = document.createElement('br');
  footer.appendChild(br);
  const footerLine2 = document.createTextNode('設計：懷安（@huaian）· 給知晞 · 2026');
  footer.appendChild(footerLine2);
  content.appendChild(footer);

  body.appendChild(content);
  root.appendChild(body);

  return () => {
    if (statusBar._cleanup) statusBar._cleanup();
    [sliderMaster, sliderRoutine, sliderComplete, sliderEncourage].forEach(s => {
      if (s.destroy) s.destroy();
    });
    root.className = '';
  };
}

/**
 * 建立設定群組（label + card 容器）
 * @param {string} title - 群組標題
 * @returns {{ section: HTMLElement, card: HTMLElement }}
 */
function _createSection(title) {
  const section = document.createElement('div');
  section.className = 'lori-settings__section';

  const label = document.createElement('div');
  label.className = 'lori-settings__group-label';
  label.textContent = title;
  section.appendChild(label);

  const card = document.createElement('div');
  card.className = 'lori-card';
  card.style.padding = '0';
  card.style.overflow = 'hidden';
  section.appendChild(card);

  return { section, card };
}
