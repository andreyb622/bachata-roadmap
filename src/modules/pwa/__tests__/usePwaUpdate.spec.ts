import { effectScope, type EffectScope } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerSW } from 'virtual:pwa-register';
import { usePwaUpdate } from '../usePwaUpdate';

vi.mock('virtual:pwa-register', () => ({ registerSW: vi.fn() }));

type RegisterOptions = Parameters<typeof registerSW>[0];

function stubServiceWorker(): EventTarget {
  const serviceWorker = new EventTarget();
  vi.stubGlobal('navigator', { serviceWorker });
  return serviceWorker;
}

function getOptions(): NonNullable<RegisterOptions> {
  const options = vi.mocked(registerSW).mock.calls[0]?.[0];
  if (!options) throw new Error('registerSW was not called');
  return options;
}

function setVisibility(state: 'visible' | 'hidden'): void {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}

function register(update: () => Promise<void>): void {
  getOptions().onRegisteredSW?.('sw.js', { update } as unknown as ServiceWorkerRegistration);
}

let scope: EffectScope | undefined;

function mountComposable(): void {
  scope = effectScope();
  scope.run(() => usePwaUpdate());
}

afterEach(() => {
  scope?.stop();
  scope = undefined;
  Reflect.deleteProperty(document, 'visibilityState');
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('usePwaUpdate', () => {
  it('registers the service worker immediately', () => {
    stubServiceWorker();
    mountComposable();
    expect(getOptions().immediate).toBe(true);
  });

  it('updates the registration only when the page becomes visible', () => {
    stubServiceWorker();
    mountComposable();
    const update = vi.fn().mockResolvedValue(undefined);
    register(update);
    setVisibility('hidden');
    expect(update).not.toHaveBeenCalled();
    setVisibility('visible');
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('ignores a rejected update', async () => {
    stubServiceWorker();
    mountComposable();
    const update = vi.fn().mockRejectedValue(new Error('offline'));
    register(update);
    expect(() => setVisibility('visible')).not.toThrow();
    await Promise.resolve();
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('does nothing without service worker support', () => {
    vi.stubGlobal('navigator', {});
    mountComposable();
    expect(registerSW).not.toHaveBeenCalled();
  });

  describe('reload after an update', () => {
    function setup(): ReturnType<typeof vi.fn> {
      stubServiceWorker();
      const reload = vi.fn();
      vi.stubGlobal('location', { reload });
      mountComposable();
      return reload;
    }

    function needReload(): void {
      getOptions().onNeedReload?.();
    }

    it('reloads immediately when idle', () => {
      const reload = setup();
      needReload();
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('defers while an input is focused', () => {
      const reload = setup();
      const input = document.createElement('input');
      document.body.append(input);
      input.focus();
      needReload();
      expect(reload).not.toHaveBeenCalled();
    });

    it('does not defer while a checkbox is focused', () => {
      const reload = setup();
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      document.body.append(checkbox);
      checkbox.focus();
      needReload();
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('defers while a dialog is open', () => {
      const reload = setup();
      const dialog = document.createElement('div');
      dialog.setAttribute('role', 'dialog');
      document.body.append(dialog);
      needReload();
      expect(reload).not.toHaveBeenCalled();
    });

    it('reloads on hidden after a deferral, only once', () => {
      const reload = setup();
      const input = document.createElement('input');
      document.body.append(input);
      input.focus();
      needReload();
      setVisibility('hidden');
      setVisibility('hidden');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('does not reload on hidden without a pending update', () => {
      const reload = setup();
      setVisibility('hidden');
      expect(reload).not.toHaveBeenCalled();
    });
  });
});
