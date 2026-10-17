import { watchEffect } from 'vue';
import { hasStoredState } from '@/modules/profiles';
import { useLocale, useSettingsStore } from '@/modules/settings';
import type { AppI18n } from '@/shared/i18n';

/**
 * Must run after Pinia is installed and before the router is installed:
 * the `/` redirect creates the profiles store, which writes default state.
 */
export function initSettings(): void {
  useSettingsStore().init(hasStoredState());
}

export function initLocale(i18n: AppI18n): void {
  const locale = useLocale(hasStoredState());
  watchEffect(() => {
    i18n.global.locale.value = locale.value;
    document.documentElement.lang = locale.value;
    document.title = i18n.global.t('app.name');
  });
}
