import { afterEach, describe, expect, it } from 'vitest';
import { i18n } from '@/app/i18n';

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  // Compiled messages are AST nodes, not nested namespaces.
  if ('type' in value && 'body' in value) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

const rawCatalogs = import.meta.glob('../../**/i18n/{en,es}.ts', {
  eager: true,
  import: 'default',
});

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(collectStrings);
}

function keysOf(locale: string): string[] {
  return flattenKeys(i18n.global.getLocaleMessage(locale)).sort();
}

describe('message catalogs', () => {
  afterEach(() => {
    i18n.global.locale.value = 'ru';
  });

  it.each(['en', 'es'])('%s has the same keys as ru', (locale) => {
    expect(keysOf(locale)).toEqual(keysOf('ru'));
  });

  it.each(['en', 'es'])('%s has at most two plural forms per message', (locale) => {
    const catalogs = Object.entries(rawCatalogs)
      .filter(([path]) => path.endsWith(`/${locale}.ts`))
      .map(([, catalog]) => catalog);
    const rawStrings = catalogs.flatMap(collectStrings);
    expect(catalogs.length).toBeGreaterThan(0);
    expect(rawStrings.filter((value) => value.split('|').length > 2)).toEqual([]);
  });

  it.each(['en', 'es'] as const)('%s uses a two-form plural', (locale) => {
    i18n.global.locale.value = locale;
    const { t } = i18n.global;
    const one = t('shell.subtitle.elements', { n: 1 }, 1);
    const many = t('shell.subtitle.elements', { n: 5 }, 5);
    expect(one).not.toBe(many);
    expect(one).not.toContain('|');
    expect(many).not.toContain('|');
    expect(one).toContain('1');
    expect(many).toContain('5');
  });
});
