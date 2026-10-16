---
paths:
  - "src/**/*.vue"
  - "src/**/*.css"
---

# Styles

- Plain CSS, no CSS framework. Design tokens are CSS custom properties in `src/styles/tokens.css` (`--bg`, `--surface`,
  `--accent`, `--radius`, `--header-h`…). No raw `#hex`, magic sizes or z-indexes in components — add a token.
- Styles always live in **separate `.css` files**, never inline in `.vue`. Each component/page has its own file next to it:
  `components/ChecklistItem/ChecklistItem.vue` + `ChecklistItem.css`, connected with `<style scoped src="./ChecklistItem.css"></style>`
  (scoped is kept). No `<style>` blocks with CSS inside `.vue`.
- Global styles (`src/styles/base.css`, `tokens.css`) — only reset, typography, tokens and a few shared helpers; imported once in `main.ts`.

## No inline attributes

- No `style="…"` / `:style` in templates. Visual state is expressed with classes (`:class`) or `data-*`/ARIA attributes
  styled in CSS (`[aria-expanded='true']`, `[data-state='done']`).
- Progress and other numeric visuals — native elements first (`<progress>`, `<meter>`) styled in CSS.
- The only allowed exception: a continuous runtime value that CSS cannot know (e.g. a measured height) is passed as a
  single CSS custom property — `:style="{ '--sheet-offset': `${offset}px` }"` — and used in the `.css` file. Never set
  concrete properties (`width`, `color`, `display`) inline.
- No inline event handler attributes in HTML (`onclick="…"`) — only Vue `@event` bindings to functions from `<script setup>`;
  no multi-statement expressions in `@click`.
- No presentational HTML attributes (`width`, `height`, `align`, `bgcolor`) except intrinsic `width`/`height` on images.

## Class naming (BEM)

- Block = component: the root element class is the component name in kebab-case (`ChecklistItem` → `.checklist-item`).
  One block per component file; a child component is its own block, not an element of the parent.
- Element: `block__element` (`.checklist-item__label`), one level only — no `block__el__sub`; name the part, not its position.
- Modifier: `block--modifier` / `block__element--modifier` for variants (`.section-card--compact`), always together with the base class.
- State: `is-*` / `has-*` classes for runtime state (`.is-open`, `.is-done`, `.is-active`), set via `:class="{ 'is-open': isOpen }"`;
  or the matching ARIA attribute when one exists (`aria-expanded`, `aria-selected`, `aria-checked`) — prefer ARIA.
- Names describe meaning, not appearance: `.section-card__count`, not `.pink-text` / `.mt-10` / `.left-col`.
- Lowercase kebab-case, English, no abbreviations (`btn` → `button`), no ids or tag names as styling hooks.
- Selectors: single class where possible, nesting ≤ 2, no `!important`, no qualified selectors (`div.card`),
  no styling of another component's internals — pass a modifier prop or use a slot; `:deep()` only with a comment why.
- Tests use `data-test="…"` / roles, never CSS classes; CSS never targets `data-test`.
- `:class` — object or array syntax with computed values; no string concatenation of class names.
- Mobile-first: base styles target ~375px; `@media (min-width: …)` for larger screens.
- Use `100dvh` (not `100vh`), `env(safe-area-inset-*)` for header/bottom bar paddings, touch targets ≥ 44×44px.
- No hover-only interactions; use `:focus-visible` for keyboard focus, `:active` for tap feedback,
  `-webkit-tap-highlight-color: transparent` only together with a visible active state.
- Animations: `transform`/`opacity` only, wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Font sizes in inputs ≥ 16px (prevents iOS zoom on focus).
- `theme-color` meta and manifest colors match `--bg`.
