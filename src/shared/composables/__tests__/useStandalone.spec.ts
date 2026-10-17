import { describe, it, expect, vi, afterEach } from 'vitest';
import { effectScope } from 'vue';
import { useStandalone } from '../useStandalone';

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
}

function run(): boolean {
  const scope = effectScope();
  const value = scope.run(() => useStandalone().value) ?? false;
  scope.stop();
  return value;
}

const originalDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'standalone');

function setNavigatorStandalone(value: boolean): void {
  Object.defineProperty(window.navigator, 'standalone', { value, configurable: true });
}

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalDescriptor) {
    Object.defineProperty(window.navigator, 'standalone', originalDescriptor);
  } else {
    Reflect.deleteProperty(window.navigator, 'standalone');
  }
});

describe('useStandalone', () => {
  it.each([
    { media: true, nav: false, expected: true },
    { media: false, nav: true, expected: true },
    { media: false, nav: false, expected: false },
  ])('media=$media nav=$nav -> $expected', ({ media, nav, expected }) => {
    stubMatchMedia(media);
    setNavigatorStandalone(nav);
    expect(run()).toBe(expected);
  });

  it('is false without matchMedia and does not throw', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(run()).toBe(false);
  });
});
