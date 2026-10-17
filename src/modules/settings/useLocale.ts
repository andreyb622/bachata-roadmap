import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import { isLocaleSwitchEnabled } from '@/shared/config/locales';
import { LOCALES } from './storage';
import type { Locale } from './storage';
import { useSettingsStore } from './store';

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

export function useLocale(hasExistingState: boolean): ComputedRef<ResolvedLocale> {
  const settings = useSettingsStore();
  const languages = navigator.languages?.length ? [...navigator.languages] : [navigator.language];
  return computed(() =>
    resolveLocale(settings.locale, hasExistingState, languages, isLocaleSwitchEnabled()),
  );
}
