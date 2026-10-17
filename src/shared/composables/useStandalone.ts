import { computed } from 'vue';
import type { Ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';

function hasNavigatorStandalone(): boolean {
  try {
    // navigator.standalone is a non-standard iOS Safari property missing from lib.dom types
    return (navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch {
    return false;
  }
}

export function useStandalone(): Readonly<Ref<boolean>> {
  const media = useMediaQuery('(display-mode: standalone)');
  return computed(() => media.value || hasNavigatorStandalone());
}
