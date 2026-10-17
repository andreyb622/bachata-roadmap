import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { SETTINGS_KEY } from '../storage';
import { useSettingsStore } from '../store';

function readStored(): unknown {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null');
}

describe('settings store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('applies a valid saved payload', () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ version: 1, theme: 'light', locale: 'es' }),
    );
    const store = useSettingsStore();
    store.init(true);
    expect(store.theme).toBe('light');
    expect(store.locale).toBe('es');
  });

  it('defaults to dark for existing users and persists it', () => {
    const store = useSettingsStore();
    store.init(true);
    expect(store.theme).toBe('dark');
    expect(readStored()).toEqual({ version: 1, theme: 'dark', locale: 'system' });
  });

  it('defaults to system for new users and persists it', () => {
    const store = useSettingsStore();
    store.init(false);
    expect(store.theme).toBe('system');
    expect(readStored()).toEqual({ version: 1, theme: 'system', locale: 'system' });
  });

  it('overwrites a corrupt payload with defaults', () => {
    localStorage.setItem(SETTINGS_KEY, '{oops');
    const store = useSettingsStore();
    expect(() => store.init(true)).not.toThrow();
    expect(store.theme).toBe('dark');
    expect(readStored()).toEqual({ version: 1, theme: 'dark', locale: 'system' });
  });

  it('keeps the persisted default on a later init', () => {
    useSettingsStore().init(false);
    setActivePinia(createPinia());
    const store = useSettingsStore();
    store.init(true);
    expect(store.theme).toBe('system');
  });

  it('persists setTheme and setLocale', () => {
    const store = useSettingsStore();
    expect(store.setTheme('light')).toBe(true);
    expect(store.setLocale('en')).toBe(true);
    expect(readStored()).toEqual({ version: 1, theme: 'light', locale: 'en' });
  });

  it('keeps the value in memory when the quota is exceeded', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      removeItem: () => {},
      setItem: (key: string) => {
        if (key === '__bachata_test__') return;
        throw Object.assign(new Error('q'), { name: 'QuotaExceededError' });
      },
    });
    vi.resetModules();
    const { createPinia: freshCreatePinia, setActivePinia: freshSetActivePinia } =
      await import('pinia');
    const { useSettingsStore: useFreshStore } = await import('../store');
    freshSetActivePinia(freshCreatePinia());
    const store = useFreshStore();
    store.init(false);
    expect(store.setTheme('dark')).toBe(false);
    expect(store.theme).toBe('dark');
  });
});
