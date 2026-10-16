import type { ProgramItem, ProgramPeriod, ProgramSection } from '../data/program';

export function getAllItemIds(program: readonly ProgramPeriod[]): string[] {
  return program.flatMap((period) =>
    period.sections.flatMap((section) => section.items.map((item) => item.id)),
  );
}

export function countDone(items: readonly ProgramItem[], progress: Record<string, true>): number {
  return items.filter((item) => progress[item.id]).length;
}

export function percent(done: number, total: number): number {
  return total ? Math.round((done / total) * 100) : 0;
}

export function sectionCounter(section: ProgramSection, progress: Record<string, true>): string {
  return `${countDone(section.items, progress)}/${section.items.length}`;
}

export function periodPercent(period: ProgramPeriod, progress: Record<string, true>): number {
  const items = period.sections.flatMap((section) => section.items);
  return percent(countDone(items, progress), items.length);
}
