import { describe, expect, it } from 'vitest';
import { createAppI18n } from '../index';
import sharedRu from '../ru';

describe('createAppI18n', () => {
  it('translates shared keys with precompiled messages', () => {
    const i18n = createAppI18n({ ru: sharedRu });
    expect(i18n.global.t('app.name')).toBe('Bachata Roadmap');
    expect(i18n.global.locale.value).toBe('ru');
  });
});
