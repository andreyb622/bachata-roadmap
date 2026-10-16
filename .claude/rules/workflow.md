# How to handle a task

## 1. Understand the task first

- If the task is ambiguous — **ask before starting work**, do not guess. Signs of an unclear task:
  - it is unclear which component, page or store to change;
  - there are several reasonable interpretations, and they lead to different code;
  - data is missing: copy, mobile behavior, empty/error states, offline behavior;
  - the change affects a public contract: persisted data (storage keys, state shape, progress item ids),
    the service worker or manifest, `base` path, routes.
- Ask questions as a single short list, with answer options and your recommendation.
- Do not ask about what you can find out yourself from the code or git history — look first.
- Make minor decisions with an obvious default yourself and mention them in the report.

## 2. Plan

- For tasks touching more than a couple of files — a short plan first (which files, what changes) and agreement.
- Find similar existing code and do it the same way: the project's conventions beat an "ideal" pattern from memory.
- Assess what can break: where else the code is used; whether existing users' data and installed PWAs are affected (pwa.md).

## 3. Implement

- Do exactly what was asked. Incidental improvements — only suggest them, do not slip them in.
- Small cohesive changes instead of one huge diff.
- Do not reformat or rename in unrelated places.
- No commented-out code, `console.log`, or `TODO`s without an explanation.
- Found a bug outside the task — report it, do not fix it quietly.
- New dependency — only with a reason; prefer the Vue ecosystem standard (Pinia, Vue Router, VueUse, vite-plugin-pwa).

## 4. Verify

- `npm run type-check`, `npx eslint <touched files>`, `npx vitest run` (related tests) — all must pass.
- `npm run build` must succeed; for UI changes check `npm run dev` at ~375px width.
- Changes to the SW, manifest, storage or `base` — run the `pwa-release-check` skill on `npm run build && npm run preview`.
- New logic in `lib/`, stores or composables — comes with a test.

## 5. Commit

- Only on the user's request. Messages and splitting follow the RS School git convention — the `git-commit` skill
  (`<type>[(scope)]: <imperative lowercase description>`, types feat/fix/refactor/docs/style/test/perf/build/ci/chore/revert).

## 6. Language

- All files inside `.claude/` (plans, rules, skills, agents, work artifacts) are written in English;
  Russian only for verbatim UI copy and skill trigger phrases. Replies to the user are in Russian.

## 7. Report

- Briefly: what was done, which files, which decisions you made yourself and why.
- Honestly: if something is unverified (e.g. on a real iPhone), a test fails, or a step was skipped — say so.
- Open questions and risks — as a separate item.
