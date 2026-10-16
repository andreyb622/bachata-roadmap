import { registerSW } from 'virtual:pwa-register';
import { getCurrentScope, onScopeDispose } from 'vue';

const NON_TEXT_INPUT_TYPES = [
  'checkbox',
  'radio',
  'button',
  'submit',
  'reset',
  'range',
  'color',
  'file',
  'image',
] as const;
const TEXT_ENTRY_SELECTOR = [
  `input${NON_TEXT_INPUT_TYPES.map((type) => `:not([type="${type}"])`).join('')}`,
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');
const DIALOG_SELECTOR = '[role="dialog"], [aria-modal="true"]';

export function isSafeToReload(): boolean {
  const active = document.activeElement;
  if (active?.matches(TEXT_ENTRY_SELECTOR)) return false;
  return !document.querySelector(DIALOG_SELECTOR);
}

export function usePwaUpdate(): void {
  if (!('serviceWorker' in navigator)) return;

  let registration: ServiceWorkerRegistration | undefined;
  let isReloading = false;
  let isReloadPending = false;

  const reloadOnce = (): void => {
    if (isReloading) return;
    isReloading = true;
    window.location.reload();
  };

  const onNeedReload = (): void => {
    if (isSafeToReload()) {
      reloadOnce();
      return;
    }
    isReloadPending = true;
  };

  try {
    registerSW({
      immediate: true,
      onNeedReload,
      onRegisteredSW: (_url, registered) => {
        registration = registered;
      },
      onRegisterError: () => {},
    });
  } catch {
    return;
  }

  const onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden' && isReloadPending) {
      reloadOnce();
      return;
    }
    if (document.visibilityState !== 'visible') return;
    try {
      registration?.update().catch(() => {});
    } catch {
      // update() may throw synchronously when the worker is gone
    }
  };

  document.addEventListener('visibilitychange', onVisibilityChange);

  if (getCurrentScope()) {
    onScopeDispose(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    });
  }
}
