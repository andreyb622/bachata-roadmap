import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/bachata-roadmap/',
  plugins: [
    vue(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      injectRegister: false,
      filename: 'sw.js',
      manifest: {
        name: 'Bachata Roadmap',
        short_name: 'Roadmap',
        description: 'Дорожная карта занятий по бачате с чеклистами и прогрессом',
        lang: 'ru',
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
  test: { environment: 'happy-dom', include: ['src/**/__tests__/**/*.spec.ts'] },
});
