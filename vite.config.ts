import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/bachata-roadmap/',
  plugins: [vue()],
  resolve: { alias: { '@': decodeURIComponent(new URL('./src', import.meta.url).pathname) } },
  test: { environment: 'happy-dom', include: ['src/**/__tests__/**/*.spec.ts'] },
});
