/** Locale switching is on in production; the development override stays so the flag can be flipped back. */
export const LOCALES_ENABLED = true;

export function isLocaleSwitchEnabled(): boolean {
  return LOCALES_ENABLED || import.meta.env.MODE === 'development';
}
