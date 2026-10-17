import { describe, expect, it } from 'vitest';
import { ruPluralRule } from '../plural';

describe('ruPluralRule', () => {
  it.each([1, 21, 101])('%i uses the one form', (count) => {
    expect(ruPluralRule(count, 3)).toBe(0);
  });

  it.each([2, 3, 4, 22])('%i uses the few form', (count) => {
    expect(ruPluralRule(count, 3)).toBe(1);
  });

  it.each([0, 5, 11, 12, 14, 40, 50, 111])('%i uses the many form', (count) => {
    expect(ruPluralRule(count, 3)).toBe(2);
  });

  it('caps the index by the number of choices', () => {
    expect(ruPluralRule(5, 2)).toBe(1);
  });
});
