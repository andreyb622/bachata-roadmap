import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { useToast } from './composables/useToast';
import { ERROR_CODES } from './lib/errors';
import './styles/tokens.css';
import './styles/base.css';

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
