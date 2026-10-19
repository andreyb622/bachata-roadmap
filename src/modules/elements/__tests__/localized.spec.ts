import { describe, it, expect } from 'vitest';
import { ELEMENT_MODULES, SOLO_ELEMENTS_TABLE_ROWS } from '../content';
import { getLocalizedElements } from '../localized';
import en from '../texts/en';
import es from '../texts/es';
import ru from '../texts/ru';

const moduleIds = ELEMENT_MODULES.map((m) => m.key);
const sectionIds = ELEMENT_MODULES.flatMap((m) => m.sections.map((s) => `${m.key}/${s.key}`));
const itemIds = ELEMENT_MODULES.flatMap((m) =>
  m.sections.flatMap((s) => s.items.map((item) => `${m.key}/${s.key}/${item.key}`)),
);

const elements = getLocalizedElements('ru');
const sections = elements.modules.flatMap((m) => m.sections);
const items = sections.flatMap((s) => s.items);

describe('elements ru dictionary', () => {
  it('has exactly the structure keys, in order', () => {
    expect(Object.keys(ru.modules)).toEqual(moduleIds);
    expect(Object.keys(ru.sections)).toEqual(sectionIds);
    expect(Object.keys(ru.items)).toEqual(itemIds);
    expect(Object.keys(ru.solo.rows)).toEqual(SOLO_ELEMENTS_TABLE_ROWS.map((r) => r.key));
  });

  it('has exactly 4 notes, all for existing items', () => {
    expect(Object.keys(ru.notes)).toHaveLength(4);
    expect(Object.keys(ru.notes).every((id) => id in ru.items)).toBe(true);
  });
});

describe('getLocalizedElements', () => {
  it('has no empty titles, texts or names', () => {
    expect(elements.modules.every((m) => m.title.trim() !== '')).toBe(true);
    expect(sections.every((s) => s.title.trim() !== '')).toBe(true);
    expect(items.every((item) => item.text.trim() !== '')).toBe(true);
    expect(elements.solo.rows.every((row) => row.name.trim() !== '')).toBe(true);
  });

  it('returns the Russian module title', () => {
    expect(elements.modules[0]?.title).toBe('Модуль 1 — Основы');
  });

  it.each([
    [0, 'Ритм и сольные основы', 15],
    [0, 'Рамочка, хват и перенос веса', 4],
    [0, 'Позиции', 7],
    [0, 'Повороты (базовые)', 16],
    [2, 'Дополнительно', 4],
    [4, 'Дополнительно', 1],
  ])('module %i section "%s" has %i items', (moduleIndex, title, count) => {
    const section = elements.modules[moduleIndex]?.sections.find((s) => s.title === title);
    expect(section?.items).toHaveLength(count);
  });

  it('has exactly the four known notes', () => {
    expect(items.flatMap((item) => (item.note ? [item.note] : []))).toEqual([
      '(порядок — на усмотрение тренера)',
      '(сольно)',
      '(начать)',
      '(лучше в паре)',
    ]);
  });

  it('has no note key on items without a note', () => {
    expect(items.filter((item) => 'note' in item)).toHaveLength(4);
  });

  it('keeps the note of the Rompe adelante item', () => {
    expect(items.find((item) => item.text === 'Rompe adelante')?.note).toBeUndefined();
    expect(
      items.find((item) => item.text === 'Мужская и женская партии на Rompe adelante')?.note,
    ).toBe('(сольно)');
  });

  it('returns the solo table texts', () => {
    expect(elements.solo.badge).toBe('Сводный перечень сольных элементов (Уровень 1)');
    expect(elements.solo.title).toBe('17 сольных элементов');
    expect(elements.solo.columns).toEqual(['№', 'Элемент', 'Модуль']);
    expect(elements.solo.rows).toHaveLength(17);
  });

  it.each(['xx'])('falls back to ru for %s', (locale) => {
    expect(getLocalizedElements(locale)).toEqual(elements);
  });
});

describe.each([
  ['en', en],
  ['es', es],
])('%s elements dictionary', (locale, dictionary) => {
  it('has the same keys as ru', () => {
    expect(Object.keys(dictionary.modules)).toEqual(Object.keys(ru.modules));
    expect(Object.keys(dictionary.sections)).toEqual(Object.keys(ru.sections));
    expect(Object.keys(dictionary.items)).toEqual(Object.keys(ru.items));
    expect(Object.keys(dictionary.notes)).toEqual(Object.keys(ru.notes));
    expect(Object.keys(dictionary.solo.rows)).toEqual(Object.keys(ru.solo.rows));
    expect(dictionary.solo.columns).toHaveLength(ru.solo.columns.length);
  });

  it('has no empty strings', () => {
    const values = [
      dictionary.intro,
      dictionary.solo.badge,
      dictionary.solo.title,
      ...dictionary.solo.columns,
      ...Object.values(dictionary.modules),
      ...Object.values(dictionary.sections),
      ...Object.values(dictionary.items),
      ...Object.values(dictionary.notes),
      ...Object.values(dictionary.solo.rows),
    ];
    expect(values.filter((value) => value.trim() === '')).toEqual([]);
  });

  it('is used by getLocalizedElements', () => {
    const localized = getLocalizedElements(locale);
    expect(localized.intro).toBe(dictionary.intro);
    expect(localized.modules[0]?.title).toBe(dictionary.modules.basics);
    expect(localized.solo.title).toBe(dictionary.solo.title);
    expect(localized.solo.columns).toEqual(dictionary.solo.columns);
  });
});
