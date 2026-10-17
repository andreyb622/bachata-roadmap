import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { fileURLToPath } from 'node:url';

// package.json is our own file, so its shape is known; only `version` is read.
const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string };

// In CI the patch number is the workflow run number, so every deploy gets a new version
// without a version-bump commit; local builds show the version from package.json as is.
function readAppVersion(): string {
  const runNumber = process.env.GITHUB_RUN_NUMBER;
  if (!runNumber) return packageJson.version;

  const [major = '0', minor = '0'] = packageJson.version.split('.');
  return `${major}.${minor}.${runNumber}`;
}

function readBuildCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  base: '/bachata-roadmap/',
  define: {
    __APP_VERSION__: JSON.stringify(readAppVersion()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __BUILD_COMMIT__: JSON.stringify(readBuildCommit()),
  },
  plugins: [
    vue(),
    VueI18nPlugin({
      include: [fileURLToPath(new URL('./src/**/i18n/{ru,en,es}.ts', import.meta.url))],
      runtimeOnly: true,
      compositionOnly: true,
    }),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      injectRegister: false,
      filename: 'sw.js',
      manifest: {
        name: 'Bachata Roadmap',
        short_name: 'Roadmap',
        description: 'Bachata class roadmap with checklists and progress',
        lang: 'en',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#0f0a18',
        background_color: '#0f0a18',
        icons: [{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: 'index.html',
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        importScripts: ['sw-legacy-cleanup.js'],
      },
    }),
  ],
  resolve: { alias: { '@': decodeURIComponent(new URL('./src', import.meta.url).pathname) } },
  test: {
    environment: 'happy-dom',
    include: ['src/**/__tests__/**/*.spec.ts'],
    setupFiles: ['src/app/__tests__/setup-i18n.ts'],
  },
});
