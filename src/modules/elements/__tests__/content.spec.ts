import { describe, it, expect } from 'vitest';
import { ELEMENT_MODULES, SOLO_ELEMENTS_TABLE } from '../content';
import type { ElementsModule, ElementsSection } from '../content';

const modules: readonly ElementsModule[] = ELEMENT_MODULES;
const listSections: readonly ElementsSection[] = modules.flatMap((m) => m.sections);

describe('ELEMENT_MODULES', () => {
  it('has 5 modules', () => {
    expect(ELEMENT_MODULES).toHaveLength(5);
  });

  it.each([
    [0, 6],
    [1, 9],
    [2, 7],
    [3, 7],
    [4, 11],
  ])('module %i has %i sections', (index, count) => {
    expect(ELEMENT_MODULES[index]?.sections).toHaveLength(count);
  });

  it('has 40 list sections', () => {
    expect(listSections).toHaveLength(40);
  });

  it('has the solo elements table', () => {
    expect(SOLO_ELEMENTS_TABLE.title).toBe('17 сольных элементов');
  });

  it('has exactly 4 items with a note', () => {
    expect(listSections.flatMap((s) => s.items).filter((item) => item.note)).toHaveLength(4);
  });

  it('has 214 list items in total', () => {
    expect(listSections.flatMap((s) => s.items)).toHaveLength(214);
  });

  it.each([
    [0, 'Ритм и сольные основы', 15],
    [0, 'Рамочка, хват и перенос веса', 4],
    [0, 'Позиции', 7],
    [0, 'Повороты (базовые)', 16],
    [2, 'Дополнительно', 4],
    [4, 'Дополнительно', 1],
  ])('module %i section "%s" has %i items', (moduleIndex, title, count) => {
    const section = ELEMENT_MODULES[moduleIndex]?.sections.find((s) => s.title === title);
    expect(section?.items).toHaveLength(count);
  });

  it('has no empty item text', () => {
    expect(listSections.every((s) => s.items.every((item) => item.text.trim() !== ''))).toBe(true);
  });
});

describe('SOLO_ELEMENTS_TABLE', () => {
  it('has 17 rows', () => {
    expect(SOLO_ELEMENTS_TABLE.rows).toHaveLength(17);
  });

  it('has nums 1..17', () => {
    expect(SOLO_ELEMENTS_TABLE.rows.map((r) => r.num)).toEqual(
      Array.from({ length: 17 }, (_, i) => i + 1),
    );
  });
});
