---
paths:
  - "src/**/*.ts"
  - "src/**/*.vue"
---

# TypeScript

- `strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess` are enabled. Prefix unused arguments with `_`.
- Type-check with `vue-tsc --noEmit` (`npm run type-check`); a build with type errors is not done.
- No `any`; `as` only with a comment why. External data (`localStorage`, route params/query, `postMessage`) —
  `unknown` + type guards at the boundary (`lib/`).
- Formatting — Prettier (`.prettierrc.json`): `semi: true`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`
  (matches the legacy code style). Never hand-format against it.
- `import type` for type-only imports.
- Constants — an `as const` object + `(typeof X)[keyof typeof X]`; no `enum`.
- `satisfies` to check configs and data maps without losing literal types (static program data, route names).
- `interface` for props and objects, `type` for unions and derived types.
- Discriminated unions for states (`{ ok: true, value } | { ok: false, error }`) instead of optional fields.
- Persisted state has an explicit versioned type (`StoredStateV2`) separate from the in-memory store type.
- Do not duplicate derivable types (`ReturnType`, `Parameters`, `typeof`). Types live next to the code that owns them.
- Env and virtual modules are typed: `/// <reference types="vite/client" />`, `vite-plugin-pwa/client`.
