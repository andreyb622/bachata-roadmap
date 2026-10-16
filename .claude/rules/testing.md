---
paths:
  - "src/**/*.spec.ts"
  - "src/lib/**/*.ts"
  - "src/stores/**/*.ts"
  - "src/composables/**/*.ts"
---

# Tests

- Vitest + `@vue/test-utils`, `happy-dom` (or `jsdom`) environment, no globals — import `describe`/`it`/`expect`/`vi` from `vitest`.
- Test files — `__tests__/<name>.spec.ts` next to the code under test. Run: `npx vitest run <path>`.
- Priority: `lib/` (storage, migrations, validation, search) → stores and composables → components with logic.
- **Mandatory:** any change to persisted data (keys, shape, item ids) comes with migration tests on real old payloads,
  including corrupt JSON, missing fields and an unavailable `localStorage` (mock `setItem` to throw `QuotaExceededError`).
- Stores — fresh Pinia per test: `setActivePinia(createPinia())` in `beforeEach`; `localStorage.clear()` in `beforeEach`.
- Structure: `describe('<unit>')` → `it('<expected behavior, present tense>')`, one behavior per `it`, Arrange → Act → Assert,
  no loops/conditions in tests; tables via `it.each`.
- Components: assert behavior (rendering, emits, ARIA state), find elements by role/text/`data-test`, not by CSS classes.
- Browser APIs (`matchMedia`, `navigator.standalone`, `serviceWorker`) — stub with `vi.stubGlobal`, restore with `vi.unstubAllGlobals()`.
- The service worker itself is not unit-tested; it is checked by the `pwa-release-check` skill on a production build.
- Timers — `vi.useFakeTimers()`, restored after the test.
- Bug fix — write the failing test first.
