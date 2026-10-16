import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { effectScope } from 'vue';
import type { EffectScope } from 'vue';
import { INSTALL_HINT_KEY, useInstallHint } from '../useInstallHint';

let scope: EffectScope;
let standaloneMatches = false;

function stubNavigation(entries: { type: string }[]): void {
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue(
    entries as unknown as PerformanceEntryList,
  );
}

function setup() {
  scope = effectScope();
  const hint = scope.run(() => useInstallHint());
  if (!hint) throw new Error('scope did not run');
  return hint;
}

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  standaloneMatches = false;
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: standaloneMatches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
  stubNavigation([{ type: 'navigate' }]);
});

afterEach(() => {
  scope.stop();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useInstallHint', () => {
  it('is hidden before 500 ms', () => {
    const { isVisible } = setup();
    vi.advanceTimersByTime(499);
    expect(isVisible.value).toBe(false);
  });

  it('is shown after 500 ms', () => {
    const { isVisible } = setup();
    vi.advanceTimersByTime(500);
    expect(isVisible.value).toBe(true);
  });

  it('is hidden in standalone mode', () => {
    standaloneMatches = true;
    const { isVisible } = setup();
    vi.advanceTimersByTime(1000);
    expect(isVisible.value).toBe(false);
  });

  it('is hidden when the key is already set', () => {
    sessionStorage.setItem(INSTALL_HINT_KEY, '1');
    const { isVisible } = setup();
    vi.advanceTimersByTime(1000);
    expect(isVisible.value).toBe(false);
  });

  it.each(['reload', 'back_forward'])('is hidden on %s navigation', (type) => {
    stubNavigation([{ type }]);
    const { isVisible } = setup();
    vi.advanceTimersByTime(1000);
    expect(isVisible.value).toBe(false);
  });

  it('stays hidden when the key is set during the delay', () => {
    const { isVisible } = setup();
    sessionStorage.setItem(INSTALL_HINT_KEY, '1');
    vi.advanceTimersByTime(1000);
    expect(isVisible.value).toBe(false);
  });

  it('dismiss writes the key and hides', () => {
    const { isVisible, dismiss } = setup();
    vi.advanceTimersByTime(500);
    dismiss();
    expect(sessionStorage.getItem(INSTALL_HINT_KEY)).toBe('1');
    expect(isVisible.value).toBe(false);
  });

  it('is hidden without throwing when sessionStorage throws', () => {
    const spy = vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    let result: ReturnType<typeof setup> | undefined;
    expect(() => {
      result = setup();
      vi.advanceTimersByTime(1000);
    }).not.toThrow();
    expect(result?.isVisible.value).toBe(false);
    spy.mockRestore();
  });

  it('falls back to the key check without a navigation entry', () => {
    stubNavigation([]);
    const { isVisible } = setup();
    vi.advanceTimersByTime(500);
    expect(isVisible.value).toBe(true);
  });

  it('stopping the scope clears the timer', () => {
    const { isVisible } = setup();
    scope.stop();
    vi.advanceTimersByTime(1000);
    expect(isVisible.value).toBe(false);
  });
});
