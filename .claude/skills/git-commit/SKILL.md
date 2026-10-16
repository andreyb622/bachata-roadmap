---
name: git-commit
description: Create git commits following the RS School git convention (Conventional Commits) — type, optional scope, imperative lowercase description, what goes into one commit, how to fix a wrong message. Use whenever the user asks to commit («закоммить», «сделай коммит», «коммить этап N»), or after a /team stage when the user approves committing.
---

# Git commit (RS School convention)

Source: https://rs.school/docs/git-convention (Conventional Commits 1.0.0).
Commit only when the user asked for it. Never push without an explicit request.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- `type` — required, **lowercase**, one of:
  | type | when |
  |---|---|
  | `feat` | new functionality (a new screen, store, data, behavior) |
  | `fix` | bug fix in existing functionality |
  | `refactor` | restructuring without behavior change |
  | `docs` | README / documentation |
  | `style` | formatting only (prettier, whitespace) — not CSS changes of the UI |
  | `test` | adding or fixing tests only |
  | `perf` | performance improvements |
  | `build` | build system, Vite config, dependencies (`package.json`) |
  | `ci` | GitHub Actions and CI scripts |
  | `chore` | anything that touches neither source nor tests (`.gitignore`, editor config) |
  | `revert` | reverting a previous commit |
- `scope` — optional noun in parentheses for the part of the code: `feat(storage):`, `fix(search):`, `build(pwa):`.
  Use scopes from `src/` areas: `data`, `storage`, `stores`, `router`, `program`, `search`, `menu`, `elements`, `pwa`, `ui`.
- `description` — English, imperative present tense, lowercase start, no trailing period, ≤ 72 chars for the whole first line:
  `add`, `fix`, `remove`, `move` — not `added` / `adds`. Never `init` as a type.
- Body (optional) — what and why, wrapped at ~72 chars, separated by a blank line. Use it when the change is not obvious
  from the description (data contract, migration, PWA behavior).
- Breaking change — `feat!:` or a `BREAKING CHANGE: …` footer (e.g. stored data format changes).
- Footers — `Refs: #123` and the attribution trailer required by the session (e.g. `Co-Authored-By: …`).

## What goes into one commit

- One logical change per commit; the type must describe **all** of it. If the diff mixes kinds (dependency bump + feature +
  formatting), split it: `git add <paths>` per commit, never `git add -A` blindly.
- A /team migration stage is usually one `feat` commit; config-only stages are `build` / `ci`.
- Unrelated pending changes of the user stay out — stage only the files of this change; ask if unsure.
- Before committing: tests, lint and type-check are green (or say explicitly in the report that they are not).

## Examples (this project)

```
chore: ignore local claude settings
build: scaffold vite vue 3 app and move old app to legacy
feat(data): port program, elements and error messages to typescript
feat(storage): port local storage layer with recovery and v1 migration
fix(search): ignore letter case when matching items
build(pwa): add vite-plugin-pwa with legacy cache cleanup
ci: deploy to github pages via actions
```

## Wrong message

- Not pushed: last commit — `git commit --amend -m "…"`; older commits — rewrite with a non-interactive method
  (interactive `git rebase -i` is unavailable here), keeping trees, authors and dates.
- Pushed but not under review: rewrite locally, then `git push --force-with-lease` — only with the user's explicit OK.
- Already under review / merged: do not rewrite history; fix forward in a new commit.
- Revert: `git revert <sha>` → `revert: <original description>`.

## Steps

1. `git status --short` and `git diff --stat` — see exactly what will be committed.
2. Pick type/scope; split into several commits if needed.
3. Stage explicit paths, check `git diff --cached --stat`.
4. Commit with a heredoc message; verify with `git log --oneline -3`.
5. Report the commit hash(es) and messages to the user.
