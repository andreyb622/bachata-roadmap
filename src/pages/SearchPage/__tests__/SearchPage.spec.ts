import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/shared/config/route-names';
import SearchPage from '@/pages/SearchPage/SearchPage.vue';

let wrapper: VueWrapper | null = null;

async function mountPage() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/search', name: ROUTE_NAMES.search, component: SearchPage },
      {
        path: '/program/:period(0|1|2)',
        name: ROUTE_NAMES.program,
        component: { template: '<i />' },
      },
    ],
  });
  await router.push('/search');
  await router.isReady();
  wrapper = mount(SearchPage, { global: { plugins: [pinia, router] }, attachTo: document.body });
  return { wrapper, router };
}

async function type(page: VueWrapper, value: string) {
  await page.find('[data-test="search-input"]').setValue(value);
}

describe('SearchPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.useRealTimers();
  });

  it('shows results only after the debounce elapsed, with a highlighted match', async () => {
    const { wrapper } = await mountPage();
    await type(wrapper, 'перенос');
    expect(wrapper.findAll('[data-test="search-result"]')).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(120);
    expect(wrapper.findAll('[data-test="search-result"]').length).toBeGreaterThan(0);
    expect(wrapper.find('mark').text().toLowerCase()).toBe('перенос');
  });

  it('shows the empty state for an unknown query', async () => {
    const { wrapper } = await mountPage();
    await type(wrapper, 'zzzzqqqq');
    await vi.advanceTimersByTimeAsync(120);
    expect(wrapper.find('[data-test="search-empty"]').text()).toBe('Ничего не найдено');
  });

  it('shows neither list nor empty state for an empty query', async () => {
    const { wrapper } = await mountPage();
    await type(wrapper, '   ');
    await vi.advanceTimersByTimeAsync(120);
    expect(wrapper.find('.search-page__results').exists()).toBe(false);
    expect(wrapper.find('[data-test="search-empty"]').exists()).toBe(false);
  });

  it('opens the program item on click and clears the input', async () => {
    const { wrapper, router } = await mountPage();
    await type(wrapper, 'перенос веса');
    await vi.advanceTimersByTimeAsync(120);
    await wrapper.find('[data-test="search-result"]').trigger('click');
    await flushPromises();
    const route = router.currentRoute.value;
    expect(route.name).toBe(ROUTE_NAMES.program);
    expect(route.params.period).toBe('0');
    expect(route.query.item).toBe('0-0-0');
    expect(wrapper.find<HTMLInputElement>('[data-test="search-input"]').element.value).toBe('');
  });
});
