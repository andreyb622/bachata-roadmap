import { beforeEach, describe, expect, it } from 'vitest';
import { hasStoredState } from '../storage';

describe('hasStoredState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is false on an empty device', () => {
    expect(hasStoredState()).toBe(false);
  });

  it('is true when the current state exists', () => {
    localStorage.setItem('bachata-state-v2', '{}');
    expect(hasStoredState()).toBe(true);
  });

  it('is true when only the legacy progress exists', () => {
    localStorage.setItem('bachata-progress-v1', '{}');
    expect(hasStoredState()).toBe(true);
  });
});
