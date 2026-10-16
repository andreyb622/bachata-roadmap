---
name: pwa-release-check
description: Pre-release verification of the PWA on a production build — offline work, service worker update from the previous version, preserved user data, manifest/iOS installability, base path for GitHub Pages. Use before merging/deploying changes to the service worker, vite-plugin-pwa config, manifest, index.html meta, storage or base path, or when the user asks «проверь PWA», «готово к релизу?», «не сломается ли у установленных».
---

# PWA release check

Rules: `.claude/rules/pwa.md`. Report every item as ✅ / ❌ / ⚠️ not verified (with the reason). Never claim an item
you could not actually check (e.g. a real iPhone) — mark it for the user instead.

## 1. Build

1. `npm run type-check && npx vitest run && npm run build` — all green.
2. In `dist/`: `sw.js` exists at the root of the base path, `manifest.webmanifest` is linked from `index.html`,
   `icons/icon.svg` is present and referenced by the manifest and `apple-touch-icon`, no asset URL starts with `/` instead of the base.
3. `grep -r "http" dist/*.html dist/assets/*.css` — no external fonts/scripts (offline must not depend on CDN).
4. Precache manifest inside `sw.js` lists `index.html`, all JS/CSS chunks and icons; total size reasonable (< ~2 MB).

## 2. Fresh install (`npm run preview`, Chrome DevTools)

1. Open the preview URL with the production base path. Application → Service Workers: activated, scope = base path.
2. Application → Manifest: no errors, installable.
3. Network → Offline, reload: app loads, all tabs/pages and search work, toggling progress persists after reload.
4. Lighthouse (mobile): PWA/installability and Best Practices without errors.

## 3. Update from the previous version (the critical path)

1. Check out the previous production commit (`git worktree add ../bachata-prev <sha>`), build and serve it at the same URL/port
   (or use the live GitHub Pages site in a separate profile).
2. Create 2 students, check several items in different tabs, switch the active student.
3. Serve the new build at the same URL. Reload / switch tab back (`visibilitychange`).
4. Expect: the new SW installs and takes control, the page reloads **at most once**, legacy caches (`bachata-pwa-*`) are gone
   from Cache Storage, all students, progress and the last tab are intact, no error toast (or the expected recovery toast).
5. Offline after the update: still works.

## 4. Things only the user can check — list them in the report

- iPhone Safari → «На экран Домой» → open from the icon: standalone, status bar, safe areas, icon.
- An already-installed old version on the iPhone picks up the update after reopening (may need one more reopen) and keeps data.
- Airplane mode: app opens from the home screen.

## 5. Report

A short table of the checks above with ✅/❌/⚠️, the exact failing step and console/DevTools output for ❌,
and the list from section 4 for the user.
