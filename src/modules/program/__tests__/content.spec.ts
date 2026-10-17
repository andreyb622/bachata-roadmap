import { describe, it, expect } from 'vitest';
import { PROGRAM } from '../content';
import type { ProgramPeriod } from '../content';

const periods: readonly ProgramPeriod[] = PROGRAM;

const rows = periods.flatMap((p) =>
  p.sections.flatMap((s, si) =>
    s.items.map((item, ii) => ({ id: item.id, expected: `${p.id}-${si}-${ii}` })),
  ),
);

describe('PROGRAM', () => {
  it('has 3 periods with ids 0, 1, 2', () => {
    expect(PROGRAM.map((p) => p.id)).toEqual([0, 1, 2]);
  });

  it('has 9 sections in total', () => {
    expect(periods.flatMap((p) => p.sections)).toHaveLength(9);
  });

  it('has 65 items in total', () => {
    expect(rows).toHaveLength(65);
  });

  it.each(rows)('item $expected has id matching formula', ({ id, expected }) => {
    expect(id).toBe(expected);
  });

  it('has unique item ids', () => {
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
