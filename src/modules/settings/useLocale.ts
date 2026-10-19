import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import { isLocaleSwitchEnabled } from '@/shared/config/locales';
import { readBrowserLanguages, resolveLocale } from './locale';
import type { ResolvedLocale } from './locale';
import { useSettingsStore } from './store';

export { resolveLocale } from './locale';
export type { ResolvedLocale } from './locale';

export function useLocale(hasExistingState: boolean): ComputedRef<ResolvedLocale> {
  const settings = useSettingsStore();
  const languages = readBrowserLanguages();
  return computed(() =>
    resolveLocale(settings.locale, hasExistingState, languages, isLocaleSwitchEnabled()),
  );
}
