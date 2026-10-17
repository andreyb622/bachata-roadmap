/** Locale switching is off in production: production stays ru-only until the owner enables locales. */
export const LOCALES_ENABLED = false;

export function isLocaleSwitchEnabled(): boolean {
  return LOCALES_ENABLED || import.meta.env.MODE === 'development';
}
