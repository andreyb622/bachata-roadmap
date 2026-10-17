import { createI18n } from 'vue-i18n';
import { ruPluralRule } from './plural';
import type sharedRu from './ru';

export type MessageSchema = typeof sharedRu;

export function createAppI18n(messages: Record<string, MessageSchema>) {
  return createI18n({
    legacy: false,
    locale: 'ru',
    fallbackLocale: 'ru',
    messages,
    pluralRules: { ru: ruPluralRule },
  });
}

export type AppI18n = ReturnType<typeof createAppI18n>;
