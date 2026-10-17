import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { useToast } from '@/shared/composables/useToast';
import { usePwaUpdate } from '@/modules/pwa';
import { ERROR_CODES } from '@/shared/lib/errors';
import '@/shared/styles/tokens.css';
import '@/shared/styles/base.css';

if (import.meta.env.DEV) {
  const previewTheme = new URLSearchParams(window.location.search).get('theme');
  if (previewTheme === 'light' || previewTheme === 'dark') {
    document.documentElement.dataset.theme = previewTheme;
  }
}

const app = createApp(App);
app.use(createPinia());
app.use(router);

app.config.errorHandler = (err) => {
  console.error(err);
  useToast().showError(err);
};

window.addEventListener('unhandledrejection', (e) => {
  console.error(e.reason);
  useToast().showError(e.reason);
});

document.documentElement.classList.add('js-ready');

try {
  app.mount('#app');
} catch (err) {
  console.error(err);
  useToast().showError(ERROR_CODES.APP_INIT_FAILED);
}

usePwaUpdate();
