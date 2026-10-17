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

function foldChar(char: string, locale: string): string {
  const lower = char.toLowerCase();
  if (locale === 'ru') return lower === 'ё' ? 'е' : lower;
  return lower.normalize('NFD').replace(/\p{M}/gu, '');
}

export function normalizeText(text: string, locale = 'ru'): string {
  return Array.from(text.normalize('NFC'), (char) => foldChar(char, locale))
    .join('')
    .trim()
    .replace(/\s+/g, ' ');
}

export function buildSearchIndex(program: readonly ProgramPeriod[], locale = 'ru'): SearchEntry[] {
  return program.flatMap((period) =>
    period.sections.flatMap((section, sectionIndex) =>
      section.items.map((item) => ({
        id: item.id,
        text: item.text,
        periodId: period.id,
        periodName: period.name,
        sectionIndex,
        sectionTitle: section.title,
        normalizedText: normalizeText(item.text, locale),
        normalizedSection: normalizeText(section.title, locale),
      })),
    ),
  );
}

export function searchItems(
  index: readonly SearchEntry[],
  query: string,
  locale = 'ru',
): SearchEntry[] {
  const normalizedQuery = normalizeText(query, locale);
  if (!normalizedQuery) return [];
  return index.filter(
    (entry) =>
      entry.normalizedText.includes(normalizedQuery) ||
      entry.normalizedSection.includes(normalizedQuery),
  );
}

function foldChars(text: string, locale: string): string {
  return Array.from(text, (char) => {
    const folded = foldChar(char, locale);
    return folded.length === char.length ? folded : char;
  }).join('');
}

export function getHighlightSegments(
  sourceText: string,
  query: string,
  locale = 'ru',
): HighlightSegment[] {
  const text = sourceText.normalize('NFC');
  const normalizedQuery = normalizeText(query, locale);
  const start = normalizedQuery ? foldChars(text, locale).indexOf(normalizedQuery) : -1;
  if (start === -1) return [{ text, isMatch: false }];

  const end = start + normalizedQuery.length;
  const segments: HighlightSegment[] = [
    { text: text.slice(0, start), isMatch: false },
    { text: text.slice(start, end), isMatch: true },
    { text: text.slice(end), isMatch: false },
  ];
  return segments.filter((segment) => segment.text !== '');
}
