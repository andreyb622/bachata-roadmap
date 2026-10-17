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

  it('resolves to ru while locales are disabled', () => {
    useSettingsStore().init(false);
    vi.stubGlobal('navigator', { languages: ['en-US'], language: 'en-US' });
    expect(useLocale(false).value).toBe('ru');
  });
});
