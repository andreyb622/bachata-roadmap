import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { initLocale, initSettings } from '../startup';
import { useSettingsStore } from '@/modules/settings';
import { createAppI18n } from '@/shared/i18n';
import sharedRu from '@/shared/i18n/ru';

describe('initLocale', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
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
});
