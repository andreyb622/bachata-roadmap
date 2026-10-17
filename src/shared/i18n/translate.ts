import { createAppI18n, type AppI18n } from './index';
import sharedRu from './ru';

let activeI18n: AppI18n | null = null;

export function setActiveI18n(i18n: AppI18n): void {
  activeI18n = i18n;
}

export function translate(
  key: string,
  params: Record<string, unknown> = {},
  plural?: number,
): string {
  activeI18n ??= createAppI18n({ ru: sharedRu });
  const { t } = activeI18n.global;
  return plural === undefined ? t(key, params) : t(key, params, plural);
}
