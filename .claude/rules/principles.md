# Development principles

Principles are a tool, not a goal. If a principle makes the code more complex in a particular place,
choose simplicity (KISS outranks everything else).

## KISS — Keep It Simple

- The simplest solution that solves the task. Complexity must be justified.
- Flat code: early `return`, no deep nesting (at most 2–3 levels).
- No "clever" one-liners when a plain `if` reads better.
- No abstractions "for the future": factories, generic wrappers, configs for a single case.

## YAGNI — You Aren't Gonna Need It

- Do not add props, options, parameters or branches that nobody uses right now.
- Do not make a component "universal" while it has a single consumer.

## DRY — Don't Repeat Yourself (with the rule of three)

- Duplicated knowledge (a business rule, an API mapping, a constant) — eliminate immediately.
- Similar code — extract into a shared function/component on the **third** repetition, not earlier.
  False generality is worse than copy-paste: two similar filters may evolve differently.
- Where to extract: pure function → `src/lib/`; stateful logic → composable or store;
  markup → component in `src/components/`.

## SOLID in the Vue context

- **S — Single Responsibility.** One component/composable — one reason to change.
  The component handles rendering; persistence and data transformations go to `src/lib/`,
  stateful logic to a composable or a store; pages only compose components. A component over ~300 lines or with several independent blocks is a signal to split.
- **O — Open/Closed.** Extend via props, slots and variants (`variant`, `size`),
  not by editing internals for every special case. Do not litter shared components with `if (page === 'x')`.
- **L — Liskov Substitution.** A wrapper around a base component does not break its contract: it forwards attributes
  and `v-model`, and does not change the meaning of existing props and events.
- **I — Interface Segregation.** Small focused props instead of one huge `options` object.
  A composable returns only what its consumers need.
- **D — Dependency Inversion.** Components depend on stores and `lib/` functions,
  not on `localStorage`/browser APIs directly. Data comes into a component via props, a store or a composable, not read from the DOM/`window` inside it.

## Other principles

- **Separation of Concerns** — data, logic and presentation are separated (see the project structure in vue.md).
- **Composition over Inheritance** — composables and slots instead of inheritance and mixins (do not use mixins).
- **Pure functions and immutability** — utilities do not mutate arguments and have no side effects;
  new arrays/objects instead of mutation, where it does not hurt performance.
- **Fail fast / explicit errors** — validate invalid input (route params/query, API responses, `localStorage`) at the boundary
  and handle it explicitly; do not swallow errors silently — show the user a clear message.
- **Law of Demeter** — do not reach deep into other structures (`a.b.c.d.e`); if needed, let the owner expose a method/computed.
- **Principle of least astonishment** — names say what things do; a `getX` function does not change state,
  `isX`/`hasX` return a boolean.
- **Boy Scout Rule (limited)** — you may fix a small thing in lines you are already changing,
  but do not refactor neighboring code unless asked.
- **Readability over brevity** — code is read more often than written. Descriptive names, no abbreviations (`idx` → `index` may stay, `cb`, `tmp`, `d` — no).
