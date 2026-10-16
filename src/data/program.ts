export interface ProgramItem {
  id: string;
  text: string;
}

export interface ProgramSection {
  title: string;
  items: readonly ProgramItem[];
}

export interface ProgramPeriod {
  id: number;
  badge: string;
  name: string;
  sections: readonly ProgramSection[];
}

export const PROGRAM = [
  {
    id: 0,
    badge: '🌱 Первые 3 месяца',
    name: '3 месяца',
    sections: [
      {
        title: 'Разминка',
        items: [
          { id: '0-0-0', text: 'Перенос веса на месте' },
          { id: '0-0-1', text: 'Грудной отдел — работа лопаток' },
        ],
      },
      {
        title: 'Соло разминка',
        items: [
          { id: '0-1-0', text: 'Прогон пройденных фигур' },
          { id: '0-1-1', text: 'Попадание в 1 счёт' },
        ],
      },
      {
        title: 'Элементы в паре',
        items: [
          { id: '0-2-0', text: 'Бейсик, шаг с точкой, поворот' },
          { id: '0-2-1', text: 'Обычный поворот партнёрши в паре' },
          { id: '0-2-2', text: 'Прогулка' },
          { id: '0-2-3', text: 'Поворот через фрисби' },
          { id: '0-2-4', text: 'Прогулка через фрисби' },
          { id: '0-2-5', text: 'Повороты партнёров (через плечо)' },
          { id: '0-2-6', text: 'Смена направлений и смена мест, скрестный' },
          { id: '0-2-7', text: 'Аллардо' },
          { id: '0-2-8', text: 'Бросок рук' },
          { id: '0-2-9', text: 'Ганчо' },
          { id: '0-2-10', text: 'Замок' },
          { id: '0-2-11', text: 'V-стэп' },
          { id: '0-2-12', text: 'Квадрат' },
          { id: '0-2-13', text: 'Hammerlock' },
          { id: '0-2-14', text: 'Слайд' },
          { id: '0-2-15', text: 'Поворот с 2 руками' },
          { id: '0-2-16', text: 'Поворот за корпус' },
          { id: '0-2-17', text: 'Кулито, циркуло' },
          { id: '0-2-18', text: 'Полузакрытая и закрытая позиции' },
          { id: '0-2-19', text: 'Ромпе' },
          { id: '0-2-20', text: 'Медиа (поворот для выхода из теневой)' },
          { id: '0-2-21', text: 'Теневая' },
          { id: '0-2-22', text: 'Смена позиций в открытой позиции' },
        ],
      },
    ],
  },
  {
    id: 1,
    badge: '🌿 3–5 месяцев',
    name: '3–5 месяцев',
    sections: [
      {
        title: 'Разминка',
        items: [
          { id: '1-0-0', text: 'Принцип маятника на базовых перемещениях (крабом)' },
          { id: '1-0-1', text: 'Принципы работы грудного отдела' },
          { id: '1-0-2', text: 'Зиг-заг' },
        ],
      },
      {
        title: 'Соло разминка',
        items: [
          { id: '1-1-0', text: 'Прогон пройденных фигур' },
          { id: '1-1-1', text: 'Бейсик на месте' },
        ],
      },
      {
        title: 'Элементы в паре',
        items: [
          { id: '1-2-0', text: 'Side бейсик' },
          { id: '1-2-1', text: 'Мадридский шаг (зиг-заг)' },
          { id: '1-2-2', text: 'Обратный поворот' },
          { id: '1-2-3', text: 'Pico-pico' },
          { id: '1-2-4', text: 'Triple step на месте' },
          { id: '1-2-5', text: 'Open break' },
          { id: '1-2-6', text: 'Прочёс в теневой' },
          { id: '1-2-7', text: 'Импульсо в теневой' },
          { id: '1-2-8', text: 'Мельница' },
          { id: '1-2-9', text: 'Reverse step' },
          { id: '1-2-10', text: 'Reverse turn' },
          { id: '1-2-11', text: 'Кулито в закрытой' },
        ],
      },
    ],
  },
  {
    id: 2,
    badge: '🌸 6+ месяцев',
    name: '6+ месяцев',
    sections: [
      {
        title: 'Разминка',
        items: [
          { id: '2-0-0', text: 'Волны' },
          { id: '2-0-1', text: 'Принципы грудного отдела на хедролах' },
        ],
      },
      {
        title: 'Соло разминка',
        items: [
          { id: '2-1-0', text: 'Прогон пройденных фигур' },
          { id: '2-1-1', text: 'Bass step' },
          { id: '2-1-2', text: 'На 2, на 6' },
          { id: '2-1-3', text: 'На 3, на 7' },
          { id: '2-1-4', text: 'Двойной поворот' },
          { id: '2-1-5', text: 'Triple cha-cha pico' },
          { id: '2-1-6', text: 'Виды точек' },
          { id: '2-1-7', text: 'Sakaíta' },
        ],
      },
      {
        title: 'Элементы в паре',
        items: [
          { id: '2-2-0', text: 'Чистим мадрид с твистом' },
          { id: '2-2-1', text: 'Фронтальная волна в закрытой' },
          { id: '2-2-2', text: 'Боковая волна в закрытой' },
          { id: '2-2-3', text: 'Боковая волна в закрытой на точку' },
          { id: '2-2-4', text: 'Волны в обратном направлении' },
          { id: '2-2-5', text: 'Спуск / подъём (поклон)' },
          { id: '2-2-6', text: 'Обычный хедрол' },
          { id: '2-2-7', text: 'Bass step triple cha-cha pico-pico' },
          { id: '2-2-8', text: 'Двойной поворот' },
          { id: '2-2-9', text: 'Поворот на 2,6 и на 3,7' },
          { id: '2-2-10', text: 'Свивлы' },
        ],
      },
    ],
  },
] as const satisfies readonly ProgramPeriod[];

export type PeriodId = (typeof PROGRAM)[number]['id'];

export const TAB_ICONS = ['🌱', '🌿', '🌸', '🔍'] as const;
export const TAB_LABELS = ['3 мес', '3–5', '6+', 'Поиск'] as const;
