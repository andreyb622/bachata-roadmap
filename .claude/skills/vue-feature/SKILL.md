---
name: vue-feature
description: Add or change a Vue 3 feature (page, component, composable, Pinia store) following the project rules — structure, Composition API, Pinia, routing, mobile/offline UX and tests. Use when the user asks to add a screen, block, sheet, setting or behavior to the app (e.g. «добавь экран», «сделай компонент», «вынеси в стор», «добавь фичу»).
---

# Vue feature

Rules to follow: `.claude/rules/vue.md`, `typescript.md`, `styles.md`, `testing.md`, `pwa.md`, `principles.md`.

## 1. Locate and decide

1. Find the closest existing analog (`src/components`, `src/pages`, `src/stores`, `src/composables`) and copy its shape.
2. Decide where each part goes:
   | What | Where |
   |---|---|
   | screen reachable by URL | `src/pages/XxxPage/XxxPage.vue` + `XxxPage.css` + lazy route |
   | reusable UI block | `src/components/Xxx/Xxx.vue` + `Xxx.css` |
   | stateful logic used by 1–2 components | `src/composables/useXxx.ts` |
   | state shared across screens or persisted | `src/stores/useXxxStore.ts` (setup store) |
   | pure logic, validation, storage, search | `src/lib/xxx.ts` (no Vue imports) |
   | static content | `src/data/xxx.ts` (`as const` / `satisfies`) |
3. If the feature touches persisted data (new field, new key, renamed item) — stop and use the `storage-migration` skill for that part.
4. Ambiguous UX (empty state, offline, mobile behavior, copy) — ask the user with options and a recommendation.

## 2. Implement

Component skeleton:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useProgressStore } from '@/stores/useProgressStore';

interface Props {
  sectionId: string;
}

const { sectionId } = defineProps<Props>();
const emit = defineEmits<{ toggle: [itemId: string] }>();

const progressStore = useProgressStore();
const { doneIds } = storeToRefs(progressStore);

const doneCount = computed(() => /* derived, no watch */ 0);
</script>

<template>
  <!-- semantic elements, aria for interactive parts, Russian copy -->
</template>

<style scoped src="./SectionProgress.css"></style>
<!-- SectionProgress.css: tokens only — var(--surface), var(--radius) … -->
```

Setup store skeleton:

```ts
export const useXxxStore = defineStore('xxx', () => {
  const items = ref<Item[]>(loadItems());      // via lib/storage.ts
  const count = computed(() => items.value.length);

  function add(item: Item) {
    items.value = [...items.value, item];
    saveItems(items.value);                    // explicit, try/catch inside lib
  }

  return { items, count, add };
});
```

Checklist while writing:
- styles only in `Name.css` (`<style scoped src>`); no `style`/`:style`, no inline handlers — state via `:class` / ARIA / `data-*`;
- BEM: root `.kebab-component-name`, `__element`, `--modifier`, `is-*` state; names by meaning; nesting ≤ 2, no `!important`;
- overlays via `<Teleport>` + `<Transition>`, Esc/backdrop close, focus return, scroll lock;
- touch targets ≥ 44px, safe areas, `100dvh`, no hover-only behavior;
- no network calls, no CDN assets — the feature must work offline;
- listeners/timers cleaned up; no direct `localStorage`/`window` in components;
- new route — lazy import, name in the route-names constant, hash history.

## 3. Verify

1. Tests for new logic in `lib/`, stores, composables (`npx vitest run <path>`).
2. `npm run type-check`, `npx eslint <files>`, `npm run build`.
3. `npm run dev` at ~375px: main flow, empty state, reload keeps state.
4. If the SW, manifest, storage or `base` changed — run the `pwa-release-check` skill.
5. Report: files, decisions made, what is unverified.
