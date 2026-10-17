import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { initLocale, initSettings } from '../startup';
import { useSettingsStore } from '@/modules/settings';
import { createAppI18n } from '@/shared/i18n';
import sharedRu from '@/shared/i18n/ru';
import sharedEn from '@/shared/i18n/en';

describe('initLocale', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    document.documentElement.lang = 'ru';
  });

  it('sets html lang and title, and stays ru while locales are disabled', async () => {
    initSettings();
    initLocale(createAppI18n({ ru: sharedRu }));
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Bachata Roadmap');

    useSettingsStore().setLocale('en');
    await nextTick();
    expect(document.documentElement.lang).toBe('ru');
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
