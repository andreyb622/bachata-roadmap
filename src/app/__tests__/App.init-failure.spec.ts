import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from '@/app/App.vue';
import { useToast } from '@/shared/composables/useToast';
import { ERROR_CODES, getUserMessage } from '@/shared/lib/errors';
import ProgramPage from '@/pages/ProgramPage/ProgramPage.vue';
import { routes } from '@/app/router';

vi.mock('@/modules/profiles', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/profiles')>()),
  useProfilesStore: () => {
    throw new Error('boom');
  },
}));

describe('App init failure', () => {
  afterEach(() => {
    useToast().clear();
    vi.restoreAllMocks();
  });

  it('shows the error subtitle and toast', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useToast().clear();
    const router = createRouter({ history: createMemoryHistory(), routes });
    await router.push('/program/0');
    await router.isReady();
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), router] },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Ошибка загрузки');
    expect(wrapper.findComponent(ProgramPage).exists()).toBe(false);
    expect(document.body.querySelector('[role="status"]')?.textContent).toBe(
      getUserMessage(ERROR_CODES.APP_INIT_FAILED),
    );
    wrapper.unmount();
  });
});
