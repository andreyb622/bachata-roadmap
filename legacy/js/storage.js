import {
  ERROR_CODES,
  getStorageRecoveryCode,
  getUserMessage,
} from './errors.js';

export const STATE_KEY = 'bachata-state-v2';
export const DEFAULT_ENTITY_NAME = 'Мой прогресс';
export const MAX_ENTITY_NAME_LEN = 50;

const OLD_PROGRESS_KEY = 'bachata-progress-v1';
const OLD_TAB_KEY = 'bachata-tab-v1';
const LAST_GOOD_KEY = 'bachata-state-v2-last-good';
const CORRUPT_BACKUP_KEY = 'bachata-state-v2-corrupt-backup';

const memStore = new Map();
let storageOk = false;
let state = null;
let storageRecoveryMessage = null;
let lastStorageError = null;

function isQuotaExceeded(error) {
  return error?.name === 'QuotaExceededError'
    || error?.code === 22
    || error?.code === 1014;
}

function noteStorageWriteError(error) {
  lastStorageError = isQuotaExceeded(error)
    ? ERROR_CODES.STORAGE_QUOTA_EXCEEDED
    : ERROR_CODES.STORAGE_SAVE_FAILED;
}

function clearStorageError() {
  lastStorageError = null;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeEntity(raw) {
  if (!isPlainObject(raw)) return null;

  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : null;
  if (!id) return null;

  let name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) name = DEFAULT_ENTITY_NAME;
  if (name.length > MAX_ENTITY_NAME_LEN) {
    name = name.slice(0, MAX_ENTITY_NAME_LEN);
  }

  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
  return { id, name, createdAt };
}

function sanitizeProgress(raw) {
  if (!isPlainObject(raw)) return {};

  const progress = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof key === 'string' && key && value) {
      progress[key] = true;
    }
  }
  return progress;
}

function sanitizeTabs(raw, entityIds) {
  const tabs = {};
  const source = isPlainObject(raw) ? raw : {};

  for (const id of entityIds) {
    const saved = source[id];
    tabs[id] = saved != null && saved !== '' ? String(saved) : '0';
  }

  return tabs;
}

function createEntityFromProgressId(id) {
  const trimmed = typeof id === 'string' ? id.trim() : '';
  if (!trimmed) return null;

  return {
    id: trimmed,
    name: DEFAULT_ENTITY_NAME,
    createdAt: new Date().toISOString(),
  };
}

function recoverEntitiesFromProgress(raw) {
  if (!isPlainObject(raw?.progress)) return [];

  return Object.keys(raw.progress)
    .map(createEntityFromProgressId)
    .filter(Boolean);
}

function mergeEntitiesFromProgress(entities, raw) {
  if (!isPlainObject(raw?.progress)) return entities;

  const knownIds = new Set(entities.map((entity) => entity.id));
  const recovered = Object.keys(raw.progress)
    .map((id) => {
      const trimmed = typeof id === 'string' ? id.trim() : '';
      if (!trimmed || knownIds.has(trimmed)) return null;
      return createEntityFromProgressId(trimmed);
    })
    .filter(Boolean);

  return recovered.length ? [...entities, ...recovered] : entities;
}

function normalizeState(raw) {
  if (!isPlainObject(raw)) return null;

  let entities = Array.isArray(raw.entities)
    ? raw.entities.map(sanitizeEntity).filter(Boolean)
    : [];

  if (!entities.length) {
    entities = recoverEntitiesFromProgress(raw);
  } else {
    entities = mergeEntitiesFromProgress(entities, raw);
  }

  if (!entities.length) return null;

  const entityIds = new Set(entities.map((entity) => entity.id));
  const progress = {};

  if (isPlainObject(raw.progress)) {
    for (const [entityId, entityProgress] of Object.entries(raw.progress)) {
      if (!entityIds.has(entityId)) continue;

      const sanitized = sanitizeProgress(entityProgress);
      cleanupOrphanProgress(sanitized);
      progress[entityId] = sanitized;
    }
  }

  for (const id of entityIds) {
    progress[id] ??= {};
  }

  let activeId = typeof raw.activeId === 'string' ? raw.activeId : null;
  if (!activeId || !entityIds.has(activeId)) {
    activeId = entities[0].id;
  }

  return {
    version: 2,
    entities,
    activeId,
    progress,
    tabs: sanitizeTabs(raw.tabs, [...entityIds]),
  };
}

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
      return true;
    } catch (error) {
      noteStorageWriteError(error);
    }
  }

  memStore.set(key, val);
  return !storageOk;
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
  if (!state) return false;

  const serialized = JSON.stringify(state);
  clearStorageError();

  const mainSaved = storageSet(STATE_KEY, serialized);
  const backupSaved = storageSet(LAST_GOOD_KEY, serialized);

  if (storageOk && (!mainSaved || !backupSaved)) {
    lastStorageError ??= ERROR_CODES.STORAGE_SAVE_FAILED;
    return false;
  }

  return true;
}

function backupCorruptRaw(raw) {
  if (typeof raw !== 'string' || !raw) return;
  try {
    storageSet(CORRUPT_BACKUP_KEY, raw);
  } catch {
    // ignore quota errors
  }
}

function loadNormalizedState(raw, { backupOnFailure = false } = {}) {
  if (!raw) return { state: null, issue: 'missing' };

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    if (backupOnFailure) backupCorruptRaw(raw);
    return { state: null, issue: 'parse_error' };
  }

  const normalized = normalizeState(parsed);
  if (normalized) {
    return { state: normalized, issue: null };
  }

  if (backupOnFailure) {
    try {
      backupCorruptRaw(JSON.stringify(parsed));
    } catch {
      backupCorruptRaw(raw);
    }
  }

  return { state: null, issue: 'invalid_structure' };
}

function loadLastGoodState() {
  const raw = storageGet(LAST_GOOD_KEY);
  if (!raw) return null;

  const { state: loaded } = loadNormalizedState(raw);
  return loaded;
}

function setRecoveryMessage(issue, recoveredFromBackup) {
  const code = getStorageRecoveryCode(issue, recoveredFromBackup);
  storageRecoveryMessage = code ? getUserMessage(code) : null;
}

function loadStateWithRecovery(raw) {
  const { state: loaded, issue } = loadNormalizedState(raw, { backupOnFailure: true });
  if (loaded) {
    return loaded;
  }

  const recovered = loadLastGoodState();
  if (recovered) {
    setRecoveryMessage(issue, true);
    return recovered;
  }

  setRecoveryMessage(issue, false);
  return createDefaultState();
}

function migrateFromV1() {
  let oldProgress = {};
  let oldTab = '0';

  try {
    const raw = storageGet(OLD_PROGRESS_KEY);
    if (raw) oldProgress = sanitizeProgress(JSON.parse(raw));
  } catch {
    // ignore corrupt data
  }

  const savedTab = storageGet(OLD_TAB_KEY);
  if (savedTab) {
    let tabIdx = Number.parseInt(savedTab, 10);
    if (tabIdx === 4) tabIdx = 3;
    if (!Number.isNaN(tabIdx) && tabIdx >= 0 && tabIdx <= 3) {
      oldTab = String(tabIdx);
    }
  }

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
  storageRecoveryMessage = null;

  try {
    const raw = storageGet(STATE_KEY);
    if (raw) {
      state = loadStateWithRecovery(raw);
      saveState();
    } else if (storageGet(OLD_PROGRESS_KEY)) {
      migrateFromV1();
    } else {
      state = createDefaultState();
      saveState();
    }
  } catch (error) {
    const recovered = loadLastGoodState();
    if (recovered) {
      state = recovered;
      storageRecoveryMessage = getUserMessage(ERROR_CODES.STORAGE_LOAD_RECOVERED);
      saveState();
    } else {
      state = createDefaultState();
      storageRecoveryMessage = getUserMessage(ERROR_CODES.STORAGE_INIT_FAILED);
      console.error('initStorage failed', error);
    }
  }

  return state;
}

export function isStorageOk() {
  return storageOk;
}

export function getStorageRecoveryMessage() {
  return storageRecoveryMessage;
}

export function consumeStorageError() {
  const code = lastStorageError;
  lastStorageError = null;
  return code;
}

export function getState() {
  return state;
}

export function getActiveEntity() {
  return getEntityById(state.activeId);
}

export function getEntities() {
  return [...(state?.entities ?? [])];
}

export function getActiveProgress() {
  if (!state) return {};
  return state.progress[state.activeId] ?? {};
}

function setActiveProgress(progress) {
  state.progress[state.activeId] = progress;
  saveState();
}

export function toggleProgressItem(itemId) {
  if (!state || typeof itemId !== 'string' || !itemId) return false;

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
  if (!state) return;
  state.progress[state.activeId] = {};
  saveState();
}

export function getEntityProgressPct(entityId, allItemIds) {
  if (!state || !Array.isArray(allItemIds) || !allItemIds.length) return 0;

  const entityProgress = state.progress[entityId] ?? {};

  const done = allItemIds.filter((id) => entityProgress[id]).length;
  return Math.round((done / allItemIds.length) * 100);
}

export function getSavedTabIndex() {
  if (!state) return null;

  const savedTab = state.tabs[state.activeId];
  if (savedTab == null || savedTab === '') return null;

  let tabIdx = Number.parseInt(savedTab, 10);
  if (tabIdx === 4) tabIdx = 3;
  if (Number.isNaN(tabIdx) || tabIdx < 0 || tabIdx > 3) return 0;
  return tabIdx;
}

export function setSavedTabIndex(index) {
  if (!state) return;

  const tabIdx = Number(index);
  const safeIndex = Number.isFinite(tabIdx) && tabIdx >= 0 && tabIdx <= 3
    ? Math.trunc(tabIdx)
    : 0;

  state.tabs[state.activeId] = String(safeIndex);
  saveState();
}

export function createEntity(name) {
  if (!state || typeof name !== 'string' || !name.trim()) return null;

  const id = generateId();
  const trimmed = name.trim().slice(0, MAX_ENTITY_NAME_LEN);
  state.entities.push({ id, name: trimmed, createdAt: new Date().toISOString() });
  state.progress[id] = {};
  state.tabs[id] = '0';
  state.activeId = id;
  saveState();
  return getEntityById(id);
}

export function updateEntity(id, name) {
  if (!state || typeof name !== 'string' || !name.trim()) return null;

  const entity = getEntityById(id);
  if (!entity) return null;

  const trimmed = name.trim().slice(0, MAX_ENTITY_NAME_LEN);
  entity.name = trimmed;
  saveState();
  return entity;
}

export function deleteEntity(id) {
  if (!state || state.entities.length <= 1) return false;

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
  if (!state || id === state.activeId) return null;
  const entity = getEntityById(id);
  if (!entity) return null;

  state.activeId = id;
  saveState();
  return entity;
}
