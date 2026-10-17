import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_CODES } from '@/shared/lib/errors';

type SafeStorageModule = typeof import('../safe-storage');

async function loadSafeStorage(): Promise<SafeStorageModule> {
  vi.resetModules();
  return import('../safe-storage');
}

function stubThrowingLocalStorage(error: Error): void {
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    removeItem: () => {},
    setItem: () => {
      throw error;
    },
  });
}

describe('safe-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('testStorage returns true when localStorage works', async () => {
    const safeStorage = await loadSafeStorage();
    expect(safeStorage.testStorage()).toBe(true);
    expect(safeStorage.isStorageOk()).toBe(true);
  });

  it('testStorage returns false when localStorage throws', async () => {
    stubThrowingLocalStorage(new Error('denied'));
    const safeStorage = await loadSafeStorage();
    expect(safeStorage.testStorage()).toBe(false);
    expect(safeStorage.isStorageOk()).toBe(false);
  });

  it('keeps values in memory when localStorage is unavailable', async () => {
    stubThrowingLocalStorage(new Error('denied'));
    const safeStorage = await loadSafeStorage();
    safeStorage.testStorage();

    expect(safeStorage.storageSet('k', 'v')).toBe(true);
    expect(safeStorage.storageGet('k')).toBe('v');
    safeStorage.storageRemove('k');
    expect(safeStorage.storageGet('k')).toBeNull();
  });

  it('reads, writes and removes through localStorage when available', async () => {
    const safeStorage = await loadSafeStorage();
    safeStorage.testStorage();

    expect(safeStorage.storageSet('k', 'v')).toBe(true);
    expect(localStorage.getItem('k')).toBe('v');
    expect(safeStorage.storageGet('k')).toBe('v');
    safeStorage.storageRemove('k');
    expect(localStorage.getItem('k')).toBeNull();
  });

  it('reports a quota error once', async () => {
    const safeStorage = await loadSafeStorage();
    safeStorage.testStorage();
    stubThrowingLocalStorage(new DOMException('full', 'QuotaExceededError'));

    expect(safeStorage.storageSet('k', 'v')).toBe(false);
    expect(safeStorage.consumeStorageError()).toBe(ERROR_CODES.STORAGE_QUOTA_EXCEEDED);
    expect(safeStorage.consumeStorageError()).toBeNull();
  });

  it('keeps an earlier quota code when a later save failure is noted', async () => {
    const safeStorage = await loadSafeStorage();
    safeStorage.testStorage();
    stubThrowingLocalStorage(new DOMException('full', 'QuotaExceededError'));
    safeStorage.storageSet('k', 'v');

    safeStorage.noteStorageSaveFailed();

    expect(safeStorage.consumeStorageError()).toBe(ERROR_CODES.STORAGE_QUOTA_EXCEEDED);
  });

  it('notes a generic save failure when no error is pending', async () => {
    const safeStorage = await loadSafeStorage();

    safeStorage.noteStorageSaveFailed();

    expect(safeStorage.consumeStorageError()).toBe(ERROR_CODES.STORAGE_SAVE_FAILED);
  });

  it('clearStorageError drops a pending error', async () => {
    const safeStorage = await loadSafeStorage();
    safeStorage.noteStorageSaveFailed();

    safeStorage.clearStorageError();

    expect(safeStorage.consumeStorageError()).toBeNull();
  });
});
