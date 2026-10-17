# Bachata Roadmap

Офлайн PWA с дорожной картой занятий по бачате: чек-листы по периодам, прогресс по ученикам и группам, поиск
и справочник «Элементы по блокам». Бэкенда нет, все данные хранятся на устройстве.

Приложение: https://andreyb622.github.io/bachata-roadmap/
На iPhone устанавливается через Safari: «Поделиться» → «На экран Домой».

## Стек

Vue 3, TypeScript, Vite, Pinia, vue-i18n, vite-plugin-pwa, Vitest.

## Команды

- `npm ci` — установить зависимости
- `npm run dev` — dev-сервер
- `npm run build` — проверка типов и production-сборка в `dist/`
- `npm run preview` — локальный просмотр сборки (так проверяется service worker)
- `npm run type-check` — проверка типов (vue-tsc)
- `npm test` — тесты (Vitest)
- `npm run check` — проверка типов, ESLint без `--fix` и тесты одной командой
- `npm run lint` — ESLint с `--fix` (правит файлы)

## Структура

- `src/app/` — точка входа, `App.vue`, маршруты (hash), каркас (шапка, вкладки, меню)
- `src/pages/` — экраны по маршрутам, у каждого свой `.css`
- `src/modules/` — предметные модули: `program`, `profiles` (хранилище, Pinia), `search`, `elements`, `pwa`,
  `settings` (тема и язык)
- `src/shared/` — общий код без предметной логики: `ui`, `composables`, `lib`, `config`, `i18n`, `styles`
- `public/` — иконка, `sw-legacy-cleanup.js`, редирект `elementy.html`
- `guidebook/` — исходные материалы программы
- `.github/workflows/deploy.yml` — деплой на GitHub Pages

## Данные пользователя

Только `localStorage`, всё через `src/modules/profiles/storage.ts`.

- Ключ `bachata-state-v2`, формат `{ version: 2, entities, activeId, progress, tabs }`.
- Резервные ключи: `bachata-state-v2-last-good` и `bachata-state-v2-corrupt-backup`.
- Миграция со старых ключей `bachata-progress-v1` / `bachata-tab-v1`.
- Настройки — отдельный ключ `bachata-settings-v1`, формат `{ version: 1, theme, locale }`
  (`src/modules/settings/storage.ts`). Повреждённые настройки молча сбрасываются на значения по умолчанию.
- Ключи, формат и id пунктов — публичный контракт: менять только через версионную миграцию.

## Языки

- Тексты интерфейса — сообщения vue-i18n: `src/shared/i18n/`, `src/app/i18n/`, `src/modules/<модуль>/i18n/`
  (`ru.ts` — исходный и всегда полный, `en.ts`, `es.ts` — переводы с тем же набором ключей, это проверяет тест).
- Контент программы и «Элементов» пока только на русском (перевод — фаза 4).
- Пока `LOCALES_ENABLED` в `src/shared/config/locales.ts` равен `false`, production всегда показывает русский
  и прячет выбор языка. В `npm run dev` выбор языка в «Настройках» виден всегда — так проверяются переводы.

## Обновления PWA

- `vite-plugin-pwa`, `generateSW`, `autoUpdate` + `clientsClaim` + `skipWaiting`.
- `registration.update()` при возврате в приложение (`visibilitychange`); одна перезагрузка на `controllerchange`,
  не при первой установке.
- Service worker остаётся по адресу `/bachata-roadmap/sw.js`; `sw-legacy-cleanup.js` удаляет старые кеши `bachata-pwa-*`.
- Работает полностью офлайн, без CDN.

## Деплой

Push в `main` → GitHub Actions (type-check, eslint, тесты, сборка) → GitHub Pages.
В репозитории: Settings → Pages → Source: GitHub Actions.

## Версия

Версия показывается внизу бокового меню: «Версия 2.3.N · дата сборки · коммит».

- `N` подставляется автоматически при каждом деплое — это номер запуска workflow в GitHub Actions
  (`GITHUB_RUN_NUMBER`). Коммитить смену версии не нужно.
- Первые две цифры берутся из `version` в `package.json`. Меняйте их вручную для крупных релизов
  (например, `2.0.0` → `2.1.0`); последняя цифра в `package.json` ни на что не влияет.
- При локальной сборке версия берётся из `package.json` как есть.
