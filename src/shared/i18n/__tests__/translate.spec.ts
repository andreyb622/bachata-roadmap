import { afterEach, describe, expect, it } from 'vitest';
import { createAppI18n } from '../index';
import sharedRu from '../ru';
import { setActiveI18n, translate } from '../translate';

describe('translate', () => {
  const sharedI18n = createAppI18n({ ru: sharedRu });

  afterEach(() => {
    setActiveI18n(sharedI18n);
  });

  it('translates a shared key', () => {
    expect(translate('app.name')).toBe('Bachata Roadmap');
  });

  it('picks the Russian plural form', () => {
    expect(translate('errors.entity_name_too_long', { maxLen: 21 }, 21)).toMatch(/21 символа$/);
    expect(translate('errors.entity_name_too_long', { maxLen: 40 }, 40)).toMatch(/40 символов$/);
  });

  it('uses the bound i18n instance', () => {
    setActiveI18n(createAppI18n({ ru: { ...sharedRu, extra: { x: 'X' } } as never }));
    expect(translate('extra.x')).toBe('X');
  });
});
