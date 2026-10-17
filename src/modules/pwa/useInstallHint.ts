import { getCurrentScope, onScopeDispose, ref } from 'vue';
import type { Ref } from 'vue';
import { useStandalone } from '@/shared/composables/useStandalone';

export const INSTALL_HINT_KEY = 'bachata-install-hint-dismissed';

export function isFirstPageLoad(): boolean {
  try {
    // getEntriesByType returns the generic PerformanceEntry; 'navigation' entries are timing objects
    const nav = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    if (nav) return nav.type === 'navigate';
  } catch {
    // fall back to the session flag
  }
  try {
    return !sessionStorage.getItem(INSTALL_HINT_KEY);
  } catch {
    return false;
  }
}

export function useInstallHint(): { isVisible: Readonly<Ref<boolean>>; dismiss: () => void } {
  const standalone = useStandalone();
  const isVisible = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function dismiss(): void {
    try {
      sessionStorage.setItem(INSTALL_HINT_KEY, '1');
    } catch {
      // ignore
    }
    isVisible.value = false;
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      if (timer) clearTimeout(timer);
    });
  }

  if (standalone.value) return { isVisible, dismiss };

  try {
    if (sessionStorage.getItem(INSTALL_HINT_KEY)) return { isVisible, dismiss };
  } catch {
    return { isVisible, dismiss };
  }

  if (!isFirstPageLoad()) return { isVisible, dismiss };

  timer = setTimeout(() => {
    try {
      if (sessionStorage.getItem(INSTALL_HINT_KEY)) return;
    } catch {
      return;
    }
    isVisible.value = true;
  }, 500);

  return { isVisible, dismiss };
}
