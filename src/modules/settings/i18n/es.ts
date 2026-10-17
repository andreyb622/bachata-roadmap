import type ru from './ru';

export default {
  settings: {
    title: 'Ajustes',
    theme: 'Tema',
    themeOptions: { system: 'Como en el sistema', light: 'Claro', dark: 'Oscuro' },
    language: 'Idioma',
    languageOptions: { system: 'Como en el sistema', ru: 'Русский', en: 'English', es: 'Español' },
  },
} satisfies typeof ru;
