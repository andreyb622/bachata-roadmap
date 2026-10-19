import { ref } from 'vue';
import { defineStore } from 'pinia';
import { isLocaleSwitchEnabled } from '@/shared/config/locales';
import { readBrowserLanguages, resolveFirstLaunchLocale } from './locale';
import { LOCALES, loadSettings, resolveDefaultTheme, saveSettings, THEMES } from './storage';
import type { Locale, Settings, Theme } from './storage';

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>(THEMES.system);
  const locale = ref<Locale>(LOCALES.system);

  function toSettings(): Settings {
    return { version: 1, theme: theme.value, locale: locale.value };
  }

  function init(hasExistingState: boolean): void {
    const loaded = loadSettings();
    if (loaded === null) {
      theme.value = resolveDefaultTheme(hasExistingState);
      locale.value = resolveFirstLaunchLocale(
        hasExistingState,
        readBrowserLanguages(),
        isLocaleSwitchEnabled(),
      );
      saveSettings(toSettings());
      return;
    }
    theme.value = loaded.theme;
    locale.value = loaded.locale;
  }

  function setTheme(next: Theme): boolean {
    theme.value = next;
    return saveSettings(toSettings());
  }

  function setLocale(next: Locale): boolean {
    locale.value = next;
    return saveSettings(toSettings());
  }

  return { theme, locale, init, setTheme, setLocale };
});
