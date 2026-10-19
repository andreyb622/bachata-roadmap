import { afterEach, describe, expect, it, vi } from 'vitest';
import { readBrowserLanguages, resolveFirstLaunchLocale } from '../locale';

describe('resolveFirstLaunchLocale', () => {
  it('returns system for an existing user', () => {
    expect(resolveFirstLaunchLocale(true, ['es-ES'], true)).toBe('system');
  });

  it('returns system while locales are disabled', () => {
    expect(resolveFirstLaunchLocale(false, ['es-ES'], false)).toBe('system');
  });

  it.each([
    [['es-MX'], 'es'],
    [['ru-RU'], 'ru'],
    [['en-GB'], 'en'],
    [['de-DE'], 'en'],
    [[], 'en'],
  ])('resolves a new user with %j to %s', (languages, expected) => {
    expect(resolveFirstLaunchLocale(false, languages, true)).toBe(expected);
  });
});

describe('readBrowserLanguages', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to navigator.language when languages is empty', () => {
    vi.stubGlobal('navigator', { languages: [], language: 'es-ES' });
    expect(readBrowserLanguages()).toEqual(['es-ES']);
  });

  it('returns navigator.languages when present', () => {
    vi.stubGlobal('navigator', { languages: ['en-US', 'ru'], language: 'en-US' });
    expect(readBrowserLanguages()).toEqual(['en-US', 'ru']);
  });
});
