import { describe, it, expect } from 'vitest';
import { ELEMENT_MODULES, SOLO_ELEMENTS_TABLE_ROWS } from '../content';
import type { ElementsModule, ElementsSection } from '../content';

const KEY_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const modules: readonly ElementsModule[] = ELEMENT_MODULES;
const listSections: readonly ElementsSection[] = modules.flatMap((m) => m.sections);

function isUnique(keys: readonly string[]) {
  return new Set(keys).size === keys.length;
}

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

  it('has 214 list items in total', () => {
    expect(listSections.flatMap((s) => s.items)).toHaveLength(214);
  });

  it('has kebab-case keys everywhere', () => {
    const keys = [
      ...modules.map((m) => m.key),
      ...listSections.map((s) => s.key),
      ...listSections.flatMap((s) => s.items.map((item) => item.key)),
    ];
    expect(keys.every((key) => KEY_PATTERN.test(key))).toBe(true);
  });

  it('has unique keys among siblings', () => {
    expect(isUnique(modules.map((m) => m.key))).toBe(true);
    expect(modules.every((m) => isUnique(m.sections.map((s) => s.key)))).toBe(true);
    expect(listSections.every((s) => isUnique(s.items.map((item) => item.key)))).toBe(true);
  });
});

describe('SOLO_ELEMENTS_TABLE_ROWS', () => {
  it('has 17 rows', () => {
    expect(SOLO_ELEMENTS_TABLE_ROWS).toHaveLength(17);
  });

  it('has nums 1..17', () => {
    expect(SOLO_ELEMENTS_TABLE_ROWS.map((r) => r.num)).toEqual(
      Array.from({ length: 17 }, (_, i) => i + 1),
    );
  });

  it('has unique kebab-case keys', () => {
    const keys = SOLO_ELEMENTS_TABLE_ROWS.map((r) => r.key);
    expect(isUnique(keys)).toBe(true);
    expect(keys.every((key) => KEY_PATTERN.test(key))).toBe(true);
  });
});
