// Pace — Routine 養成 App
// 骨架版：tab 切換 + 資料結構 + IndexedDB 初始化

const DB_NAME = 'pace_db';
const DB_VERSION = 1;

// ===== IndexedDB =====
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      // TODO items
      if (!db.objectStoreNames.contains('todos')) {
        const store = db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type');       // general | routine | learning
        store.createIndex('date', 'date');
      }
      // Daily records (for heatmap)
      if (!db.objectStoreNames.contains('records')) {
        const store = db.createObjectStore('records', { keyPath: 'date' });
      }
      // Carrots
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ===== Tab Navigation =====
const tabs = document.querySelectorAll('.tab');
const content = document.getElementById('tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderTab(tab.dataset.tab);
  });
});

function renderTab(name) {
  switch (name) {
    case 'dashboard': renderDashboard(); break;
    case 'general':   renderGeneral();   break;
    case 'routine':   renderRoutine();   break;
    case 'learning':  renderLearning();  break;
  }
}

// ===== Dashboard =====
function renderDashboard() {
  content.innerHTML = `
    <div class="dashboard-header">
      <div class="carrot-count">🥕 0</div>
      <div class="carrot-label">小蘿的紅蘿蔔</div>
    </div>
    <div class="progress-ring">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#E8E4DE" stroke-width="8"/>
        <circle cx="60" cy="60" r="52" fill="none" stroke="#A8D8BE" stroke-width="8"
          stroke-dasharray="327" stroke-dashoffset="327" stroke-linecap="round"
          transform="rotate(-90 60 60)"/>
        <text x="60" y="65" text-anchor="middle" font-size="24" fill="#2D2D2D">0%</text>
      </svg>
    </div>
    <div class="heatmap-mini">
      ${Array(28).fill('<div class="heatmap-cell"></div>').join('')}
    </div>
  `;
}

// ===== General TODO =====
function renderGeneral() {
  content.innerHTML = `
    <h2 style="margin-bottom:16px">一般 TODO</h2>
    <ul class="todo-list" id="general-list"></ul>
    <button class="btn btn-primary" style="width:100%;margin-top:12px"
      onclick="addTodo('general')">+ 新增</button>
  `;
}

// ===== Routine Timer =====
let _timer = { interval: null, remaining: 0, stepIndex: 0, steps: [], running: false };

const DEFAULT_ROUTINES = {
  morning: {
    name: '晨間 Routine',
    steps: [
      { name: '起床', duration: 300 },
      { name: '運動', duration: 1500 },
      { name: '備餐', duration: 900 },
      { name: '梳洗', duration: 1200 },
      { name: '吃早餐', duration: 900 },
      { name: '出門準備', duration: 600 }
    ]
  },
  evening: {
    name: '晚間 Routine',
    steps: [
      { name: '做飯', duration: 1800 },
      { name: '健身', duration: 1200 },
      { name: '吃飯', duration: 1200 },
      { name: '家務', duration: 1800 },
      { name: '學習', duration: 2700 },
      { name: '放鬆', duration: 2700 },
      { name: '洗澡', duration: 1200 },
      { name: '就寢準備', duration: 600 }
    ]
  }
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function renderRoutine() {
  const step = _timer.steps[_timer.stepIndex];
  const stepName = step ? step.name : '尚未開始';
  const display = formatTime(_timer.remaining);

  content.innerHTML = `
    <h2 style="margin-bottom:16px">Routine</h2>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <button class="btn btn-secondary" onclick="loadRoutine('morning')" style="flex:1">晨間</button>
      <button class="btn btn-secondary" onclick="loadRoutine('evening')" style="flex:1">晚間</button>
    </div>
    <div class="timer-step-name">${stepName}</div>
    <div class="timer-display">${display}</div>
    <div class="timer-controls">
      <button class="btn btn-primary" onclick="toggleTimer()">${_timer.running ? '暫停' : '開始'}</button>
      <button class="btn btn-secondary" onclick="completeStep()">完成 ✓</button>
      <button class="btn btn-skip" onclick="skipStep()">跳過 →</button>
    </div>
    <div style="margin-top:8px;text-align:center">
      <button class="btn btn-skip" onclick="endRoutine()" style="color:#e74c3c">結束本輪</button>
    </div>
    <ul class="todo-list" id="routine-steps" style="margin-top:20px">
      ${_timer.steps.map((s, i) => `
        <li class="todo-item" style="${i < _timer.stepIndex ? 'opacity:0.4' : i === _timer.stepIndex ? 'border-color:var(--primary)' : ''}">
          <div class="todo-checkbox ${i < _timer.stepIndex ? 'checked' : ''}"></div>
          <span class="todo-title">${s.name}</span>
          <span class="todo-carrot">${formatTime(s.duration)}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function loadRoutine(key) {
  stopTimer();
  const routine = DEFAULT_ROUTINES[key];
  _timer.steps = routine.steps.map(s => ({ ...s }));
  _timer.stepIndex = 0;
  _timer.remaining = _timer.steps[0].duration;
  _timer.running = false;
  renderRoutine();
}

function toggleTimer() {
  if (!_timer.steps.length) return;
  if (_timer.running) {
    stopTimer();
  } else {
    _timer.running = true;
    _timer.interval = setInterval(() => {
      _timer.remaining--;
      if (_timer.remaining <= 0) {
        new Audio('data:audio/wav;base64,UklGRl9vT19teleQ==').play().catch(() => {});
        stopTimer();
      }
      renderRoutine();
    }, 1000);
  }
  renderRoutine();
}

function stopTimer() {
  clearInterval(_timer.interval);
  _timer.running = false;
}

async function completeStep() {
  stopTimer();
  await addCarrots(2);
  const step = _timer.steps[_timer.stepIndex];
  if (step) {
    const msg = await getEncouragement('exercise');
    showEncouragement(msg);
  }
  nextStep();
}

function skipStep() {
  stopTimer();
  nextStep();
}

function nextStep() {
  _timer.stepIndex++;
  if (_timer.stepIndex >= _timer.steps.length) {
    endRoutine();
    return;
  }
  _timer.remaining = _timer.steps[_timer.stepIndex].duration;
  renderRoutine();
}

async function endRoutine() {
  stopTimer();
  _timer = { interval: null, remaining: 0, stepIndex: 0, steps: [], running: false };
  showEncouragement('Routine 完成！');
  renderRoutine();
}

// ===== Learning TODO =====
function renderLearning() {
  content.innerHTML = `
    <h2 style="margin-bottom:16px">學習</h2>
    <ul class="todo-list" id="learning-list"></ul>
    <button class="btn btn-primary" style="width:100%;margin-top:12px"
      onclick="addTodo('learning')">+ 新增</button>
  `;
}

// ===== DB Helpers =====
let _db = null;

async function getDB() {
  if (!_db) _db = await openDB();
  return _db;
}

async function dbAdd(store, item) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).add(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(store, indexName, value) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const objStore = tx.objectStore(store);
    let req;
    if (indexName && value !== undefined) {
      req = objStore.index(indexName).getAll(value);
    } else {
      req = objStore.getAll();
    }
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbUpdate(store, item) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(store, id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ===== Carrots =====
async function getCarrots() {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction('stats', 'readonly');
    const req = tx.objectStore('stats').get('carrots');
    req.onsuccess = () => resolve(req.result?.value || 0);
    req.onerror = () => resolve(0);
  });
}

async function addCarrots(amount) {
  const current = await getCarrots();
  await dbUpdate('stats', { key: 'carrots', value: current + amount });
}

// ===== Encouragements =====
let _encouragements = null;

async function getEncouragement(category) {
  if (!_encouragements) {
    const res = await fetch('encouragements.json');
    _encouragements = await res.json();
  }
  const pool = _encouragements[category] || _encouragements.daily;
  return pool[Math.floor(Math.random() * pool.length)];
}

function showEncouragement(text) {
  const toast = document.createElement('div');
  toast.className = 'encouragement-toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== TODO CRUD =====
async function addTodo(type) {
  const title = prompt('名稱：');
  if (!title) return;

  const carrotMap = { general: 1, routine: 2, learning: 3 };
  const todo = {
    type,
    title,
    done: false,
    date: new Date().toISOString().slice(0, 10),
    carrots: carrotMap[type] || 1,
    createdAt: Date.now()
  };

  await dbAdd('todos', todo);
  renderTab(type);
}

async function toggleTodo(id, type) {
  const items = await dbGetAll('todos');
  const item = items.find(t => t.id === id);
  if (!item) return;

  item.done = !item.done;
  await dbUpdate('todos', item);

  if (item.done) {
    await addCarrots(item.carrots);
    const categoryMap = { general: 'daily', routine: 'exercise', learning: 'english' };
    const msg = await getEncouragement(categoryMap[type] || 'daily');
    showEncouragement(msg);
  }

  renderTab(type);
}

async function renderTodoList(type, listId) {
  const items = await dbGetAll('todos', 'type', type);
  const list = document.getElementById(listId);
  if (!list) return;

  list.innerHTML = items.map(item => `
    <li class="todo-item">
      <div class="todo-checkbox ${item.done ? 'checked' : ''}"
        onclick="toggleTodo(${item.id}, '${type}')"></div>
      <span class="todo-title" style="${item.done ? 'text-decoration:line-through;opacity:0.5' : ''}">${item.title}</span>
      <span class="todo-carrot">🥕${item.carrots}</span>
    </li>
  `).join('');
}

// ===== Updated Renders =====
async function renderDashboard() {
  const carrots = await getCarrots();
  const allTodos = await dbGetAll('todos');
  const today = new Date().toISOString().slice(0, 10);
  const todayItems = allTodos.filter(t => t.date === today);
  const doneCount = todayItems.filter(t => t.done).length;
  const totalCount = todayItems.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const offset = 327 - (327 * pct / 100);

  content.innerHTML = `
    <div class="dashboard-header">
      <div class="carrot-count">🥕 ${carrots}</div>
      <div class="carrot-label">小蘿的紅蘿蔔</div>
    </div>
    <div class="progress-ring">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#E8E4DE" stroke-width="8"/>
        <circle cx="60" cy="60" r="52" fill="none" stroke="#A8D8BE" stroke-width="8"
          stroke-dasharray="327" stroke-dashoffset="${offset}" stroke-linecap="round"
          transform="rotate(-90 60 60)"/>
        <text x="60" y="65" text-anchor="middle" font-size="24" fill="#2D2D2D">${pct}%</text>
      </svg>
    </div>
    <div class="heatmap-mini">
      ${Array(28).fill('<div class="heatmap-cell"></div>').join('')}
    </div>
  `;
}

async function renderGeneral() {
  content.innerHTML = `
    <h2 style="margin-bottom:16px">一般 TODO</h2>
    <ul class="todo-list" id="general-list"></ul>
    <button class="btn btn-primary" style="width:100%;margin-top:12px"
      onclick="addTodo('general')">+ 新增</button>
  `;
  await renderTodoList('general', 'general-list');
}

async function renderLearning() {
  content.innerHTML = `
    <h2 style="margin-bottom:16px">學習</h2>
    <ul class="todo-list" id="learning-list"></ul>
    <button class="btn btn-primary" style="width:100%;margin-top:12px"
      onclick="addTodo('learning')">+ 新增</button>
  `;
  await renderTodoList('learning', 'learning-list');
}

// ===== Init =====
(async () => {
  await getDB();
  renderDashboard();
})();
