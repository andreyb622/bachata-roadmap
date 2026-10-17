import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_CODES } from '@/shared/lib/errors';

type StorageModule = typeof import('../storage');
type SafeStorageModule = typeof import('@/shared/lib/safe-storage');

const VALID = { version: 1, theme: 'dark', locale: 'en' } as const;

async function loadFresh(): Promise<{ settings: StorageModule; safe: SafeStorageModule }> {
  vi.resetModules();
  const settings = await import('../storage');
  const safe = await import('@/shared/lib/safe-storage');
  return { settings, safe };
}

function stubQuotaLocalStorage(): void {
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    removeItem: () => {},
    setItem: (key: string) => {
      if (key === '__bachata_test__') return;
      throw Object.assign(new Error('q'), { name: 'QuotaExceededError' });
    },
  });
}

describe('settings storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips a valid payload', async () => {
    const { settings } = await loadFresh();
    expect(settings.saveSettings(VALID)).toBe(true);
    expect(settings.loadSettings()).toEqual(VALID);
  });

  it('returns null when the key is missing', async () => {
    const { settings } = await loadFresh();
    expect(settings.loadSettings()).toBeNull();
  });

  it('returns null for corrupt JSON', async () => {
    const { settings } = await loadFresh();
    localStorage.setItem(settings.SETTINGS_KEY, '{oops');
    expect(settings.loadSettings()).toBeNull();
  });

  it.each(['[]', '5', 'null', JSON.stringify({ ...VALID, version: 2 })])(
    'returns null for payload %s',
    async (raw) => {
      const { settings } = await loadFresh();
      localStorage.setItem(settings.SETTINGS_KEY, raw);
      expect(settings.loadSettings()).toBeNull();
    },
  );

  it('falls back to system for an invalid field and keeps the valid one', async () => {
    const { settings } = await loadFresh();
    localStorage.setItem(settings.SETTINGS_KEY, JSON.stringify({ ...VALID, theme: 'neon' }));
    expect(settings.loadSettings()).toEqual({ version: 1, theme: 'system', locale: 'en' });
  });

  it('resolves the default theme from existing state', async () => {
    const { settings } = await loadFresh();
    expect(settings.resolveDefaultTheme(true)).toBe('dark');
    expect(settings.resolveDefaultTheme(false)).toBe('system');
  });

  it('keeps the value in memory when the quota is exceeded', async () => {
    stubQuotaLocalStorage();
    const { settings } = await loadFresh();
    expect(() => settings.saveSettings(VALID)).not.toThrow();
    expect(settings.loadSettings()).toEqual(VALID);
  });

  it('does not touch bachata-state-v2', async () => {
    const { settings } = await loadFresh();
    const raw = JSON.stringify({ version: 2, anything: [1, 2] });
    localStorage.setItem('bachata-state-v2', raw);
    settings.saveSettings(VALID);
    expect(localStorage.getItem('bachata-state-v2')).toBe(raw);
  });

  it('keeps the memory value and the storage error across repeated loads', async () => {
    stubQuotaLocalStorage();
    const { settings, safe } = await loadFresh();
    settings.saveSettings(VALID);
    settings.loadSettings();
    expect(settings.loadSettings()).toEqual(VALID);
    expect(safe.consumeStorageError()).toBe(ERROR_CODES.STORAGE_QUOTA_EXCEEDED);
  });

  it('keeps other keys readable across repeated loads', async () => {
    const { settings, safe } = await loadFresh();
    localStorage.setItem('bachata-state-v2', 'payload');
    settings.loadSettings();
    settings.loadSettings();
    expect(safe.storageGet('bachata-state-v2')).toBe('payload');
  });
});
