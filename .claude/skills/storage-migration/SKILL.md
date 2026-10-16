---
name: storage-migration
description: Safely change persisted user data (localStorage keys, stored state shape, progress item ids, program content that ids depend on) with a versioned migration, validation, backup and tests, so installed PWAs never lose students and progress. Use whenever a task adds/renames/removes a stored field, changes the program structure (sections, items, their order) or touches lib/storage.ts.
---

# Storage migration

Context: progress exists only on users' devices. A broken migration = lost data with no way to restore it.
Rules: `.claude/rules/pwa.md` (User data section), `testing.md`.

## 1. Inventory

1. Read `src/lib/storage.ts` (or legacy `js/storage.js`): current keys, version, stored type, backup keys, fallback logic.
2. Write down the **current** stored shape as a type `StoredStateVn` and collect 2–3 real example payloads
   (from tests, or ask the user to copy `localStorage` from the device via Safari Web Inspector).
3. Determine whether item ids change. Positional ids (`period-section-item`) change when content is reordered/inserted —
   that is a migration too, even if the code shape stays the same.

## 2. Design

- New type `StoredStateVn+1`; bump the version (in the key or a `version` field).
- Pure function `migrateVnToVn1(old: StoredStateVn): StoredStateVn1` in `lib/migrations.ts` — no I/O, no Vue.
- For content changes — an explicit id map `{ oldId: newId }`; ids that disappear are dropped deliberately, not silently.
- Loading order on startup:
  1. read the newest key → validate → use;
  2. else read older keys → validate → migrate step by step (v1→v2→v3) → write the new key → only then mark old as migrated
     (keep the old key for at least one release);
  3. invalid data → last-good backup → defaults; save the corrupt payload under a `-corrupt-backup` key; show a toast.
- Writes in `try/catch` (quota, private mode) with in-memory fallback.

## 3. Tests (mandatory, write first)

`src/lib/__tests__/migrations.spec.ts` and `storage.spec.ts`:
- each real old payload migrates to the expected new state (`it.each`);
- already-migrated data is untouched (idempotency: migrate twice = migrate once);
- corrupt JSON, missing fields, wrong types → recovery from backup / defaults, no throw;
- `setItem` throwing `QuotaExceededError` → app state still works in memory, error surfaced;
- progress percentage per student is the same before and after migration.

## 4. Verify

1. `npx vitest run src/lib`, `npm run type-check`, `npm run build`.
2. Manual: in `npm run preview`, put an old payload into `localStorage` via DevTools, reload, check students and checkmarks.
3. Run the `pwa-release-check` skill (update path from the previous production version).
4. Report the old → new shape, the id map (if any) and which payloads were tested.
