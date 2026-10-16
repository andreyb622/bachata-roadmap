import { ERROR_CODES, getStorageRecoveryCode, getUserMessage } from './errors';
import type { ErrorCode } from './errors';

export const STATE_KEY = 'bachata-state-v2';
export const DEFAULT_ENTITY_NAME = 'Мой прогресс';
export const MAX_ENTITY_NAME_LEN = 50;

const KEYS = {
  v1Progress: 'bachata-progress-v1',
  v1Tab: 'bachata-tab-v1',
  lastGood: 'bachata-state-v2-last-good',
  corruptBackup: 'bachata-state-v2-corrupt-backup',
} as const;

export interface StoredEntity {
  id: string;
  name: string;
  createdAt: string;
}

export interface StoredStateV2 {
  version: 2;
  entities: StoredEntity[];
  activeId: string;
  progress: Record<string, Record<string, true>>;
  tabs: Record<string, string>;
}

export type LoadIssue = 'missing' | 'parse_error' | 'invalid_structure';

export type DeleteEntityResult = { entity: StoredEntity; wasActive: boolean };

interface LoadResult {
  state: StoredStateV2 | null;
  issue: LoadIssue | null;
}

const memStore = new Map<string, string>();
let storageOk = false;
let state: StoredStateV2 | null = null;
let storageRecoveryMessage: string | null = null;
let lastStorageError: ErrorCode | null = null;

function isQuotaExceeded(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { name, code } = error as { name?: unknown; code?: unknown }; // probing unknown error fields
  return name === 'QuotaExceededError' || code === 22 || code === 1014;
}

function noteStorageWriteError(error: unknown): void {
  lastStorageError = isQuotaExceeded(error)
    ? ERROR_CODES.STORAGE_QUOTA_EXCEEDED
    : ERROR_CODES.STORAGE_SAVE_FAILED;
}

function clearStorageError(): void {
  lastStorageError = null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeEntity(raw: unknown): StoredEntity | null {
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

function sanitizeProgress(raw: unknown): Record<string, true> {
  if (!isPlainObject(raw)) return {};

  const progress: Record<string, true> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key && value) {
      progress[key] = true;
    }
  }
  return progress;
}

function sanitizeTabs(raw: unknown, entityIds: string[]): Record<string, string> {
  const tabs: Record<string, string> = {};
  const source = isPlainObject(raw) ? raw : {};

  for (const id of entityIds) {
    const saved = source[id];
    tabs[id] = saved != null && saved !== '' ? String(saved) : '0';
  }

  return tabs;
}

function isEntity(entity: StoredEntity | null): entity is StoredEntity {
  return entity !== null;
}

function createEntityFromProgressId(id: unknown): StoredEntity | null {
  const trimmed = typeof id === 'string' ? id.trim() : '';
  if (!trimmed) return null;

  return {
    id: trimmed,
    name: DEFAULT_ENTITY_NAME,
    createdAt: new Date().toISOString(),
  };
}

function recoverEntitiesFromProgress(raw: Record<string, unknown>): StoredEntity[] {
  if (!isPlainObject(raw.progress)) return [];

  return Object.keys(raw.progress).map(createEntityFromProgressId).filter(isEntity);
}

function mergeEntitiesFromProgress(
  entities: StoredEntity[],
  raw: Record<string, unknown>,
): StoredEntity[] {
  if (!isPlainObject(raw.progress)) return entities;

  const knownIds = new Set(entities.map((entity) => entity.id));
  const recovered = Object.keys(raw.progress)
    .map((id) => {
      const trimmed = id.trim();
      if (!trimmed || knownIds.has(trimmed)) return null;
      return createEntityFromProgressId(trimmed);
    })
    .filter(isEntity);

  return recovered.length ? [...entities, ...recovered] : entities;
}

function cleanupOrphanProgress(progressObj: Record<string, true> | null): boolean {
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

function normalizeState(raw: unknown): StoredStateV2 | null {
  if (!isPlainObject(raw)) return null;

  let entities = Array.isArray(raw.entities)
    ? (raw.entities as unknown[]).map(sanitizeEntity).filter(isEntity) // Array.isArray narrows to any[]
    : [];

  if (!entities.length) {
    entities = recoverEntitiesFromProgress(raw);
  } else {
    entities = mergeEntitiesFromProgress(entities, raw);
  }

  const first = entities[0];
  if (!first) return null;

  const entityIds = new Set(entities.map((entity) => entity.id));
  const progress: Record<string, Record<string, true>> = {};

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
    activeId = first.id;
  }

  return {
    version: 2,
    entities,
    activeId,
    progress,
    tabs: sanitizeTabs(raw.tabs, [...entityIds]),
  };
}

function testStorage(): boolean {
  try {
    const key = '__bachata_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function storageGet(key: string): string | null {
  if (storageOk) {
    try {
      return localStorage.getItem(key);
    } catch {
      // fallback to memory
    }
  }
  return memStore.get(key) ?? null;
}

function storageSet(key: string, val: string): boolean {
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

function storageRemove(key: string): void {
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

function generateId(): string {
  return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultState(): StoredStateV2 {
  const id = generateId();
  return {
    version: 2,
    entities: [{ id, name: DEFAULT_ENTITY_NAME, createdAt: new Date().toISOString() }],
    activeId: id,
    progress: {},
    tabs: {},
  };
}

function requireState(): StoredStateV2 {
  if (!state) throw new Error('Storage is not initialized');
  return state;
}

export function getEntityById(id: string): StoredEntity | null {
  return state?.entities.find((entity) => entity.id === id) ?? null;
}

function saveState(): boolean {
  if (!state) return false;

  const serialized = JSON.stringify(state);
  clearStorageError();

  const mainSaved = storageSet(STATE_KEY, serialized);
  const backupSaved = storageSet(KEYS.lastGood, serialized);

  if (storageOk && (!mainSaved || !backupSaved)) {
    lastStorageError ??= ERROR_CODES.STORAGE_SAVE_FAILED;
    return false;
  }

  return true;
}

function backupCorruptRaw(raw: string | undefined): void {
  if (typeof raw !== 'string' || !raw) return;
  try {
    storageSet(KEYS.corruptBackup, raw);
  } catch {
    // ignore quota errors
  }
}

function loadNormalizedState(raw: string | null, backupOnFailure = false): LoadResult {
  if (!raw) return { state: null, issue: 'missing' };

  let parsed: unknown = null;
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

function loadLastGoodState(): StoredStateV2 | null {
  const raw = storageGet(KEYS.lastGood);
  if (!raw) return null;

  return loadNormalizedState(raw).state;
}

function setRecoveryMessage(issue: LoadIssue | null, recoveredFromBackup: boolean): void {
  const code = getStorageRecoveryCode(issue, recoveredFromBackup);
  storageRecoveryMessage = code ? getUserMessage(code) : null;
}

function loadStateWithRecovery(raw: string): StoredStateV2 {
  const { state: loaded, issue } = loadNormalizedState(raw, true);
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

export function migrateV1ToV2(rawProgress: string | null, rawTab: string | null): StoredStateV2 {
  let oldProgress: Record<string, true> = {};
  let oldTab = '0';

  try {
    if (rawProgress) oldProgress = sanitizeProgress(JSON.parse(rawProgress));
  } catch {
    // ignore corrupt data
  }

  if (rawTab) {
    let tabIdx = Number.parseInt(rawTab, 10);
    if (tabIdx === 4) tabIdx = 3;
    if (!Number.isNaN(tabIdx) && tabIdx >= 0 && tabIdx <= 3) {
      oldTab = String(tabIdx);
    }
  }

  const id = generateId();
  cleanupOrphanProgress(oldProgress);

  return {
    version: 2,
    entities: [{ id, name: DEFAULT_ENTITY_NAME, createdAt: new Date().toISOString() }],
    activeId: id,
    progress: { [id]: oldProgress },
    tabs: { [id]: oldTab },
  };
}

function migrateFromV1(): void {
  state = migrateV1ToV2(storageGet(KEYS.v1Progress), storageGet(KEYS.v1Tab));
  saveState();
  storageRemove(KEYS.v1Progress);
  storageRemove(KEYS.v1Tab);
}

export function initStorage(): StoredStateV2 {
  storageOk = testStorage();
  storageRecoveryMessage = null;

  try {
    const raw = storageGet(STATE_KEY);
    if (raw) {
      state = loadStateWithRecovery(raw);
      saveState();
    } else if (storageGet(KEYS.v1Progress)) {
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

  return requireState();
}

export function isStorageOk(): boolean {
  return storageOk;
}

export function getStorageRecoveryMessage(): string | null {
  return storageRecoveryMessage;
}

export function consumeStorageError(): ErrorCode | null {
  const code = lastStorageError;
  lastStorageError = null;
  return code;
}

export function getState(): StoredStateV2 {
  return requireState();
}

export function getActiveEntity(): StoredEntity | null {
  return getEntityById(requireState().activeId);
}

export function getEntities(): StoredEntity[] {
  return [...(state?.entities ?? [])];
}

export function getActiveProgress(): Record<string, true> {
  const current = requireState();
  return current.progress[current.activeId] ?? {};
}

export function toggleProgressItem(itemId: string): boolean {
  const current = requireState();
  if (typeof itemId !== 'string' || !itemId) return false;

  const progress = { ...getActiveProgress() };

  if (progress[itemId]) {
    delete progress[itemId];
  } else {
    progress[itemId] = true;
  }

  current.progress[current.activeId] = progress;
  saveState();
  return !!progress[itemId];
}

export function clearActiveProgress(): void {
  const current = requireState();
  current.progress[current.activeId] = {};
  saveState();
}

export function getEntityProgressPct(entityId: string, allItemIds: string[]): number {
  if (!state || !Array.isArray(allItemIds) || !allItemIds.length) return 0;

  const entityProgress = state.progress[entityId] ?? {};

  const done = allItemIds.filter((id) => entityProgress[id]).length;
  return Math.round((done / allItemIds.length) * 100);
}

export function getSavedTabIndex(): number | null {
  const current = requireState();

  const savedTab = current.tabs[current.activeId];
  if (savedTab == null || savedTab === '') return null;

  let tabIdx = Number.parseInt(savedTab, 10);
  if (tabIdx === 4) tabIdx = 3;
  if (Number.isNaN(tabIdx) || tabIdx < 0 || tabIdx > 3) return 0;
  return tabIdx;
}

export function setSavedTabIndex(index: number): void {
  const current = requireState();

  const tabIdx = Number(index);
  const safeIndex = Number.isFinite(tabIdx) && tabIdx >= 0 && tabIdx <= 3 ? Math.trunc(tabIdx) : 0;

  current.tabs[current.activeId] = String(safeIndex);
  saveState();
}

export function createEntity(name: string): StoredEntity | null {
  const current = requireState();
  if (typeof name !== 'string' || !name.trim()) return null;

  const id = generateId();
  const trimmed = name.trim().slice(0, MAX_ENTITY_NAME_LEN);
  current.entities.push({ id, name: trimmed, createdAt: new Date().toISOString() });
  current.progress[id] = {};
  current.tabs[id] = '0';
  current.activeId = id;
  saveState();
  return getEntityById(id);
}

export function updateEntity(id: string, name: string): StoredEntity | null {
  requireState();
  if (typeof name !== 'string' || !name.trim()) return null;

  const entity = getEntityById(id);
  if (!entity) return null;

  const trimmed = name.trim().slice(0, MAX_ENTITY_NAME_LEN);
  entity.name = trimmed;
  saveState();
  return entity;
}

export function deleteEntity(id: string): false | DeleteEntityResult {
  const current = requireState();
  if (current.entities.length <= 1) return false;

  const entity = getEntityById(id);
  if (!entity) return false;

  const wasActive = current.activeId === id;
  current.entities = current.entities.filter((item) => item.id !== id);
  delete current.progress[id];
  delete current.tabs[id];

  const next = current.entities[0];
  if (wasActive && next) {
    current.activeId = next.id;
  }

  saveState();
  return { entity, wasActive };
}

export function switchEntity(id: string): StoredEntity | null {
  const current = requireState();
  if (id === current.activeId) return null;
  const entity = getEntityById(id);
  if (!entity) return null;

  current.activeId = id;
  saveState();
  return entity;
}
