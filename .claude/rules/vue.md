---
paths:
  - "src/**/*.vue"
  - "src/**/*.ts"
---

# Vue 3 — how we write it

Stack: Vue 3.5+, Vite, Pinia, Vue Router 4, vite-plugin-pwa, Vitest. Mobile-first offline PWA, no backend.

## Project structure

```
src/
  main.ts              # createApp, Pinia, router, global error handler, SW registration
  App.vue              # layout shell only: header, <RouterView>, global overlays, toast
  pages/               # route-level components (folder + .vue + .css): compose blocks, read route params, no business logic
  components/          # reusable UI blocks, one folder each: ChecklistItem/ChecklistItem.vue + ChecklistItem.css
  composables/         # useXxx.ts — stateful reusable logic (useInstallHint, useStandalone, useToast)
  stores/              # Pinia stores (useProgressStore, useEntitiesStore)
  lib/                 # pure functions without Vue: storage, validation, migrations, search
  data/                # static content (program, elements) as typed constants
  styles/              # tokens.css, base.css
```

- Dependencies flow one way: `pages → components → composables/stores → lib/data`. `lib/` never imports Vue.
- Static content (the program, elements by blocks) lives in `data/` and is rendered from data — no copy-pasted markup.

## Components

- Only `<script setup lang="ts">` and the Composition API. No Options API, no mixins.
- Block order: `<script setup>` → `<template>` → `<style scoped src="./Name.css"></style>`. CSS is never written inside `.vue` (styles.md).
- Order inside `<script setup>`: imports → props/emits/model → composables/stores → state (`ref`) →
  `computed` → functions → `watch` → lifecycle hooks.
- Props/emits — typed macros: `defineProps<Props>()`, `defineEmits<{ toggle: [id: string] }>()`.
  Defaults via reactive props destructure (Vue 3.5): `const { size = 'md' } = defineProps<Props>()`.
  Pass a getter to `watch`: `watch(() => size, …)`.
- `v-model` — `defineModel<T>()`. Element refs — `useTemplateRef('name')`. Stable ids for a11y — `useId()`.
- `ref` by default; `reactive` only for cohesive objects (a form); `shallowRef`/`markRaw` for large static data.
- Derived values — `computed`, never `watch` + assignment. `watch` is for side effects only.
- Never mutate props. A child emits, the owner (or a store) changes state.
- No logic in templates beyond simple expressions — move it into `computed`. No inline `style`/`:style` and no multi-statement
  `@click` expressions; class naming and state classes — see styles.md («No inline attributes», «Class naming»).
- `v-for` always with a stable `:key` (an id, not the index); never `v-if` together with `v-for` on one element.
- Global listeners, timers and observers are registered in `onMounted` and removed in `onBeforeUnmount`
  (or inside a composable with `onScopeDispose`). Prefer VueUse (`useEventListener`, `useMediaQuery`)
  when it removes boilerplate. Do not use VueUse `useLocalStorage` for app state — persistence goes through `lib/storage.ts` (pwa.md).
- Overlays (menu, bottom sheets, dialogs, toast) — `<Teleport to="body">` + `<Transition>`;
  close on Esc and on backdrop tap, lock body scroll while open, return focus to the trigger.
- A component over ~250 lines or with several independent blocks — split it.
- `defineSlots` for scoped slots; `provide/inject` with typed `InjectionKey` only for parent ↔ child of one widget.

## Performance (mobile first)

- Route-level components are lazy: `component: () => import('@/pages/ElementsPage.vue')`.
  Heavy rarely used blocks — `defineAsyncComponent`.
- Big static lists: `shallowRef`/`Object.freeze`, `v-memo` for list rows whose state is a single flag, `v-once` for static text.
- `<KeepAlive>` for tabs whose scroll position and collapsed state must survive switching.
- Debounce search input (~150 ms); search over a prebuilt normalized index, not over the DOM.
- Do not import whole libraries for one helper; check bundle size with `npx vite-bundle-visualizer` when adding a dependency.

## Composables

- Name `useXxx`, file `useXxx.ts`. Return an object of refs/computed/functions; expose only what is needed.
- Side effects are created and cleaned up inside the composable.
- Module-level state (outside the function) is a deliberate singleton; if it grows or needs devtools — use a Pinia store.
- Browser APIs (`matchMedia`, `navigator.standalone`, `sessionStorage`) are wrapped in composables with
  feature detection and `try/catch`, so components never touch `window` directly.

## Pinia

- Setup stores only: `defineStore('progress', () => { … return { … } })`. File `stores/useProgressStore.ts`.
- One store per domain (entities/progress, ui). State is serializable plain data; no DOM, no class instances.
- In components: `storeToRefs(store)` for state/getters, actions straight from the store.
- Persistence is explicit: the store calls `lib/storage.ts` (versioned, validated, with backup) — see pwa.md.
  Do not mutate store state from outside actions.
- Tests create a fresh Pinia per test (`setActivePinia(createPinia())`).

## Routing

- GitHub Pages has no SPA fallback → `createWebHashHistory(import.meta.env.BASE_URL)`.
  Switching to history mode requires a `404.html` fallback and a navigation fallback in the service worker.
- Route names in one `as const` object; navigate by name, never by hard-coded path strings.
- Validate params/query at the page level before passing them down as props.
- `scrollBehavior` restores saved position on back/forward.

## Errors

- `app.config.errorHandler` + `unhandledrejection` listener → a user-facing toast with a human message;
  log technical details to the console. Never a white screen: wrap risky subtrees with `onErrorCaptured`.

## Accessibility and UI copy

- Interactive elements are `<button>`/`<a>`, never `<div @click>`; icon buttons have `aria-label`;
  checklist items are real checkboxes (`role="checkbox"`/`aria-checked` or `<input type="checkbox">`).
- Dialogs: `role="dialog"`, `aria-modal`, `aria-labelledby`.
- UI copy is in Russian, directly in templates (no i18n).
