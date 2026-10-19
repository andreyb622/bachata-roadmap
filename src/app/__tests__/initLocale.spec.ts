import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { initLocale, initSettings } from '../startup';
import { useSettingsStore } from '@/modules/settings';
import { createAppI18n } from '@/shared/i18n';
import sharedRu from '@/shared/i18n/ru';
import sharedEn from '@/shared/i18n/en';
import sharedEs from '@/shared/i18n/es';

const SETTINGS_KEY = 'bachata-settings-v1';
const RELEASED_SYSTEM = JSON.stringify({ version: 1, theme: 'system', locale: 'system' });

function stubPhone(languages: string[]): void {
  vi.stubGlobal('navigator', { languages, language: languages[0] });
}

function launch(): void {
  setActivePinia(createPinia());
  initSettings();
  initLocale(createAppI18n({ ru: sharedRu, en: sharedEn, es: sharedEs }));
}

describe('initLocale', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    document.documentElement.lang = 'ru';
  });

  it('sets html lang and title, and follows the chosen locale', async () => {
    stubPhone(['es-ES']);
    localStorage.setItem('bachata-state-v2', '{}');
    launch();
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Bachata Roadmap');

    useSettingsStore().setLocale('en');
    await nextTick();
    expect(document.documentElement.lang).toBe('en');
  });

  it.each([
    ['state only', { 'bachata-state-v2': '{}' }],
    ['state and system theme', { 'bachata-state-v2': '{}', [SETTINGS_KEY]: RELEASED_SYSTEM }],
    [
      'state and light theme',
      {
        'bachata-state-v2': '{}',
        [SETTINGS_KEY]: JSON.stringify({ version: 1, theme: 'light', locale: 'system' }),
      },
    ],
    [
      'state and dark theme',
      {
        'bachata-state-v2': '{}',
        [SETTINGS_KEY]: JSON.stringify({ version: 1, theme: 'dark', locale: 'system' }),
      },
    ],
    ['legacy progress only', { 'bachata-progress-v1': '{}' }],
    [
      'legacy progress and settings',
      {
        'bachata-progress-v1': '{}',
        [SETTINGS_KEY]: JSON.stringify({ version: 1, theme: 'dark', locale: 'system' }),
      },
    ],
  ])('keeps ru for an existing user (%s)', (_label, entries) => {
    stubPhone(['es-ES']);
    Object.entries(entries).forEach(([key, value]) => localStorage.setItem(key, value));
    launch();
    expect(document.documentElement.lang).toBe('ru');
    if (SETTINGS_KEY in entries) {
      expect(localStorage.getItem(SETTINGS_KEY)).toBe(entries[SETTINGS_KEY]);
    }
  });

  it('uses the phone language for a released payload without stored progress', () => {
    stubPhone(['es-ES']);
    localStorage.setItem(SETTINGS_KEY, RELEASED_SYSTEM);
    launch();
    expect(document.documentElement.lang).toBe('es');
    expect(localStorage.getItem(SETTINGS_KEY)).toBe(RELEASED_SYSTEM);
  });

  it('keeps the phone language for a new user on the second launch', () => {
    stubPhone(['es-ES']);
    launch();
    expect(document.documentElement.lang).toBe('es');
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!)).toEqual({
      version: 1,
      theme: 'system',
      locale: 'es',
    });

    localStorage.setItem('bachata-state-v2', '{}');
    launch();
    expect(document.documentElement.lang).toBe('es');
  });

  it('falls back to en for an unsupported phone language', () => {
    stubPhone(['de-DE']);
    launch();
    expect(document.documentElement.lang).toBe('en');
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!).locale).toBe('en');
  });

  it('honors an explicit choice of an existing user', () => {
    stubPhone(['es-ES']);
    localStorage.setItem('bachata-state-v2', '{}');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ version: 1, theme: 'dark', locale: 'en' }));
    launch();
    expect(document.documentElement.lang).toBe('en');
  });

  it('follows the chosen locale when the switch is enabled', async () => {
    vi.stubEnv('MODE', 'development');
    const i18n = createAppI18n({ ru: sharedRu, en: sharedEn });
    initSettings();
    initLocale(i18n);
    useSettingsStore().setLocale('en');
    await nextTick();
    expect(document.documentElement.lang).toBe('en');
    expect(i18n.global.locale.value).toBe('en');
  });
});
