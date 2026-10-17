import { ERROR_CODES } from '@/shared/lib/errors';
import type { ErrorCode } from '@/shared/lib/errors';

const memStore = new Map<string, string>();
let storageOk = false;
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

export function clearStorageError(): void {
  lastStorageError = null;
}

export function noteStorageSaveFailed(): void {
  lastStorageError ??= ERROR_CODES.STORAGE_SAVE_FAILED;
}

export function consumeStorageError(): ErrorCode | null {
  const code = lastStorageError;
  lastStorageError = null;
  return code;
}

export function isStorageOk(): boolean {
  return storageOk;
}

export function testStorage(): boolean {
  try {
    const key = '__bachata_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    storageOk = true;
  } catch {
    storageOk = false;
  }
  return storageOk;
}

export function storageGet(key: string): string | null {
  if (storageOk) {
    try {
      return localStorage.getItem(key);
    } catch {
      // fallback to memory
    }
  }
  return memStore.get(key) ?? null;
}

export function storageSet(key: string, val: string): boolean {
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

export function storageRemove(key: string): void {
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
