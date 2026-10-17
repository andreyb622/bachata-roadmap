import { readonly, ref } from 'vue';
import { getUserMessage } from '@/shared/lib/errors';

interface ToastEntry {
  message: string;
  duration: number;
}

interface ShowErrorOptions {
  context?: Record<string, string | number | null | undefined>;
  duration?: number;
}

const queue: ToastEntry[] = [];
const current = ref<string | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

function next(): void {
  const entry = queue.shift();
  if (!entry) {
    current.value = null;
    timer = null;
    return;
  }
  current.value = entry.message;
  timer = setTimeout(next, entry.duration);
}

function show(message: string, duration = 2000): void {
  if (!message) return;
  const last = queue[queue.length - 1];
  if (last ? last.message === message : current.value === message) return;
  queue.push({ message, duration });
  if (current.value === null) next();
}

function showError(codeOrError: unknown, opts: ShowErrorOptions = {}): void {
  show(getUserMessage(codeOrError, opts.context), opts.duration ?? 3500);
}

function clear(): void {
  queue.length = 0;
  if (timer) clearTimeout(timer);
  timer = null;
  current.value = null;
}

export function useToast() {
  return { current: readonly(current), show, showError, clear };
}
