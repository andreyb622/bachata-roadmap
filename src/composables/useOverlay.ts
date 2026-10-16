import { computed, nextTick, onScopeDispose, shallowRef, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';

interface OverlayEntry {
  close: () => void;
  opener: HTMLElement | null;
  parent: OverlayEntry | null;
}

const stack = shallowRef<OverlayEntry[]>([]);
let previousOverflow = '';
let lastReleased: OverlayEntry | null = null;

function findParent(opener: HTMLElement | null): OverlayEntry | null {
  if (!opener?.closest('[role="dialog"]')) return null;
  return stack.value[stack.value.length - 1] ?? lastReleased;
}

function findFocusTarget(entry: OverlayEntry): HTMLElement | null {
  let current: OverlayEntry | null = entry;
  while (current) {
    if (current.opener?.isConnected) return current.opener;
    current = current.parent;
  }
  return null;
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  stack.value[stack.value.length - 1]?.close();
}

function register(entry: OverlayEntry): void {
  if (stack.value.length === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);
  }
  stack.value = [...stack.value, entry];
}

function unregister(entry: OverlayEntry): void {
  stack.value = stack.value.filter((item) => item !== entry);
  if (stack.value.length === 0) {
    document.body.style.overflow = previousOverflow;
    document.removeEventListener('keydown', onKeydown);
  }
  lastReleased = entry;
  void nextTick(() => {
    if (lastReleased === entry) lastReleased = null;
    findFocusTarget(entry)?.focus();
  });
}

export function useOverlay(
  isOpen: Ref<boolean>,
  close: () => void,
): { isTopmost: ComputedRef<boolean> } {
  const current = shallowRef<OverlayEntry | null>(null);

  function release(): void {
    if (!current.value) return;
    unregister(current.value);
    current.value = null;
  }

  watch(
    isOpen,
    (open) => {
      if (open && !current.value) {
        const active = document.activeElement;
        const opener = active instanceof HTMLElement ? active : null;
        const entry: OverlayEntry = { close, opener, parent: findParent(opener) };
        current.value = entry;
        register(entry);
        return;
      }
      if (!open) release();
    },
    { immediate: true },
  );

  onScopeDispose(release);

  const isTopmost = computed(
    () => current.value !== null && stack.value[stack.value.length - 1] === current.value,
  );

  return { isTopmost };
}
