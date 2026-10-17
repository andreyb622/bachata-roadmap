import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ERROR_CODES, getStorageRecoveryCode, getUserMessage } from '@/shared/lib/errors';

type StorageModule = typeof import('../storage');

const STATE_KEY = 'bachata-state-v2';
const LAST_GOOD_KEY = 'bachata-state-v2-last-good';
const CORRUPT_BACKUP_KEY = 'bachata-state-v2-corrupt-backup';
const V1_PROGRESS_KEY = 'bachata-progress-v1';
const V1_TAB_KEY = 'bachata-tab-v1';

let storage: StorageModule;

async function loadStorage(): Promise<StorageModule> {
  vi.resetModules();
  return import('../storage');
}

function seedV2(payload: unknown): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(payload));
}

function readStored(key: string): unknown {
  return JSON.parse(localStorage.getItem(key) ?? 'null');
}

function validV2(): Record<string, unknown> {
  return {
    version: 2,
    entities: [
      { id: 'a', name: 'Анна', createdAt: '2024-01-01T00:00:00.000Z' },
      { id: 'b', name: 'Борис', createdAt: '2024-01-02T00:00:00.000Z' },
    ],
    activeId: 'b',
    progress: { a: { '1-0-0': true }, b: { '2-1-0': true } },
    tabs: { a: '1', b: '2' },
  };
}

beforeEach(async () => {
  localStorage.clear();
  storage = await loadStorage();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('v1 to v2 migration', () => {
  function seedV1(): void {
    localStorage.setItem(
      V1_PROGRESS_KEY,
      JSON.stringify({ '1-0-0': true, '2-1-3': true, '3-0-1': true, '1-1-1': false, '0-0-0': 0 }),
    );
    localStorage.setItem(V1_TAB_KEY, '2');
  }

  it('migrates a real v1 payload into the v2 shape', () => {
    seedV1();
    const state = storage.initStorage();
    const id = state.activeId;
    expect(state).toEqual({
      version: 2,
      entities: [{ id, name: 'Мой прогресс', createdAt: expect.any(String) }],
      activeId: id,
      progress: { [id]: { '1-0-0': true, '2-1-3': true } },
      tabs: { [id]: '2' },
    });
  });

  it('removes both v1 keys after migration', () => {
    seedV1();
    storage.initStorage();
    expect(localStorage.getItem(V1_PROGRESS_KEY)).toBeNull();
    expect(localStorage.getItem(V1_TAB_KEY)).toBeNull();
  });

  it('writes the state and the last-good copy with equal JSON', () => {
    seedV1();
    storage.initStorage();
    expect(localStorage.getItem(STATE_KEY)).toBe(localStorage.getItem(LAST_GOOD_KEY));
  });

  it('persists the migrated state under the v2 key', () => {
    seedV1();
    const state = storage.initStorage();
    expect(readStored(STATE_KEY)).toEqual(state);
  });

  it.each([
    ['4', '3'],
    ['3', '3'],
    ['9', '0'],
    ['abc', '0'],
    [null, '0'],
  ])('maps the v1 tab %s to %s', (rawTab, expected) => {
    const state = storage.migrateV1ToV2('{"1-0-0":true}', rawTab);
    expect(Object.values(state.tabs)).toEqual([expected]);
  });

  it('migrates corrupt v1 progress JSON into empty progress', () => {
    localStorage.setItem(V1_PROGRESS_KEY, '{broken');
    const state = storage.initStorage();
    expect(state.progress[state.activeId]).toEqual({});
  });

  it('does not migrate a lone v1 tab key', () => {
    localStorage.setItem(V1_TAB_KEY, '2');
    const state = storage.initStorage();
    expect(state.tabs).toEqual({});
  });

  it('produces the same state on a second init without v1 keys', async () => {
    seedV1();
    const first = storage.initStorage();
    storage = await loadStorage();
    const second = storage.initStorage();
    expect(second).toEqual(first);
    expect(localStorage.getItem(V1_PROGRESS_KEY)).toBeNull();
  });
});

describe('migrateV1ToV2', () => {
  it('builds a deterministic state with fake timers and random', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-01T00:00:00.000Z'));
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const state = storage.migrateV1ToV2('{"1-0-0":true,"3-0-1":true}', '1');
    const id = 'e_lvn1w5c0_i';
    expect(state).toEqual({
      version: 2,
      entities: [{ id, name: 'Мой прогресс', createdAt: '2024-05-01T00:00:00.000Z' }],
      activeId: id,
      progress: { [id]: { '1-0-0': true } },
      tabs: { [id]: '1' },
    });
  });

  it('drops orphan period-3 ids containing a dash', () => {
    const state = storage.migrateV1ToV2('{"3-0-1":true,"3":true}', null);
    expect(state.progress[state.activeId]).toEqual({ '3': true });
  });
});

describe('loading a v2 state', () => {
  it('loads a real v2 payload unchanged', () => {
    seedV2(validV2());
    expect(storage.initStorage()).toEqual(validV2());
  });

  it.each([
    [
      'blank name becomes the default',
      { entities: [{ id: 'a', name: '   ' }] },
      (s: StorageModule) => s.getState().entities[0]?.name,
      'Мой прогресс',
    ],
    [
      'long name is cut',
      { entities: [{ id: 'a', name: 'x'.repeat(80) }] },
      (s: StorageModule) => s.getState().entities[0]?.name,
      'x'.repeat(50),
    ],
    [
      'entity without id is dropped',
      { entities: [{ name: 'без id' }, { id: 'a', name: 'ok' }] },
      (s: StorageModule) => s.getState().entities.map((e) => e.id),
      ['a'],
    ],
    [
      'progress of an unknown entity recovers it as an entity',
      { entities: [{ id: 'a' }], progress: { a: { x: true }, zzz: { y: true } } },
      (s: StorageModule) => s.getState().entities.map((e) => e.id),
      ['a', 'zzz'],
    ],
    [
      'non-true progress values are dropped',
      { entities: [{ id: 'a' }], progress: { a: { x: true, y: false, z: 0, w: 1 } } },
      (s: StorageModule) => s.getState().progress['a'],
      { x: true, w: true },
    ],
    [
      'missing activeId falls back to the first entity',
      { entities: [{ id: 'a' }, { id: 'b' }] },
      (s: StorageModule) => s.getState().activeId,
      'a',
    ],
    [
      'unknown activeId falls back to the first entity',
      { entities: [{ id: 'a' }, { id: 'b' }], activeId: 'nope' },
      (s: StorageModule) => s.getState().activeId,
      'a',
    ],
    [
      'numeric tabs become strings',
      { entities: [{ id: 'a' }], tabs: { a: 2 } },
      (s: StorageModule) => s.getState().tabs,
      { a: '2' },
    ],
    [
      'orphan period-3 progress is cleaned',
      { entities: [{ id: 'a' }], progress: { a: { '3-0-1': true, '1-0-0': true } } },
      (s: StorageModule) => s.getState().progress['a'],
      { '1-0-0': true },
    ],
    [
      'entities missing from the list are rebuilt from progress keys',
      { entities: [], progress: { solo: { x: true } } },
      (s: StorageModule) => s.getState().entities.map((e) => e.id),
      ['solo'],
    ],
  ])('normalizes: %s', (_title, payload, pick, expected) => {
    seedV2(payload);
    storage.initStorage();
    expect(pick(storage)).toEqual(expected);
  });

  it('writes version 2 on every normalized state', () => {
    seedV2({ version: 7, entities: [{ id: 'a' }] });
    expect(storage.initStorage().version).toBe(2);
  });
});

describe('recovery', () => {
  it('recovers from the last-good copy when the main JSON is broken', () => {
    localStorage.setItem(STATE_KEY, '{broken');
    localStorage.setItem(LAST_GOOD_KEY, JSON.stringify(validV2()));
    expect(storage.initStorage()).toEqual(validV2());
  });

  it('sets the backup-recovered message for a parse error', () => {
    localStorage.setItem(STATE_KEY, '{broken');
    localStorage.setItem(LAST_GOOD_KEY, JSON.stringify(validV2()));
    storage.initStorage();
    expect(storage.getStorageRecoveryMessage()).toBe(
      getUserMessage(getStorageRecoveryCode('parse_error', true)),
    );
  });

  it('saves the raw broken string to the corrupt backup', () => {
    localStorage.setItem(STATE_KEY, '{broken');
    localStorage.setItem(LAST_GOOD_KEY, JSON.stringify(validV2()));
    storage.initStorage();
    expect(localStorage.getItem(CORRUPT_BACKUP_KEY)).toBe('{broken');
  });

  it('creates a new profile for broken JSON without a last-good copy', () => {
    localStorage.setItem(STATE_KEY, '{broken');
    storage.initStorage();
    expect(storage.getStorageRecoveryMessage()).toBe(
      getUserMessage(getStorageRecoveryCode('parse_error', false)),
    );
  });

  it.each([['{}'], ['[]'], ['{"entities":[]}']])(
    'falls back to the default state for invalid structure %s',
    (raw) => {
      localStorage.setItem(STATE_KEY, raw);
      const state = storage.initStorage();
      expect(state.entities).toHaveLength(1);
    },
  );

  it('recovers from the last-good copy when the structure is invalid', () => {
    localStorage.setItem(STATE_KEY, '{}');
    localStorage.setItem(LAST_GOOD_KEY, JSON.stringify(validV2()));
    expect(storage.initStorage()).toEqual(validV2());
  });

  it('sets the backup-recovered message for an invalid structure', () => {
    localStorage.setItem(STATE_KEY, '{}');
    localStorage.setItem(LAST_GOOD_KEY, JSON.stringify(validV2()));
    storage.initStorage();
    expect(storage.getStorageRecoveryMessage()).toBe(
      getUserMessage(getStorageRecoveryCode('invalid_structure', true)),
    );
  });

  it.each([['{}'], ['[]'], ['{"entities":[]}']])(
    'sets the new-profile-structure message for %s',
    (raw) => {
      localStorage.setItem(STATE_KEY, raw);
      storage.initStorage();
      expect(storage.getStorageRecoveryMessage()).toBe(
        getUserMessage(getStorageRecoveryCode('invalid_structure', false)),
      );
    },
  );

  it.each([['{}'], ['[]'], ['{"entities":[]}']])(
    'writes the corrupt backup for invalid structure %s',
    (raw) => {
      localStorage.setItem(STATE_KEY, raw);
      storage.initStorage();
      expect(localStorage.getItem(CORRUPT_BACKUP_KEY)).toBe(raw);
    },
  );

  it('has no recovery message on a clean start', () => {
    storage.initStorage();
    expect(storage.getStorageRecoveryMessage()).toBeNull();
  });
});

describe('write errors', () => {
  function failWrites(props: Record<string, unknown>): void {
    const real = localStorage;
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => real.getItem(key),
      removeItem: (key: string) => real.removeItem(key),
      setItem: () => {
        throw Object.assign(new Error('write failed'), props);
      },
    });
  }

  it.each([
    ['name', { name: 'QuotaExceededError' }],
    ['code 22', { code: 22 }],
    ['code 1014', { code: 1014 }],
  ])('reports quota exceeded by %s', (_title, props) => {
    storage.initStorage();
    failWrites(props);
    storage.toggleProgressItem('1-0-0');
    expect(storage.consumeStorageError()).toBe(ERROR_CODES.STORAGE_QUOTA_EXCEEDED);
  });

  it('keeps the new value when saving fails', () => {
    storage.initStorage();
    failWrites({ name: 'QuotaExceededError' });
    expect(storage.toggleProgressItem('1-0-0')).toBe(true);
  });

  it('resets the error after it is consumed', () => {
    storage.initStorage();
    failWrites({ name: 'QuotaExceededError' });
    storage.toggleProgressItem('1-0-0');
    storage.consumeStorageError();
    expect(storage.consumeStorageError()).toBeNull();
  });

  it('reports a generic save failure for other errors', () => {
    storage.initStorage();
    failWrites({ name: 'Error' });
    storage.toggleProgressItem('1-0-0');
    expect(storage.consumeStorageError()).toBe(ERROR_CODES.STORAGE_SAVE_FAILED);
  });
});

describe('unavailable localStorage', () => {
  beforeEach(async () => {
    const broken = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };
    vi.stubGlobal('localStorage', broken);
    storage = await loadStorage();
    storage.initStorage();
  });

  it('reports the storage as not ok', () => {
    expect(storage.isStorageOk()).toBe(false);
  });

  it('keeps working in memory', () => {
    expect(storage.toggleProgressItem('1-0-0')).toBe(true);
  });

  it('keeps the progress in memory', () => {
    storage.toggleProgressItem('1-0-0');
    expect(storage.getActiveProgress()).toEqual({ '1-0-0': true });
  });

  it('does not report a write error', () => {
    storage.toggleProgressItem('1-0-0');
    expect(storage.consumeStorageError()).toBeNull();
  });
});

describe('entities', () => {
  beforeEach(() => {
    seedV2(validV2());
    storage.initStorage();
  });

  it('creates an entity with a trimmed and cut name', () => {
    const entity = storage.createEntity(`  ${'y'.repeat(70)}  `);
    expect(entity?.name).toBe('y'.repeat(50));
  });

  it('makes the created entity active with tab 0', () => {
    const entity = storage.createEntity('Новая');
    expect(storage.getState().activeId).toBe(entity?.id);
    expect(storage.getState().tabs[entity?.id ?? '']).toBe('0');
  });

  it('rejects a blank name on create', () => {
    expect(storage.createEntity('   ')).toBeNull();
  });

  it('renames an entity', () => {
    storage.updateEntity('a', '  Алиса ');
    expect(storage.getEntityById('a')?.name).toBe('Алиса');
  });

  it('returns null when updating an unknown entity', () => {
    expect(storage.updateEntity('nope', 'x')).toBeNull();
  });

  it('returns a copy from getEntities', () => {
    storage.getEntities().pop();
    expect(storage.getEntities()).toHaveLength(2);
  });

  it('returns null when switching to the active entity', () => {
    expect(storage.switchEntity('b')).toBeNull();
  });

  it('returns null when switching to an unknown entity', () => {
    expect(storage.switchEntity('nope')).toBeNull();
  });

  it('switches the active entity', () => {
    storage.switchEntity('a');
    expect(storage.getActiveEntity()?.id).toBe('a');
  });

  it('deletes the active entity and moves activeId', () => {
    const result = storage.deleteEntity('b');
    expect(result).toEqual({ entity: expect.objectContaining({ id: 'b' }), wasActive: true });
    expect(storage.getState().activeId).toBe('a');
  });

  it('removes progress and tabs of a deleted entity', () => {
    storage.deleteEntity('b');
    expect(storage.getState().progress).toEqual({ a: { '1-0-0': true } });
    expect(storage.getState().tabs).toEqual({ a: '1' });
  });

  it('reports wasActive false for a non-active entity', () => {
    expect(storage.deleteEntity('a')).toEqual({
      entity: expect.objectContaining({ id: 'a' }),
      wasActive: false,
    });
  });

  it('refuses to delete the last entity and keeps the state', () => {
    storage.deleteEntity('a');
    const before = structuredClone(storage.getState());
    expect(storage.deleteEntity('b')).toBe(false);
    expect(storage.getState()).toEqual(before);
  });
});

describe('progress', () => {
  beforeEach(() => {
    seedV2(validV2());
    storage.initStorage();
  });

  it('toggles an item on and off', () => {
    expect(storage.toggleProgressItem('9-9-9')).toBe(true);
    expect(storage.toggleProgressItem('9-9-9')).toBe(false);
  });

  it('returns false for an empty item id', () => {
    expect(storage.toggleProgressItem('')).toBe(false);
  });

  it('clears the active progress', () => {
    storage.clearActiveProgress();
    expect(storage.getActiveProgress()).toEqual({});
  });

  it('persists toggles under the v2 key', () => {
    storage.toggleProgressItem('9-9-9');
    expect(readStored(STATE_KEY)).toEqual(storage.getState());
  });

  it('rounds the entity progress percentage', () => {
    expect(storage.getEntityProgressPct('a', ['1-0-0', '1-0-1', '1-0-2'])).toBe(33);
  });

  it('returns 0 percent for an empty list', () => {
    expect(storage.getEntityProgressPct('a', [])).toBe(0);
  });
});

describe('tabs', () => {
  beforeEach(() => {
    seedV2({ entities: [{ id: 'a' }], tabs: {} });
    storage.initStorage();
    storage.getState().tabs = {};
  });

  it('returns null when no tab is saved', () => {
    expect(storage.getSavedTabIndex()).toBeNull();
  });

  it.each([
    [2, '2'],
    [2.7, '2'],
    [-1, '0'],
    [5, '0'],
    [Number.NaN, '0'],
  ])('stores tab %s as "%s"', (index, expected) => {
    storage.setSavedTabIndex(index);
    expect(storage.getState().tabs['a']).toBe(expected);
  });

  it('persists the tab as a string at tabs[activeId]', () => {
    storage.setSavedTabIndex(2);
    expect(readStored(STATE_KEY)).toMatchObject({ tabs: { a: '2' } });
  });

  it.each([
    ['4', 3],
    ['abc', 0],
  ])('reads a stored tab "%s" back as %s', async (raw, expected) => {
    seedV2({ entities: [{ id: 'a' }], tabs: { a: raw } });
    storage = await loadStorage();
    storage.initStorage();
    expect(storage.getSavedTabIndex()).toBe(expected);
  });
});

describe('before initStorage', () => {
  it.each([
    ['getState', () => storage.getState()],
    ['getActiveEntity', () => storage.getActiveEntity()],
    ['getActiveProgress', () => storage.getActiveProgress()],
    ['toggleProgressItem', () => storage.toggleProgressItem('1-0-0')],
    ['createEntity', () => storage.createEntity('x')],
    ['getSavedTabIndex', () => storage.getSavedTabIndex()],
    ['setSavedTabIndex', () => storage.setSavedTabIndex(1)],
    ['updateEntity', () => storage.updateEntity('a', 'x')],
    ['deleteEntity', () => storage.deleteEntity('a')],
    ['switchEntity', () => storage.switchEntity('a')],
    ['clearActiveProgress', () => storage.clearActiveProgress()],
  ])('%s throws', (_name, call) => {
    expect(call).toThrow(new Error('Storage is not initialized'));
  });

  it('returns 0 percent without a state', () => {
    expect(storage.getEntityProgressPct('a', ['1-0-0'])).toBe(0);
  });
});
