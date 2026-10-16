import { reactive } from 'vue';

const DEFAULT_OPEN_SECTIONS = [0];

const openSections = reactive<Record<number, number[]>>({});

function getOpenSections(periodId: number): number[] {
  return openSections[periodId] ?? DEFAULT_OPEN_SECTIONS;
}

export function useSectionCollapse() {
  function isOpen(periodId: number, sectionIndex: number): boolean {
    return getOpenSections(periodId).includes(sectionIndex);
  }

  function toggle(periodId: number, sectionIndex: number): void {
    const current = getOpenSections(periodId);
    openSections[periodId] = current.includes(sectionIndex)
      ? current.filter((index) => index !== sectionIndex)
      : [...current, sectionIndex];
  }

  return { isOpen, toggle };
}

// tests only
export function resetSectionCollapse(): void {
  for (const key of Object.keys(openSections)) {
    delete openSections[Number(key)];
  }
}
