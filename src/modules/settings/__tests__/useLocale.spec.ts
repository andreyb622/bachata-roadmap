import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { resolveLocale, useLocale } from '../useLocale';
import { useSettingsStore } from '../store';

describe('resolveLocale', () => {
  it('returns ru for any input while locales are disabled', () => {
    expect(resolveLocale('en', false, ['es-ES'], false)).toBe('ru');
    expect(resolveLocale('system', false, ['es-ES'], false)).toBe('ru');
  });

  it('prefers the saved locale over existing state', () => {
    expect(resolveLocale('es', true, ['en'], true)).toBe('es');
  });

  it('returns ru for system locale with existing state', () => {
    expect(resolveLocale('system', true, ['es-ES'], true)).toBe('ru');
  });

  it('matches the first supported browser language for a new user', () => {
    expect(resolveLocale('system', false, ['de-DE', 'es-MX', 'en'], true)).toBe('es');
    expect(resolveLocale('system', false, ['EN-us'], true)).toBe('en');
    expect(resolveLocale('system', false, ['ru-RU'], true)).toBe('ru');
  });

  it('falls back to en when nothing matches', () => {
    expect(resolveLocale('system', false, ['de', 'fr'], true)).toBe('en');
    expect(resolveLocale('system', false, [], true)).toBe('en');
  });
});

describe('useLocale', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves a released payload to ru for an existing user', () => {
    localStorage.setItem(
      'bachata-settings-v1',
      JSON.stringify({ version: 1, theme: 'system', locale: 'system' }),
    );
    vi.stubGlobal('navigator', { languages: ['en-US'], language: 'en-US' });
    useSettingsStore().init(true);
    expect(useLocale(true).value).toBe('ru');
  });

  it('resolves the phone language for a new user', () => {
    vi.stubGlobal('navigator', { languages: ['es-ES'], language: 'es-ES' });
    useSettingsStore().init(false);
    expect(useLocale(false).value).toBe('es');
  });

  it('keeps the persisted phone locale on the second launch', () => {
    vi.stubGlobal('navigator', { languages: ['es-ES'], language: 'es-ES' });
    useSettingsStore().init(false);
    setActivePinia(createPinia());
    useSettingsStore().init(true);
    expect(useLocale(true).value).toBe('es');
    expect(useSettingsStore().locale).toBe('es');
  });
});
