export interface ProgramItem {
  id: string;
}

export interface ProgramSection {
  id: string;
  items: readonly ProgramItem[];
}

export interface ProgramPeriod {
  id: number;
  sections: readonly ProgramSection[];
}

export const PROGRAM = [
  {
    id: 0,
    sections: [
      {
        id: '0-0',
        items: [{ id: '0-0-0' }, { id: '0-0-1' }],
      },
      {
        id: '0-1',
        items: [{ id: '0-1-0' }, { id: '0-1-1' }],
      },
      {
        id: '0-2',
        items: [
          { id: '0-2-0' },
          { id: '0-2-1' },
          { id: '0-2-2' },
          { id: '0-2-3' },
          { id: '0-2-4' },
          { id: '0-2-5' },
          { id: '0-2-6' },
          { id: '0-2-7' },
          { id: '0-2-8' },
          { id: '0-2-9' },
          { id: '0-2-10' },
          { id: '0-2-11' },
          { id: '0-2-12' },
          { id: '0-2-13' },
          { id: '0-2-14' },
          { id: '0-2-15' },
          { id: '0-2-16' },
          { id: '0-2-17' },
          { id: '0-2-18' },
          { id: '0-2-19' },
          { id: '0-2-20' },
          { id: '0-2-21' },
          { id: '0-2-22' },
        ],
      },
    ],
  },
  {
    id: 1,
    sections: [
      {
        id: '1-0',
        items: [{ id: '1-0-0' }, { id: '1-0-1' }, { id: '1-0-2' }],
      },
      {
        id: '1-1',
        items: [{ id: '1-1-0' }, { id: '1-1-1' }],
      },
      {
        id: '1-2',
        items: [
          { id: '1-2-0' },
          { id: '1-2-1' },
          { id: '1-2-2' },
          { id: '1-2-3' },
          { id: '1-2-4' },
          { id: '1-2-5' },
          { id: '1-2-6' },
          { id: '1-2-7' },
          { id: '1-2-8' },
          { id: '1-2-9' },
          { id: '1-2-10' },
          { id: '1-2-11' },
        ],
      },
    ],
  },
  {
    id: 2,
    sections: [
      {
        id: '2-0',
        items: [{ id: '2-0-0' }, { id: '2-0-1' }],
      },
      {
        id: '2-1',
        items: [
          { id: '2-1-0' },
          { id: '2-1-1' },
          { id: '2-1-2' },
          { id: '2-1-3' },
          { id: '2-1-4' },
          { id: '2-1-5' },
          { id: '2-1-6' },
          { id: '2-1-7' },
        ],
      },
      {
        id: '2-2',
        items: [
          { id: '2-2-0' },
          { id: '2-2-1' },
          { id: '2-2-2' },
          { id: '2-2-3' },
          { id: '2-2-4' },
          { id: '2-2-5' },
          { id: '2-2-6' },
          { id: '2-2-7' },
          { id: '2-2-8' },
          { id: '2-2-9' },
          { id: '2-2-10' },
        ],
      },
    ],
  },
] as const satisfies readonly ProgramPeriod[];

export type PeriodId = (typeof PROGRAM)[number]['id'];

export const TAB_ICONS = ['🌱', '🌿', '🌸', '🔍'] as const;
