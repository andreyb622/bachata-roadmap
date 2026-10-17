import { isStorageOk, storageGet, storageSet, testStorage } from '@/shared/lib/safe-storage';

export const SETTINGS_KEY = 'bachata-settings-v1';

export const THEMES = { system: 'system', light: 'light', dark: 'dark' } as const;
export type Theme = (typeof THEMES)[keyof typeof THEMES];

export const LOCALES = { system: 'system', ru: 'ru', en: 'en', es: 'es' } as const;
export type Locale = (typeof LOCALES)[keyof typeof LOCALES];

export interface Settings {
  version: 1;
  theme: Theme;
  locale: Locale;
}

export function isTheme(value: unknown): value is Theme {
  return Object.values<unknown>(THEMES).includes(value);
}

export function isLocale(value: unknown): value is Locale {
  return Object.values<unknown>(LOCALES).includes(value);
}

export function resolveDefaultTheme(hasExistingState: boolean): Theme {
  return hasExistingState ? THEMES.dark : THEMES.system;
}

export function parseSettings(raw: string | null): Settings | null {
  if (raw === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  const { version, theme, locale } = parsed as Record<string, unknown>; // probing unknown payload fields
  if (version !== 1) return null;
  return {
    version: 1,
    theme: isTheme(theme) ? theme : THEMES.system,
    locale: isLocale(locale) ? locale : LOCALES.system,
  };
}

export function loadSettings(): Settings | null {
  if (!isStorageOk()) testStorage();
  return parseSettings(storageGet(SETTINGS_KEY));
}

export function saveSettings(settings: Settings): boolean {
  if (!isStorageOk()) testStorage();
  return storageSet(SETTINGS_KEY, JSON.stringify(settings));
}
