import { LOCALES } from './storage';
import type { Locale } from './storage';

export type ResolvedLocale = Exclude<Locale, typeof LOCALES.system>;

const MATCHABLE: readonly ResolvedLocale[] = [LOCALES.ru, LOCALES.es, LOCALES.en];

export function resolveLocale(
  saved: Locale,
  hasExistingState: boolean,
  languages: readonly string[],
  localesEnabled: boolean,
): ResolvedLocale {
  if (!localesEnabled) return LOCALES.ru;
  if (saved !== LOCALES.system) return saved;
  if (hasExistingState) return LOCALES.ru;
  for (const language of languages) {
    const prefix = language.toLowerCase().split('-')[0];
    const match = MATCHABLE.find((locale) => locale === prefix);
    if (match) return match;
  }
  return LOCALES.en;
}

export function readBrowserLanguages(): string[] {
  return navigator.languages?.length ? [...navigator.languages] : [navigator.language];
}

/** Locale to persist when no settings are saved yet: a new user keeps the phone language. */
export function resolveFirstLaunchLocale(
  hasExistingState: boolean,
  languages: readonly string[],
  localesEnabled: boolean,
): Locale {
  if (hasExistingState || !localesEnabled) return LOCALES.system;
  return resolveLocale(LOCALES.system, false, languages, true);
}
