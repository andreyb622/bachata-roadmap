import { describe, expect, it } from 'vitest';
import { PROGRAM } from '../content';
import { getLocalizedProgram } from '../localized';
import { getAllItemIds } from '../progress';
import ru from '../texts/ru';

const program = getLocalizedProgram('ru');
const sections = program.flatMap((period) => period.sections);
const items = sections.flatMap((section) => section.items);

describe('getLocalizedProgram', () => {
  it('keeps the structure and item ids of the program', () => {
    expect(program).toHaveLength(3);
    expect(sections).toHaveLength(9);
    expect(items).toHaveLength(65);
    expect(items.map((item) => item.id)).toEqual(getAllItemIds(PROGRAM));
  });

  it('fills every badge, name, title and text', () => {
    const texts = [
      ...program.flatMap((period) => [period.badge, period.name]),
      ...sections.map((section) => section.title),
      ...items.map((item) => item.text),
    ];
    expect(texts.every((text) => text !== '')).toBe(true);
  });

  it('has a dictionary without extra keys', () => {
    expect(Object.keys(ru.items)).toEqual(items.map((item) => item.id));
    expect(Object.keys(ru.sections)).toEqual(sections.map((section) => section.id));
    expect(Object.keys(ru.periods)).toEqual(program.map((period) => String(period.id)));
  });

  it('returns the known Russian texts', () => {
    expect(program[0]?.badge).toBe('🌱 Первые 3 месяца');
    expect(program[0]?.name).toBe('3 месяца');
    expect(program[2]?.name).toBe('6+ месяцев');
    expect(program[1]?.sections.map((section) => section.title)).toEqual([
      'Разминка',
      'Соло разминка',
      'Элементы в паре',
    ]);
    expect(items.find((item) => item.id === '0-0-0')?.text).toBe('Перенос веса на месте');
  });

  it.each(['en', 'xx'])('falls back to ru for locale %s', (locale) => {
    expect(getLocalizedProgram(locale)).toEqual(program);
  });
});
