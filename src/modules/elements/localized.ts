import { ELEMENT_MODULES, SOLO_ELEMENTS_TABLE_ROWS } from './content';
import type { ElementItem, ElementsModule, ElementsSection, SoloElementRow } from './content';
import ru from './texts/ru';

export interface ElementsTexts {
  readonly intro: string;
  readonly modules: Readonly<Record<string, string>>;
  readonly sections: Readonly<Record<string, string>>;
  readonly items: Readonly<Record<string, string>>;
  readonly notes: Readonly<Record<string, string>>;
  readonly solo: {
    readonly badge: string;
    readonly title: string;
    readonly columns: readonly string[];
    readonly rows: Readonly<Record<string, string>>;
  };
}

export interface LocalizedElementItem extends ElementItem {
  readonly text: string;
  readonly note?: string;
}

export interface LocalizedElementsSection extends Omit<ElementsSection, 'items'> {
  readonly title: string;
  readonly items: readonly LocalizedElementItem[];
}

export interface LocalizedElementsModule extends Omit<ElementsModule, 'sections'> {
  readonly title: string;
  readonly sections: readonly LocalizedElementsSection[];
}

export interface LocalizedSoloRow extends SoloElementRow {
  readonly name: string;
}

export interface LocalizedElements {
  readonly intro: string;
  readonly modules: readonly LocalizedElementsModule[];
  readonly solo: {
    readonly badge: string;
    readonly title: string;
    readonly columns: readonly string[];
    readonly rows: readonly LocalizedSoloRow[];
  };
}

// en/es dictionaries come in stage 4.3; unknown locales fall back to ru.
const DICTIONARIES: Readonly<Record<string, ElementsTexts | undefined>> = { ru };

export function getLocalizedElements(locale: string): LocalizedElements {
  const texts: ElementsTexts = DICTIONARIES[locale] ?? ru;
  return {
    intro: texts.intro,
    modules: ELEMENT_MODULES.map((module) => ({
      key: module.key,
      title: texts.modules[module.key] ?? '',
      sections: module.sections.map((section) => ({
        key: section.key,
        title: texts.sections[`${module.key}/${section.key}`] ?? '',
        items: section.items.map((item) => {
          const id = `${module.key}/${section.key}/${item.key}`;
          const note = texts.notes[id];
          return {
            key: item.key,
            text: texts.items[id] ?? '',
            ...(note === undefined ? {} : { note }),
          };
        }),
      })),
    })),
    solo: {
      badge: texts.solo.badge,
      title: texts.solo.title,
      columns: texts.solo.columns,
      rows: SOLO_ELEMENTS_TABLE_ROWS.map((row) => ({
        ...row,
        name: texts.solo.rows[row.key] ?? '',
      })),
    },
  };
}
