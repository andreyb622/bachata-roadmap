export const STATE_KEY = 'bachata-state-v2';
export const DEFAULT_ENTITY_NAME = 'Мой прогресс';
export const MAX_ENTITY_NAME_LEN = 50;

const OLD_PROGRESS_KEY = 'bachata-progress-v1';
const OLD_TAB_KEY = 'bachata-tab-v1';

const memStore = new Map();
let storageOk = false;
let state = null;

function testStorage() {
  try {
    const key = '__bachata_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function storageGet(key) {
  if (storageOk) {
    try {
      return localStorage.getItem(key);
    } catch {
      // fallback to memory
    }
  }
  return memStore.get(key) ?? null;
}

function storageSet(key, val) {
  if (storageOk) {
    try {
      localStorage.setItem(key, val);
      return;
    } catch {
      // fallback to memory
    }
  }
  memStore.set(key, val);
}

function storageRemove(key) {
  if (storageOk) {
    try {
      localStorage.removeItem(key);
      return;
    } catch {
      // fallback to memory
    }
  }
  memStore.delete(key);
}

function generateId() {
  return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultState() {
  const id = generateId();
  return {
    version: 2,
    entities: [{ id, name: DEFAULT_ENTITY_NAME, createdAt: new Date().toISOString() }],
    activeId: id,
    progress: {},
    tabs: {},
  };
}

export function getEntityById(id) {
  return state?.entities.find((entity) => entity.id === id) ?? null;
}

function cleanupOrphanProgress(progressObj) {
  if (!progressObj) return false;

  let changed = false;
  for (const key of Object.keys(progressObj)) {
    if (key.startsWith('3') && key.includes('-')) {
      delete progressObj[key];
      changed = true;
    }
  }
  return changed;
}

function saveState() {
  try {
    storageSet(STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function migrateFromV1() {
  let oldProgress = {};
  let oldTab = '0';

  try {
    const raw = storageGet(OLD_PROGRESS_KEY);
    if (raw) oldProgress = JSON.parse(raw);
  } catch {
    // ignore corrupt data
  }

  const savedTab = storageGet(OLD_TAB_KEY);
  if (savedTab) oldTab = savedTab;

  const id = generateId();
  state = {
    version: 2,
    entities: [{ id, name: DEFAULT_ENTITY_NAME, createdAt: new Date().toISOString() }],
    activeId: id,
    progress: { [id]: oldProgress },
    tabs: { [id]: oldTab },
  };

  cleanupOrphanProgress(state.progress[id]);
  saveState();
  storageRemove(OLD_PROGRESS_KEY);
  storageRemove(OLD_TAB_KEY);
}

export function initStorage() {
  storageOk = testStorage();

  try {
    const raw = storageGet(STATE_KEY);
    if (raw) {
      state = JSON.parse(raw);
      if (!state.entities?.length) {
        state = createDefaultState();
        saveState();
      }
      state.progress ??= {};
      state.tabs ??= {};

      if (!state.activeId || !getEntityById(state.activeId)) {
        state.activeId = state.entities[0].id;
        saveState();
      }

      const activeProgress = state.progress[state.activeId];
      if (activeProgress && cleanupOrphanProgress(activeProgress)) {
        saveState();
      }
    } else if (storageGet(OLD_PROGRESS_KEY)) {
      migrateFromV1();
    } else {
      state = createDefaultState();
      saveState();
    }
  } catch {
    state = createDefaultState();
  }

  return state;
}

export function isStorageOk() {
  return storageOk;
}

export function getState() {
  return state;
}

export function getActiveEntity() {
  return getEntityById(state.activeId);
}

export function getEntities() {
  return [...state.entities];
}

export function getActiveProgress() {
  return state.progress[state.activeId] ?? {};
}

function setActiveProgress(progress) {
  state.progress[state.activeId] = progress;
  saveState();
}

export function toggleProgressItem(itemId) {
  const progress = { ...getActiveProgress() };

  if (progress[itemId]) {
    delete progress[itemId];
  } else {
    progress[itemId] = true;
  }

  setActiveProgress(progress);
  return !!progress[itemId];
}

export function clearActiveProgress() {
  state.progress[state.activeId] = {};
  saveState();
}

export function getEntityProgressPct(entityId, allItemIds) {
  const entityProgress = state.progress[entityId] ?? {};
  if (!allItemIds.length) return 0;

  const done = allItemIds.filter((id) => entityProgress[id]).length;
  return Math.round((done / allItemIds.length) * 100);
}

export function getSavedTabIndex() {
  const savedTab = state.tabs[state.activeId];
  if (savedTab == null || savedTab === '') return null;

  let tabIdx = Number.parseInt(savedTab, 10);
  if (tabIdx === 4) tabIdx = 3;
  if (Number.isNaN(tabIdx) || tabIdx < 0 || tabIdx > 3) return 0;
  return tabIdx;
}

export function setSavedTabIndex(index) {
  state.tabs[state.activeId] = String(index);
  saveState();
}

export function createEntity(name) {
  const id = generateId();
  state.entities.push({ id, name, createdAt: new Date().toISOString() });
  state.progress[id] = {};
  state.tabs[id] = '0';
  state.activeId = id;
  saveState();
  return getEntityById(id);
}

export function updateEntity(id, name) {
  const entity = getEntityById(id);
  if (!entity) return null;
  entity.name = name;
  saveState();
  return entity;
}

export function deleteEntity(id) {
  if (state.entities.length <= 1) return false;

  const entity = getEntityById(id);
  if (!entity) return false;

  const wasActive = state.activeId === id;
  state.entities = state.entities.filter((item) => item.id !== id);
  delete state.progress[id];
  delete state.tabs[id];

  if (wasActive) {
    state.activeId = state.entities[0].id;
  }

  saveState();
  return { entity, wasActive };
}

export function switchEntity(id) {
  if (id === state.activeId) return null;
  const entity = getEntityById(id);
  if (!entity) return null;

  state.activeId = id;
  saveState();
  return entity;
}
