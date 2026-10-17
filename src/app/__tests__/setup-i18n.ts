import { readFileSync } from 'node:fs';
import { config } from '@vue/test-utils';
import { beforeAll, expect } from 'vitest';

// Only component specs (those importing a .vue file) get the i18n plugin; unit specs stay independent of the app layer.
// Loaded in a hook, not at the top level: a spec's own `vi.mock` and imports must be resolved first.
beforeAll(async () => {
  const { testPath } = expect.getState();
  if (!testPath || !/from\s+['"][^'"]+\.vue['"]/.test(readFileSync(testPath, 'utf8'))) return;
  const { i18n } = await import('@/app/i18n');
  config.global.plugins.push(i18n);
});
