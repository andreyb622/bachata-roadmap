import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from '@/app/App.vue';
import { useToast } from '@/shared/composables/useToast';
import {
  getSavedTabIndex,
  initStorage,
  setSavedTabIndex,
  useProfilesStore,
} from '@/modules/profiles';
import { routes } from '@/app/router';

let wrapper: VueWrapper | null = null;

async function mountApp(path: string) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  await router.isReady();
  wrapper = mount(App, { global: { plugins: [pinia, router] }, attachTo: document.body });
  await wrapper.vm.$nextTick();
  return { wrapper, router };
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useToast().clear();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.documentElement.classList.remove('js-ready', 'standalone', 'install-hint-visible');
    useToast().clear();
  });

  it('renders four tabs and selects the saved one', async () => {
    initStorage();
    setSavedTabIndex(1);
    const { wrapper } = await mountApp('/');
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(4);
    expect(wrapper.find('[data-test="tab-1"]').attributes('aria-selected')).toBe('true');
  });

  it('navigates and saves the tab on click', async () => {
    const { wrapper, router } = await mountApp('/program/0');
    await wrapper.find('[data-test="tab-2"]').trigger('click');
    await new Promise((r) => setTimeout(r, 0));
    expect(router.currentRoute.value.fullPath).toBe('/program/2');
    expect(getSavedTabIndex()).toBe(2);
  });

  it('renders the elements page without tabs', async () => {
    const { wrapper, router } = await mountApp('/elements');
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('Элементы по блокам');
    expect(wrapper.text()).toContain('5 модулей · сводный перечень');
    const back = wrapper.find('a[aria-label="Назад к программе"]');
    expect(back.text()).toBe('←');
    await back.trigger('click');
    await new Promise((r) => setTimeout(r, 0));
    expect(router.currentRoute.value.fullPath).toBe('/program/0');
  });

  it('shows a startup message for corrupt storage', async () => {
    localStorage.setItem('bachata-state-v2', '{corrupt');
    await mountApp('/program/0');
    expect(document.body.querySelector('[role="status"]')).not.toBeNull();
  });

  it('menu button click does not throw', async () => {
    const { wrapper } = await mountApp('/program/0');
    await expect(wrapper.find('button[aria-label="Меню"]').trigger('click')).resolves.not.toThrow();
  });

  it('menu button opens the side menu', async () => {
    const { wrapper } = await mountApp('/program/0');
    await wrapper.find('button[aria-label="Меню"]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(document.body.textContent).toContain('Меню');
    expect(document.body.querySelector('aside[role="dialog"]')).not.toBeNull();
  });

  it('returns focus to the menu button after a sheet opened from the menu closes', async () => {
    const { wrapper } = await mountApp('/program/0');
    const menuButton = wrapper.find<HTMLButtonElement>('button[aria-label="Меню"]');
    menuButton.element.focus();
    await menuButton.trigger('click');
    await wrapper.vm.$nextTick();
    const infoItem = document.body.querySelector<HTMLButtonElement>('[data-test="menu-info"]');
    infoItem?.focus();
    infoItem?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(menuButton.element);
  });

  async function openReset(wrapper: VueWrapper) {
    await wrapper.find('button[aria-label="Меню"]').trigger('click');
    await wrapper.vm.$nextTick();
    document.body.querySelector<HTMLButtonElement>('[data-test="menu-reset"]')?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
  }

  it('reset confirm clears only the active progress', async () => {
    const { wrapper } = await mountApp('/program/0');
    const store = useProfilesStore();
    store.toggleItem('item-a');
    const first = store.activeEntityId;
    expect(first).not.toBeNull();
    store.createEntity('Другой');
    store.toggleItem('item-b');
    await openReset(wrapper);
    document.body.querySelector<HTMLButtonElement>('[data-test="confirm-accept"]')?.click();
    await wrapper.vm.$nextTick();
    expect(store.activeProgress).toEqual({});
    expect(useToast().current.value).toBe('Прогресс сброшен');
    store.switchEntity(first ?? '');
    expect(store.activeProgress).toEqual({ 'item-a': true });
  });

  it('reset cancel keeps the progress', async () => {
    const { wrapper } = await mountApp('/program/0');
    const store = useProfilesStore();
    store.toggleItem('item-a');
    await openReset(wrapper);
    document.body.querySelector<HTMLButtonElement>('[data-test="confirm-cancel"]')?.click();
    await wrapper.vm.$nextTick();
    expect(store.activeProgress).toEqual({ 'item-a': true });
  });
});
