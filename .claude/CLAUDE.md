# CLAUDE.md

Bachata Roadmap — mobile offline PWA with a bachata class roadmap: checklists per period, progress per student/group,
search, «elements by blocks» reference. No backend: all user data lives in the device's `localStorage`.
Hosted on GitHub Pages: https://andreyb622.github.io/bachata-roadmap/ (installed on iPhones via «На экран Домой»).

Always reply to the user in Russian (status lines, plans, questions, relayed subagent findings); code, identifiers,
paths and commands stay as is.

## Current state

Migration from vanilla JS to Vue 3 + PWA is in progress — plan, stack, architecture, data contract and stages:
`.claude/plans/vue-migration.md`. Each stage runs as a separate `/team` task on branch `vue-migration`.
Until stage 11 the old app (repo root before stage 1, `legacy/` after) is the reference for behavior, copy and styles.

## Language of files

- Every file inside `.claude/` is written in **English**: plans, rules, skills, agents, commands, `CLAUDE.md`,
  and pipeline artifacts in `.claude/work/` (context, plans, reports, reviews).
- Allowed exceptions, quoted verbatim: Russian UI copy of the app, Russian trigger phrases in skill descriptions,
  iOS/Safari UI labels («На экран Домой»).
- Replies to the user stay in Russian.

## Rules and skills

- `.claude/rules/`: `workflow.md`, `principles.md`, `pwa.md` (always), `vue.md`, `typescript.md`, `styles.md`, `testing.md` (by file type).
- Skills: `/vue-feature`, `/storage-migration`, `/pwa-release-check`, `/git-commit` (RS School / Conventional Commits). Pipeline: `/team <task>`.

## Never break

- Stored data: keys `bachata-state-v2*`, legacy `bachata-progress-v1`/`bachata-tab-v1`, the state shape, progress item ids.
- Service worker URL/scope `/bachata-roadmap/sw.js` — installed apps must keep receiving updates.
- Do not commit or push without an explicit request.
