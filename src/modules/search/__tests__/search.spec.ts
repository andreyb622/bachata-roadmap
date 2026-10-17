import { describe, expect, it } from 'vitest';
import { PROGRAM, getAllItemIds } from '@/modules/program';
import type { ProgramPeriod } from '@/modules/program';
import { buildSearchIndex, getHighlightSegments, normalizeText, searchItems } from '../search';

describe('normalizeText', () => {
  it.each([
    ['ПРИВЕТ', 'привет'],
    ['Ёлка', 'елка'],
    ['ёж', 'еж'],
    ['  отступы  ', 'отступы'],
    ['много   пробелов\tтут', 'много пробелов тут'],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeText(input)).toBe(expected);
  });
});

describe('buildSearchIndex', () => {
  it('has one entry per item with stable ids', () => {
    const index = buildSearchIndex(PROGRAM);
    expect(index.map((entry) => entry.id)).toEqual(getAllItemIds(PROGRAM));
  });
});

describe('searchItems', () => {
  const index = buildSearchIndex(PROGRAM);

  it.each([[''], ['   ']])('returns nothing for query %j', (query) => {
    expect(searchItems(index, query)).toEqual([]);
  });

  it('is case-insensitive', () => {
    const results = searchItems(index, 'ПЕРЕНОС ВЕСА');
    expect(results.map((entry) => entry.id)).toContain('0-0-0');
  });

  it('treats ё and е as equal in both directions', () => {
    const program: ProgramPeriod[] = [
      {
        id: 0,
        badge: '',
        name: 'p',
        sections: [{ title: 'S', items: [{ id: 'a', text: 'Всё' }] }],
      },
      {
        id: 1,
        badge: '',
        name: 'p',
        sections: [{ title: 'S', items: [{ id: 'b', text: 'Все' }] }],
      },
    ];
    const plain = buildSearchIndex(program);
    expect(searchItems(plain, 'все').map((entry) => entry.id)).toEqual(['a', 'b']);
    expect(searchItems(plain, 'всё').map((entry) => entry.id)).toEqual(['a', 'b']);
  });

  it('returns all items of a section matched by title', () => {
    const results = searchItems(index, 'Соло разминка');
    const ids = results.map((entry) => entry.id);
    expect(ids).toContain('0-1-0');
    expect(ids).toContain('0-1-1');
  });

  it('returns nothing when nothing matches', () => {
    expect(searchItems(index, 'zzzzqqqq')).toEqual([]);
  });
});

describe('getHighlightSegments', () => {
  it('splits prefix match', () => {
    expect(getHighlightSegments('Перенос веса', 'пере')).toEqual([
      { text: 'Пере', isMatch: true },
      { text: 'нос веса', isMatch: false },
    ]);
  });

  it('splits middle match', () => {
    expect(getHighlightSegments('Перенос веса', 'нос')).toEqual([
      { text: 'Пере', isMatch: false },
      { text: 'нос', isMatch: true },
      { text: ' веса', isMatch: false },
    ]);
  });

  it('splits suffix match', () => {
    expect(getHighlightSegments('Перенос веса', 'веса')).toEqual([
      { text: 'Перенос ', isMatch: false },
      { text: 'веса', isMatch: true },
    ]);
  });

  it('marks only the first occurrence', () => {
    expect(getHighlightSegments('аба аба', 'аб')).toEqual([
      { text: 'аб', isMatch: true },
      { text: 'а аба', isMatch: false },
    ]);
  });

  it('ignores ё/е difference and keeps original casing', () => {
    expect(getHighlightSegments('Всё ЕЩЁ', 'все')).toEqual([
      { text: 'Всё', isMatch: true },
      { text: ' ЕЩЁ', isMatch: false },
    ]);
  });

  it.each([[''], ['   '], ['нету']])('returns the whole text for query %j', (query) => {
    expect(getHighlightSegments('Перенос', query)).toEqual([{ text: 'Перенос', isMatch: false }]);
  });
});
