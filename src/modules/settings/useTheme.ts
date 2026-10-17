import { computed, readonly, watchEffect } from 'vue';
import type { Ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { useSettingsStore } from './store';
import type { Theme } from './storage';

export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}

export function useTheme(): { resolvedTheme: Readonly<Ref<ResolvedTheme>> } {
  const store = useSettingsStore();
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedTheme = computed(() => resolveTheme(store.theme, prefersDark.value));

  watchEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme.value;
    root.style.colorScheme = resolvedTheme.value;
    const color = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (color) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  });

  return { resolvedTheme: readonly(resolvedTheme) };
}
