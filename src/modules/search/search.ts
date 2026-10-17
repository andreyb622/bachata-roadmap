import type { ProgramPeriod } from '@/modules/program';

export type SearchEntry = Readonly<{
  id: string;
  text: string;
  periodId: number;
  periodName: string;
  sectionIndex: number;
  sectionTitle: string;
  normalizedText: string;
  normalizedSection: string;
}>;

export type HighlightSegment = { text: string; isMatch: boolean };

export function normalizeText(text: string): string {
  return text.toLowerCase().replaceAll('ё', 'е').trim().replace(/\s+/g, ' ');
}

export function buildSearchIndex(program: readonly ProgramPeriod[]): SearchEntry[] {
  return program.flatMap((period) =>
    period.sections.flatMap((section, sectionIndex) =>
      section.items.map((item) => ({
        id: item.id,
        text: item.text,
        periodId: period.id,
        periodName: period.name,
        sectionIndex,
        sectionTitle: section.title,
        normalizedText: normalizeText(item.text),
        normalizedSection: normalizeText(section.title),
      })),
    ),
  );
}

export function searchItems(index: readonly SearchEntry[], query: string): SearchEntry[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];
  return index.filter(
    (entry) =>
      entry.normalizedText.includes(normalizedQuery) ||
      entry.normalizedSection.includes(normalizedQuery),
  );
}

function foldChars(text: string): string {
  return Array.from(text, (char) => {
    const folded = char.toLowerCase().replaceAll('ё', 'е');
    return folded.length === char.length ? folded : char;
  }).join('');
}

export function getHighlightSegments(text: string, query: string): HighlightSegment[] {
  const normalizedQuery = normalizeText(query);
  const start = normalizedQuery ? foldChars(text).indexOf(normalizedQuery) : -1;
  if (start === -1) return [{ text, isMatch: false }];

  const end = start + normalizedQuery.length;
  const segments: HighlightSegment[] = [
    { text: text.slice(0, start), isMatch: false },
    { text: text.slice(start, end), isMatch: true },
    { text: text.slice(end), isMatch: false },
  ];
  return segments.filter((segment) => segment.text !== '');
}
