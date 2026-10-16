import { beforeEach, describe, expect, it } from 'vitest';
import { resetSectionCollapse, useSectionCollapse } from '@/composables/useSectionCollapse';

describe('useSectionCollapse', () => {
  beforeEach(resetSectionCollapse);

  it('opens only the first section by default', () => {
    const { isOpen } = useSectionCollapse();
    expect(isOpen(0, 0)).toBe(true);
    expect(isOpen(0, 1)).toBe(false);
    expect(isOpen(2, 0)).toBe(true);
    expect(isOpen(2, 1)).toBe(false);
  });

  it('toggles a section open and closed', () => {
    const { isOpen, toggle } = useSectionCollapse();
    toggle(0, 1);
    expect(isOpen(0, 1)).toBe(true);
    toggle(0, 1);
    expect(isOpen(0, 1)).toBe(false);
    toggle(0, 0);
    expect(isOpen(0, 0)).toBe(false);
  });

  it('keeps periods independent', () => {
    const { isOpen, toggle } = useSectionCollapse();
    toggle(0, 0);
    expect(isOpen(0, 0)).toBe(false);
    expect(isOpen(1, 0)).toBe(true);
  });

  it('shares state between calls', () => {
    const first = useSectionCollapse();
    const second = useSectionCollapse();
    first.toggle(1, 2);
    expect(second.isOpen(1, 2)).toBe(true);
  });

  it('opens a closed section and keeps an open one open', () => {
    const { isOpen, open } = useSectionCollapse();
    open(0, 2);
    expect(isOpen(0, 2)).toBe(true);
    open(0, 2);
    expect(isOpen(0, 2)).toBe(true);
    open(0, 0);
    expect(isOpen(0, 0)).toBe(true);
  });

  it('closes on toggle after open', () => {
    const { isOpen, open, toggle } = useSectionCollapse();
    open(1, 1);
    toggle(1, 1);
    expect(isOpen(1, 1)).toBe(false);
  });
});
