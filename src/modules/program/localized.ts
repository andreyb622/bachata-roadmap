import { PROGRAM } from './content';
import type { ProgramItem, ProgramPeriod, ProgramSection } from './content';
import ru from './texts/ru';

export interface ProgramTexts {
  readonly periods: Readonly<Record<string, { readonly badge: string; readonly name: string }>>;
  readonly sections: Readonly<Record<string, string>>;
  readonly items: Readonly<Record<string, string>>;
}

export interface LocalizedItem extends ProgramItem {
  readonly text: string;
}

export interface LocalizedSection extends Omit<ProgramSection, 'items'> {
  readonly title: string;
  readonly items: readonly LocalizedItem[];
}

export interface LocalizedPeriod extends Omit<ProgramPeriod, 'sections'> {
  readonly badge: string;
  readonly name: string;
  readonly sections: readonly LocalizedSection[];
}

// en/es dictionaries come in stage 4.3; unknown locales fall back to ru.
const DICTIONARIES: Readonly<Record<string, ProgramTexts | undefined>> = { ru };

export function getLocalizedProgram(locale: string): LocalizedPeriod[] {
  const texts: ProgramTexts = DICTIONARIES[locale] ?? ru;
  return PROGRAM.map((period) => ({
    id: period.id,
    badge: texts.periods[String(period.id)]?.badge ?? '',
    name: texts.periods[String(period.id)]?.name ?? '',
    sections: period.sections.map((section) => ({
      id: section.id,
      title: texts.sections[section.id] ?? '',
      items: section.items.map((item) => ({ id: item.id, text: texts.items[item.id] ?? '' })),
    })),
  }));
}
