# Plan: migrate Bachata Roadmap to Vue 3 + PWA

Goal: rewrite the app on Vue 3 and its ecosystem, keeping **all** current functionality, users' data
(students/groups, progress, last tab) and the installed PWA on iPhones working.

Code rules: `.claude/rules/*.md`. Skills: `vue-feature`, `storage-migration`, `pwa-release-check`, `git-commit`.

---

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Vue 3.5+**, `<script setup lang="ts">`, Composition API | reactivity, components, easy port of the HTML markup |
| Language | **TypeScript** (strict) + `vue-tsc` | typed state and typed data read from `localStorage` |
| Build | **Vite** | Vue standard, fast dev server, `base` for GitHub Pages |
| State | **Pinia** (setup stores) | students/progress/tabs are shared by several screens |
| Routing | **Vue Router 4**, `createWebHashHistory` | GitHub Pages has no SPA fallback; hash routing works offline with no extra setup |
| PWA | **vite-plugin-pwa** (Workbox, `generateSW`, `autoUpdate`) | precache, auto update, manifest from config |
| Icons | the current **`icons/icon.svg`**, no PNG (owner's decision) | same as now |
| Utilities | **VueUse** (selectively: `useEventListener`, `useMediaQuery`, `useDebounceFn`) | less hand-written listener code |
| Tests | **Vitest** + **@vue/test-utils** + **happy-dom** | fast unit/component tests |
| Quality | **ESLint** (flat config, `eslint-plugin-vue`, `typescript-eslint`) + **Prettier** | one code style |
| Styles | plain CSS **in separate files**: `tokens.css`/`base.css` + one `.css` per component via `<style scoped src>`; BEM; no inline attributes | CSS is not mixed with markup; legacy styles port almost as is |
| Deploy | **GitHub Actions** → GitHub Pages (`/bachata-roadmap/`) | builds `dist/` on every push to `main` |
| Node | 22 LTS in CI (24 locally — compatible) | |

Not used: Nuxt/SSR (not needed), UI kits (Vuetify etc. — too heavy for 6 screens), i18n (Russian UI only),
VueUse `useLocalStorage` for app data (own storage layer with backup and recovery).

---

## 2. Architecture

```
index.html                 # iOS/PWA meta, <div id="app">
public/
  elementy.html            # redirect of the old URL → ./#/elements
  icons/                   # icon.svg (as now, no PNG)
src/
  main.ts                  # createApp, Pinia, router, errorHandler, SW registration
  App.vue                  # shell: AppHeader, RouterView, BottomTabs, overlays, Toast
  router/index.ts          # hash router, ROUTE_NAMES, lazy pages
  pages/                   # folder + .vue + .css each
    ProgramPage/           # period 0|1|2 (route param)
    SearchPage/
    ElementsPage/          # «Элементы по блокам» (former elementy.html)
  components/              # one folder per component: Name.vue + Name.css (<style scoped src="./Name.css">)
    AppHeader/  BottomTabs/  ProgressBar/
    SectionCard/           # collapsible section with a counter
    ChecklistItem/
    SideMenu/  BottomSheet/  ConfirmDialog/  AppToast/  InstallHint/
    InfoSheet/  EntitiesSheet/  EntityForm/
  composables/
    useToast.ts  useOverlay.ts (scroll lock, Esc, focus)  useStandalone.ts  useInstallHint.ts  usePwaUpdate.ts
  stores/
    useProfilesStore.ts    # students/groups, active one, progress, tabs — on top of lib/storage
    useUiStore.ts          # open overlays (only if needed)
  lib/
    storage.ts             # 1:1 port of js/storage.js: keys, normalization, backup, v1 migration, in-memory fallback
    errors.ts              # error codes and messages (port of js/errors.js)
    search.ts              # normalized index + search + highlight (no DOM)
    progress.ts            # percentage/counter math (pure functions)
  data/
    program.ts             # PROGRAM with EXPLICIT item ids (= current positional ids)
    elements.ts            # elementy.html content as data
    app-meta.ts
  styles/                  # global only, imported in main.ts
    tokens.css  base.css
```

Data flow: `pages → components → stores/composables → lib/data`. `lib/` never imports Vue.

### Routes

| URL | Screen | Tab (index in `state.tabs`) |
|---|---|---|
| `#/program/0` · `/1` · `/2` | ProgramPage | 0 · 1 · 2 |
| `#/search` | SearchPage | 3 |
| `#/elements` | ElementsPage | — |
| `#/` | redirect to the active student's saved tab | |

### Data contract (must not change)

- Keys: `bachata-state-v2`, `bachata-state-v2-last-good`, `bachata-state-v2-corrupt-backup`;
  legacy `bachata-progress-v1`, `bachata-tab-v1` (v1 → v2 migration is kept).
- Shape: `{ version: 2, entities: [{id, name, createdAt}], activeId, progress: {[entityId]: {[itemId]: true}}, tabs: {[entityId]: '0'..'3'} }` (tab indexes are stored as strings).
- Progress item ids: `${periodId}-${sectionIndex}-${itemIndex}`. New code stores them **explicitly** in `data/program.ts`;
  a test checks them against the positional formula, so items can be reordered later without losing checkmarks.
- `sessionStorage` key `bachata-install-hint-dismissed` — as now.

### PWA contract

- The SW stays at `/bachata-roadmap/sw.js` with the same scope → existing installs receive the update.
- The first Workbox version deletes legacy caches `bachata-pwa-*`.
- Auto update: check on returning to the app (`visibilitychange`), one reload on `controllerchange`.
- Fully offline after the first visit; no CDN.

---

## 3. Stages

Everything happens on branch `vue-migration`; `main` and production are untouched until stage 12.
The old code moves to `legacy/` in stage 1 (behavior reference for agents) and is removed in stage 11.
After each stage: `npm run type-check && npm run lint && npx vitest run && npm run build` are green, then a commit
on the user's request, following the `git-commit` skill (RS School / Conventional Commits).

| # | Stage | How | Done when | Status |
|---|---|---|---|---|
| 0 | Update agents and `CLAUDE.md` for Bachata Roadmap | directly, no /team | agents describe this project | ✅ done |
| 1 | Project scaffold | /team | `npm run dev` shows an empty App, all checks green | ✅ `0814215` |
| 2 | Data and errors | /team | `data/*`, `lib/errors.ts` + id tests | ✅ `3c84682` |
| 3 | Storage | /team (`storage-migration` skill) | `lib/storage.ts` 1:1 with legacy + recovery tests | ✅ `930cd76` |
| 4 | Store and composables | /team | `useProfilesStore`, `useToast`, `useStandalone` + tests | ✅ `2fdf40b` |
| 5 | UI shell | /team | header, bottom tabs, routing, toast, styles, install hint | |
| 6 | Program screen | /team | sections, checklist, progress bar, counters, collapsing | |
| 7 | Search | /team | search with highlighting, jump to the item | |
| 8 | Menu and overlays | /team | menu, «О приложении», students/groups, form, confirmations, reset | |
| 9 | Elements by blocks | /team | `#/elements` with all 41 sections and the table | |
| 10 | PWA | /team | vite-plugin-pwa, manifest, SVG icon, legacy cache cleanup, `elementy.html` redirect | |
| 11 | Deploy | /team | GitHub Actions workflow, `base`, removal of `legacy/` and old files | |
| 12 | Acceptance | `pwa-release-check` skill + the owner on an iPhone | update from the old version without data loss → merge into `main` | |

### /team task texts

**Stage 1 — scaffold**
```
/team Stage 1 of .claude/plans/vue-migration.md. Move the current app (index.html, elementy.html, css/, js/, sw.js, manifest.webmanifest, icons/) to legacy/ with git mv. Create a Vite + Vue 3 + TypeScript + Pinia + Vue Router (hash) + VueUse + Vitest (happy-dom) + @vue/test-utils + ESLint flat (eslint-plugin-vue, typescript-eslint) + Prettier project. base '/bachata-roadmap/'. Scripts: dev, build, preview, type-check (vue-tsc), lint, test (vitest run). src/ folder structure per «Architecture»; styles in separate .css files (<style scoped src>), example in App. Empty App.vue with the text «Bachata Roadmap». One smoke test. Do not touch PWA or deploy.
```

**Stage 2 — data and errors**
```
/team Stage 2 of .claude/plans/vue-migration.md. Port legacy/js/program-data.js and legacy/js/app-meta.js to src/data/ (TypeScript, as const/satisfies). Give every program item an explicit id equal to `${periodId}-${sectionIndex}-${itemIndex}`; a test checks all ids against this formula and their uniqueness. Port legacy/elementy.html content (41 sections: 40 lists across 5 modules + the table of 17 solo elements; 214 items) to src/data/elements.ts as typed data; tests on section and item counts. Port legacy/js/errors.js to src/lib/errors.ts with tests for getUserMessage/getStorageRecoveryCode. No UI.
```

**Stage 3 — storage**
```
/team Stage 3 of .claude/plans/vue-migration.md, skill storage-migration. Port legacy/js/storage.js to src/lib/storage.ts with 1:1 behavior: same keys and shape (section «Data contract»), normalization, last-good backup, corrupt-backup, recovery, v1→v2 migration, in-memory fallback when localStorage is unavailable, quota errors. No Vue. Tests: real v1 and v2 payloads, broken JSON, invalid structure, recovery from backup, QuotaExceededError, unavailable localStorage, deleting the last student is refused, saving the tab.
```

**Stage 4 — store and composables**
```
/team Stage 4 of .claude/plans/vue-migration.md. Setup store src/stores/useProfilesStore.ts on top of src/lib/storage.ts: entities, activeEntity, activeProgress, savedTab, per-student percentages, actions toggleItem/clearProgress/create/update/delete/switch/setTab; storage errors → useToast. Composables: useToast (singleton, queue, duration), useStandalone, useInstallHint (logic from legacy/js/app.js: once per session, not in standalone, only on the first page load). lib/progress.ts — pure counter functions. Tests for the store and composables. No UI.
```

**Stage 5 — UI shell**
```
/team Stage 5 of .claude/plans/vue-migration.md. Port legacy/css/base.css and app.css to src/styles/tokens.css, base.css (global) and per-component .css files (<style scoped src="./Name.css">); no CSS inside .vue, no inline attributes, BEM naming. App.vue, AppHeader (title + period subtitle, menu button), BottomTabs (4 tabs as in legacy/index.html, role=tablist), AppToast, InstallHint. Router per the «Routes» table: #/ redirects to the active student's saved tab, switching tabs saves it. app.config.errorHandler + unhandledrejection → toast. js-ready/standalone classes on html, safe areas, 100dvh. Placeholder pages for program/search/elements.
```

**Stage 6 — program screen**
```
/team Stage 6 of .claude/plans/vue-migration.md. ProgramPage for periods 0–2 per legacy/js/render.js and legacy/js/sections.js: period badge, ProgressBar for the period, SectionCard (collapse on header tap, done/total counter), ChecklistItem (accessible checkbox, tap toggles, saved via the store). Same look as legacy. Component tests: toggling, counters, collapsing.
```

**Stage 7 — search**
```
/team Stage 7 of .claude/plans/vue-migration.md. src/lib/search.ts (case/ё normalization, search by item and section title, highlighting without innerHTML) + SearchPage per legacy/js/render.js: debounced search input, highlighted results, tapping a result opens the right period and scrolls to/highlights the item. Tests for lib/search and the navigation.
```

**Stage 8 — menu and overlays**
```
/team Stage 8 of .claude/plans/vue-migration.md. Per legacy/js/overlays.js and legacy/index.html markup: BottomSheet and useOverlay (Teleport, Transition, Esc, backdrop tap, scroll lock, focus return), SideMenu (same items as now), InfoSheet («О приложении» texts verbatim), EntitiesSheet (list with percentages, switch, edit, delete), EntityForm (create/rename, name validation, 50 char limit), ConfirmDialog instead of window.confirm for deleting a student and resetting progress. Tests for the form, deleting the last student, reset.
```

**Stage 9 — elements by blocks**
```
/team Stage 9 of .claude/plans/vue-migration.md. ElementsPage (#/elements) from src/data/elements.ts per legacy/elementy.html; styles from legacy/css/elementy.css into ElementsPage/ElementsPage.css: header with a back button, module badges, collapsible sections (reuse SectionCard without checkboxes), horizontally scrollable solo elements table, item notes rendered from the `note` field. The menu item links here.
```

**Stage 10 — PWA**
```
/team Stage 10 of .claude/plans/vue-migration.md, rules .claude/rules/pwa.md. vite-plugin-pwa: generateSW, registerType autoUpdate, clientsClaim, skipWaiting, sw.js at <base>/sw.js, app shell precache, navigateFallback index.html, cleanupOutdatedCaches; delete legacy caches bachata-pwa-* on activate. Manifest from legacy/manifest.webmanifest (name, short_name, colors, standalone, start_url/scope '.'). Icons — only the current icon.svg (manifest sizes "any", type image/svg+xml, purpose "any"; apple-touch-icon is icon.svg too, as now). Do not generate PNG. iOS meta in index.html. usePwaUpdate: registerSW + update() on visibilitychange, one reload, not on the first install. public/elementy.html — redirect to ./#/elements.
```

**Stage 11 — deploy**
```
/team Stage 11 of .claude/plans/vue-migration.md. .github/workflows/deploy.yml: Node 22, npm ci, type-check, lint, test, build, deploy dist/ to GitHub Pages via actions/deploy-pages. Remove legacy/ and everything no longer used. Short README: commands, structure, how user data and PWA updates work.
```

**Stage 12 — acceptance** (not /team): `pwa-release-check` skill on `npm run build && npm run preview`, then the owner:
GitHub → Settings → Pages → Source: GitHub Actions; check on an iPhone (installed app updates, data is intact,
airplane mode). Then merge `vue-migration` → `main`.

---

## 4. Decisions made

1. TypeScript — yes.
2. Hash URLs (`…/bachata-roadmap/#/program/1`) — yes.
3. Own ConfirmDialog instead of `confirm()` — yes.
4. Branch `vue-migration` + `legacy/` folder during the migration — yes.
5. Icons — only the current `icon.svg`, no PNG.
6. Styles in separate `.css` files, no inline attributes, BEM naming.
7. Commits follow the RS School git convention (`git-commit` skill).
8. All files inside `.claude/` are written in English.

## 5. Risks

- **Data loss** from a storage bug → stage 3 with tests on real payloads + stage 12 «update from the old version».
- **Old version stuck on iPhones** → same `sw.js` URL, legacy cache cleanup, on-device check.
- **Behavior drift** from the current app → `legacy/` as the agents' reference, checked at every UI stage.
- **Volume**: 11 /team runs of roughly 15–40 minutes each, plus the owner's checks between stages.
