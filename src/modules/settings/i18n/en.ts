import type ru from './ru';

export default {
  settings: {
    title: 'Settings',
    theme: 'Theme',
    themeOptions: { system: 'System default', light: 'Light', dark: 'Dark' },
    language: 'Language',
    languageOptions: { system: 'System default', ru: 'Русский', en: 'English', es: 'Español' },
  },
} satisfies typeof ru;
