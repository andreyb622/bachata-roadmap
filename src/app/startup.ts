import { hasStoredState } from '@/modules/profiles';
import { useSettingsStore } from '@/modules/settings';

/**
 * Must run after Pinia is installed and before the router is installed:
 * the `/` redirect creates the profiles store, which writes default state.
 */
export function initSettings(): void {
  useSettingsStore().init(hasStoredState());
}
