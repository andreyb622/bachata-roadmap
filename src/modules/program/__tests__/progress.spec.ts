import { describe, it, expect } from 'vitest';
import { PROGRAM } from '../content';
import { countDone, getAllItemIds, percent, periodPercent, sectionCounter } from '../progress';

const period = PROGRAM[0];
const section = period.sections[0];
const sectionIds = section.items.map((item) => item.id);
const firstId = sectionIds[0] ?? '';

describe('getAllItemIds', () => {
  it('returns one id per program item', () => {
    const total = PROGRAM.reduce(
      (sum, p) => sum + p.sections.reduce((acc, s) => acc + s.items.length, 0),
      0,
    );
    expect(getAllItemIds(PROGRAM)).toHaveLength(total);
  });

  it('has no duplicate ids', () => {
    const ids = getAllItemIds(PROGRAM);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('countDone', () => {
  it('ignores ids that are not in items', () => {
    expect(countDone(section.items, { [firstId]: true, 'x-x-x': true })).toBe(1);
  });
});

describe('percent', () => {
  it.each([
    [0, 0, 0],
    [1, 3, 33],
    [2, 3, 67],
    [3, 3, 100],
  ])('percent(%i, %i) = %i', (done, total, expected) => {
    expect(percent(done, total)).toBe(expected);
  });
});

describe('sectionCounter', () => {
  it('shows zero done', () => {
    expect(sectionCounter(section, {})).toBe(`0/${section.items.length}`);
  });

  it('shows k done', () => {
    expect(sectionCounter(section, { [firstId]: true })).toBe(`1/${section.items.length}`);
  });
});

describe('periodPercent', () => {
  it('is 0 for empty progress', () => {
    expect(periodPercent(period, {})).toBe(0);
  });

  it('is 100 when all period items are done', () => {
    const progress: Record<string, true> = {};
    for (const s of period.sections) for (const item of s.items) progress[item.id] = true;
    expect(periodPercent(period, progress)).toBe(100);
  });
});
